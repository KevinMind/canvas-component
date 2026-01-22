import React, { useEffect, useRef, useState } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import { useSpring } from 'use-spring';
import Two from 'two.js';

import { TwoProvider, TwoCircle, TwoRect, TwoLine, useTwo } from '../../two-js-react';
import { useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// ElasticRectBend - Rectangle with membrane-like edges
// Edges resist entry (bulge inward) when mouse approaches from outside
// Edges expand outward when mouse approaches from inside
// Tension releases and wobbles back when mouse crosses the edge
// ============================================

interface Position {
  x: number;
  y: number;
}

interface ElasticRectBendProps {
  center: Position;
  width: number;
  height: number;
  reach?: number;            // Interaction aura - how far the membrane senses your cursor
  squish?: number;           // Give - how much it yields to pressure (0-1)
  stretch?: number;          // Pull factor when grabbed
  tension?: number;          // Snap factor - higher = crisper return
  settle?: number;           // Chill factor - higher = less bounce
  weight?: number;           // Heft - higher = more momentum
  showDebug?: boolean;       // Show detection zones and quadrants
  label?: string;            // Text to display on the button (warps with surface)
  fontSize?: number;         // Font size for the label
}

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

// Spring hook for membrane control point
// Pressure > 0: bulge INWARD (mouse outside, approaching edge)
// Pressure < 0: bulge OUTWARD (mouse inside, approaching edge)
// Pressure = 0: return to rest
function useMembranePoint(
  restPoint: Position,
  inwardPoint: Position,  // Where to push when resisting entry (toward center)
  outwardPoint: Position, // Where to push when resisting exit (away from center)
  pressure: number,       // -1 to 1: negative = outward, positive = inward
  springConfig: SpringConfig,
): Position {
  const config = {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
    mass: springConfig.mass,
    decimals: 2,
    teleport: false,
    initialSpeed: 0
  };

  // Interpolate based on signed pressure
  let targetX: number;
  let targetY: number;

  if (pressure > 0) {
    // Positive pressure = push inward
    targetX = restPoint.x + (inwardPoint.x - restPoint.x) * pressure;
    targetY = restPoint.y + (inwardPoint.y - restPoint.y) * pressure;
  } else if (pressure < 0) {
    // Negative pressure = push outward (use absolute value)
    const absPressure = Math.abs(pressure);
    targetX = restPoint.x + (outwardPoint.x - restPoint.x) * absPressure;
    targetY = restPoint.y + (outwardPoint.y - restPoint.y) * absPressure;
  } else {
    // No pressure = rest position
    targetX = restPoint.x;
    targetY = restPoint.y;
  }

  const [xSpring] = useSpring(targetX, config);
  const [ySpring] = useSpring(targetY, config);

  return { x: xSpring, y: ySpring };
}

// Custom component that renders smooth quadratic-like bezier curves
// Uses 4 corner anchors with control handles that bend edges toward mouse
function QuadraticBezierRect({
  vertices,
  controlPoints,
  fill,
  stroke,
  linewidth,
}: {
  vertices: { topLeft: Position; topRight: Position; bottomRight: Position; bottomLeft: Position };
  controlPoints: { top: Position; right: Position; bottom: Position; left: Position };
  fill: string;
  stroke: string;
  linewidth: number;
}) {
  const two = useTwo();
  const pathRef = useRef<any>(null);

  useEffect(() => {
    // Create path with 4 corner anchors
    const path = two.makePath([
      new Two.Anchor(0, 0),
      new Two.Anchor(0, 0),
      new Two.Anchor(0, 0),
      new Two.Anchor(0, 0),
    ]);

    path.position.set(0, 0);
    (path as any).closed = true;
    // Enable manual bezier control
    (path as any).curved = true;
    (path as any).automatic = false;
    pathRef.current = path;

    return () => {
      path.remove();
    };
  }, [two]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const anchors = path.vertices;
    const { topLeft, topRight, bottomRight, bottomLeft } = vertices;
    const { top: cpTop, right: cpRight, bottom: cpBottom, left: cpLeft } = controlPoints;

    // Update corner positions
    anchors[0].set(topLeft.x, topLeft.y);
    anchors[1].set(topRight.x, topRight.y);
    anchors[2].set(bottomRight.x, bottomRight.y);
    anchors[3].set(bottomLeft.x, bottomLeft.y);

    // Set command type to curve for all anchors
    anchors[0].command = Two.Commands.curve;
    anchors[1].command = Two.Commands.curve;
    anchors[2].command = Two.Commands.curve;
    anchors[3].command = Two.Commands.curve;

    // For quadratic-like bezier: control handles point toward the edge control point
    // Controls are RELATIVE to anchor position

    // Top-Left corner (anchor 0):
    // - outgoing (right) goes toward top edge control point
    // - incoming (left) comes from left edge control point
    anchors[0].controls.right.set(
      (cpTop.x - topLeft.x) * 0.66,
      (cpTop.y - topLeft.y) * 0.66
    );
    anchors[0].controls.left.set(
      (cpLeft.x - topLeft.x) * 0.66,
      (cpLeft.y - topLeft.y) * 0.66
    );

    // Top-Right corner (anchor 1):
    // - outgoing (right) goes toward right edge control point
    // - incoming (left) comes from top edge control point
    anchors[1].controls.left.set(
      (cpTop.x - topRight.x) * 0.66,
      (cpTop.y - topRight.y) * 0.66
    );
    anchors[1].controls.right.set(
      (cpRight.x - topRight.x) * 0.66,
      (cpRight.y - topRight.y) * 0.66
    );

    // Bottom-Right corner (anchor 2):
    // - outgoing (right) goes toward bottom edge control point
    // - incoming (left) comes from right edge control point
    anchors[2].controls.left.set(
      (cpRight.x - bottomRight.x) * 0.66,
      (cpRight.y - bottomRight.y) * 0.66
    );
    anchors[2].controls.right.set(
      (cpBottom.x - bottomRight.x) * 0.66,
      (cpBottom.y - bottomRight.y) * 0.66
    );

    // Bottom-Left corner (anchor 3):
    // - outgoing (right) goes toward left edge control point
    // - incoming (left) comes from bottom edge control point
    anchors[3].controls.left.set(
      (cpBottom.x - bottomLeft.x) * 0.66,
      (cpBottom.y - bottomLeft.y) * 0.66
    );
    anchors[3].controls.right.set(
      (cpLeft.x - bottomLeft.x) * 0.66,
      (cpLeft.y - bottomLeft.y) * 0.66
    );

    path.fill = fill;
    path.stroke = stroke;
    path.linewidth = linewidth;
  }, [vertices, controlPoints, fill, stroke, linewidth]);

  return null;
}

// ============================================
// WarpedText - Text that warps along bezier surface
// ============================================

interface WarpedTextProps {
  text: string;
  fontSize: number;
  vertices: { topLeft: Position; topRight: Position; bottomRight: Position; bottomLeft: Position };
  controlPoints: { top: Position; right: Position; bottom: Position; left: Position };
  color?: string;
  gridSize?: number; // Number of subdivisions for the mesh
}

// Sample a point on a quadratic bezier curve
function sampleBezier(p0: Position, control: Position, p1: Position, t: number): Position {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * control.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * control.y + t * t * p1.y,
  };
}

// Linear interpolation between two points
function lerp(a: Position, b: Position, t: number): Position {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

// Calculate warped position on the bezier surface
// u: horizontal position (0 = left, 1 = right)
// v: vertical position (0 = top, 1 = bottom)
function getWarpedPoint(
  u: number,
  v: number,
  vertices: { topLeft: Position; topRight: Position; bottomRight: Position; bottomLeft: Position },
  controlPoints: { top: Position; right: Position; bottom: Position; left: Position }
): Position {
  const { topLeft, topRight, bottomRight, bottomLeft } = vertices;
  const { top: cpTop, right: cpRight, bottom: cpBottom, left: cpLeft } = controlPoints;

  // Sample top edge (bezier from topLeft through cpTop to topRight)
  const topPoint = sampleBezier(topLeft, cpTop, topRight, u);

  // Sample bottom edge (bezier from bottomLeft through cpBottom to bottomRight)
  const bottomPoint = sampleBezier(bottomLeft, cpBottom, bottomRight, u);

  // Sample left edge (bezier from topLeft through cpLeft to bottomLeft)
  const leftPoint = sampleBezier(topLeft, cpLeft, bottomLeft, v);

  // Sample right edge (bezier from topRight through cpRight to bottomRight)
  const rightPoint = sampleBezier(topRight, cpRight, bottomRight, v);

  // Bilinear interpolation with bezier influence
  // Blend horizontal edges (top/bottom) vertically
  const horizontalBlend = lerp(topPoint, bottomPoint, v);

  // Blend vertical edges (left/right) horizontally
  const verticalBlend = lerp(leftPoint, rightPoint, u);

  // Combine both blends and subtract the bilinear corner interpolation
  // to avoid double-counting corners
  const cornerInterp = {
    x: (1-u)*(1-v)*topLeft.x + u*(1-v)*topRight.x + u*v*bottomRight.x + (1-u)*v*bottomLeft.x,
    y: (1-u)*(1-v)*topLeft.y + u*(1-v)*topRight.y + u*v*bottomRight.y + (1-u)*v*bottomLeft.y,
  };

  return {
    x: horizontalBlend.x + verticalBlend.x - cornerInterp.x,
    y: horizontalBlend.y + verticalBlend.y - cornerInterp.y,
  };
}

// Component that renders text warped along the bezier surface
// Uses Two.js paths with colors sampled from high-res text texture
function WarpedText({
  text,
  fontSize,
  vertices,
  controlPoints,
  color = 'white',
  gridSize = 80, // Higher = smoother but more objects
}: WarpedTextProps) {
  const two = useTwo();
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const meshRef = useRef<any[]>([]);

  // Create offscreen canvas and render text once
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render text at 4x resolution for quality
    const scale = 4;
    const scaledFontSize = fontSize * scale;

    ctx.font = `bold ${scaledFontSize}px sans-serif`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = scaledFontSize * 1.2;

    canvas.width = Math.ceil(textWidth) + 16 * scale;
    canvas.height = Math.ceil(textHeight) + 16 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `bold ${scaledFontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    // Store the image data for fast pixel sampling
    imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    textCanvasRef.current = canvas;

    return () => {
      textCanvasRef.current = null;
      imageDataRef.current = null;
    };
  }, [text, fontSize, color]);

  // Create mesh cells
  useEffect(() => {
    meshRef.current.forEach(cell => cell.remove());
    meshRef.current = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const path = two.makePath([
          new Two.Anchor(0, 0),
          new Two.Anchor(0, 0),
          new Two.Anchor(0, 0),
          new Two.Anchor(0, 0),
        ]);
        path.position.set(0, 0);
        (path as any).closed = true;
        path.noStroke();
        meshRef.current.push(path);
      }
    }

    return () => {
      meshRef.current.forEach(cell => cell.remove());
      meshRef.current = [];
    };
  }, [two, gridSize]);

  // Update mesh positions directly (not in useEffect to ensure every frame updates)
  const imageData = imageDataRef.current;
  if (imageData && meshRef.current.length > 0) {
    const { width: texW, height: texH, data } = imageData;

    // Helper to sample pixel with bilinear filtering
    const samplePixel = (u: number, v: number): [number, number, number, number] => {
      const x = u * (texW - 1);
      const y = v * (texH - 1);
      const x0 = Math.floor(x);
      const y0 = Math.floor(y);
      const x1 = Math.min(x0 + 1, texW - 1);
      const y1 = Math.min(y0 + 1, texH - 1);
      const fx = x - x0;
      const fy = y - y0;

      const getPixel = (px: number, py: number) => {
        const i = (py * texW + px) * 4;
        return [data[i], data[i + 1], data[i + 2], data[i + 3]];
      };

      const p00 = getPixel(x0, y0);
      const p10 = getPixel(x1, y0);
      const p01 = getPixel(x0, y1);
      const p11 = getPixel(x1, y1);

      // Bilinear interpolation
      const r = p00[0] * (1-fx) * (1-fy) + p10[0] * fx * (1-fy) + p01[0] * (1-fx) * fy + p11[0] * fx * fy;
      const g = p00[1] * (1-fx) * (1-fy) + p10[1] * fx * (1-fy) + p01[1] * (1-fx) * fy + p11[1] * fx * fy;
      const b = p00[2] * (1-fx) * (1-fy) + p10[2] * fx * (1-fy) + p01[2] * (1-fx) * fy + p11[2] * fx * fy;
      const a = p00[3] * (1-fx) * (1-fy) + p10[3] * fx * (1-fy) + p01[3] * (1-fx) * fy + p11[3] * fx * fy;

      return [Math.round(r), Math.round(g), Math.round(b), Math.round(a)];
    };

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellIndex = row * gridSize + col;
        const path = meshRef.current[cellIndex];
        if (!path) continue;

        const u0 = col / gridSize;
        const u1 = (col + 1) / gridSize;
        const v0 = row / gridSize;
        const v1 = (row + 1) / gridSize;

        // Get warped corner positions
        const p00 = getWarpedPoint(u0, v0, vertices, controlPoints);
        const p10 = getWarpedPoint(u1, v0, vertices, controlPoints);
        const p11 = getWarpedPoint(u1, v1, vertices, controlPoints);
        const p01 = getWarpedPoint(u0, v1, vertices, controlPoints);

        path.vertices[0].set(p00.x, p00.y);
        path.vertices[1].set(p10.x, p10.y);
        path.vertices[2].set(p11.x, p11.y);
        path.vertices[3].set(p01.x, p01.y);
      }
    }
  }

  // Set colors once when texture is ready (doesn't need to update every frame)
  const colorsSetRef = useRef(false);
  useEffect(() => {
    const imageData = imageDataRef.current;
    if (!imageData || colorsSetRef.current || meshRef.current.length === 0) return;

    const { width: texW, height: texH, data } = imageData;

    const samplePixel = (u: number, v: number): [number, number, number, number] => {
      const x = Math.floor(u * (texW - 1));
      const y = Math.floor(v * (texH - 1));
      const i = (y * texW + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellIndex = row * gridSize + col;
        const path = meshRef.current[cellIndex];
        if (!path) continue;

        const u = (col + 0.5) / gridSize;
        const v = (row + 0.5) / gridSize;
        const [r, g, b, a] = samplePixel(u, v);

        if (a > 5) {
          path.fill = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
          path.visible = true;
        } else {
          path.visible = false;
        }
      }
    }
    colorsSetRef.current = true;
  }, [gridSize]);

  return null;
}

// Wrapper that spring-animates the text sway back to center when released
function WarpedTextWithSpring({
  text,
  fontSize,
  vertices,
  controlPoints,
  center,
  hasActivePressure,
  springConfig,
}: {
  text: string;
  fontSize: number;
  vertices: { topLeft: Position; topRight: Position; bottomRight: Position; bottomLeft: Position };
  controlPoints: { top: Position; right: Position; bottom: Position; left: Position };
  center: Position;
  hasActivePressure: boolean;
  springConfig: SpringConfig;
}) {
  // Spring-animate the sway position (X for top/bottom, Y for left/right)
  // When active: follow mouse. When inactive: return to center.
  const targetSwayX = hasActivePressure ? controlPoints.top.x : center.x;
  const targetSwayY = hasActivePressure ? controlPoints.right.y : center.y;

  const springOpts = {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
    mass: springConfig.mass,
    decimals: 2,
  };

  const [swayX] = useSpring(targetSwayX, springOpts);
  const [swayY] = useSpring(targetSwayY, springOpts);

  const textControlPoints = {
    top: { x: swayX, y: controlPoints.top.y },
    right: { x: controlPoints.right.x, y: swayY },
    bottom: { x: swayX, y: controlPoints.bottom.y },
    left: { x: controlPoints.left.x, y: swayY },
  };

  return (
    <WarpedText
      text={text}
      fontSize={fontSize}
      vertices={vertices}
      controlPoints={textControlPoints}
      color="white"
      gridSize={100}
    />
  );
}

// Membrane state: tracks whether we're "inside" or "outside" the membrane
type MembraneState = 'outside' | 'inside';

// Easing function for natural pressure curve
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function ElasticRectBendDemo({
  center,
  width,
  height,
  reach = 40,
  squish = 0.8,
  stretch = 2.5,
  tension = 280,
  settle = 18,
  weight = 1.2,
  showDebug = false,
  label,
  fontSize = 24,
}: ElasticRectBendProps) {
  const [mouseX, mouseY] = useMousePos();

  // Track membrane state: are we "inside" (entered through inner) or "outside" (exited through outer)
  const [membraneState, setMembraneState] = useState<MembraneState>('outside');

  // Track grab state: true when mouse is pressed inside the visible rectangle
  const [isGrabbed, setIsGrabbed] = useState(false);
  const mouseDownInsideRef = useRef(false);

  // Spring configuration for membrane behavior
  const normalSpringConfig: SpringConfig = { stiffness: tension, damping: settle, mass: weight };
  // Taut config only for engaged edge when grabbed (no wobble on the stretched edge)
  const tautSpringConfig: SpringConfig = { stiffness: 800, damping: 80, mass: 0.1 };

  // Calculate corner positions (needed early for grab detection)
  const halfW = width / 2;
  const halfH = height / 2;

  // Track grab state via mouse events
  useEffect(() => {
    const handleMouseDown = () => {
      // Check if mouse is inside visible rectangle
      const insideX = mouseX > center.x - halfW && mouseX < center.x + halfW;
      const insideY = mouseY > center.y - halfH && mouseY < center.y + halfH;
      if (insideX && insideY) {
        mouseDownInsideRef.current = true;
        setIsGrabbed(true);
      }
    };

    const handleMouseUp = () => {
      mouseDownInsideRef.current = false;
      setIsGrabbed(false);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY, center.x, center.y, halfW, halfH]);

  // Outer rectangle (visible boundary)
  const vertices = {
    topLeft: { x: center.x - halfW, y: center.y - halfH },
    topRight: { x: center.x + halfW, y: center.y - halfH },
    bottomRight: { x: center.x + halfW, y: center.y + halfH },
    bottomLeft: { x: center.x - halfW, y: center.y + halfH },
  };

  // Inner rectangle (tension release zone - smaller)
  const innerVertices = {
    topLeft: { x: center.x - halfW + reach, y: center.y - halfH + reach },
    topRight: { x: center.x + halfW - reach, y: center.y - halfH + reach },
    bottomRight: { x: center.x + halfW - reach, y: center.y + halfH - reach },
    bottomLeft: { x: center.x - halfW + reach, y: center.y + halfH - reach },
  };

  // Outer detection zone (larger than visible rect)
  const outerVertices = {
    topLeft: { x: center.x - halfW - reach, y: center.y - halfH - reach },
    topRight: { x: center.x + halfW + reach, y: center.y - halfH - reach },
    bottomRight: { x: center.x + halfW + reach, y: center.y + halfH + reach },
    bottomLeft: { x: center.x - halfW - reach, y: center.y + halfH + reach },
  };

  // Mouse position along each edge (clamped to edge bounds)
  const clampedMouseX = Math.max(center.x - halfW, Math.min(center.x + halfW, mouseX));
  const clampedMouseY = Math.max(center.y - halfH, Math.min(center.y + halfH, mouseY));

  // Bezier curves don't reach their control points - they bend toward them.
  // To make the curve peak actually touch the boundary, we overshoot the control point.
  // The 0.66 factor in bezier handles + curve math means we reach ~50% of target distance.
  // So we multiply by ~2 to compensate.
  const bezierCompensation = 2.0;
  const stretchFactor = isGrabbed ? stretch : 1;

  // Check position relative to the three rectangles
  const outer = outerVertices;
  const visible = vertices;
  const inner = innerVertices;

  const insideOuter = mouseX > outer.topLeft.x && mouseX < outer.topRight.x &&
                      mouseY > outer.topLeft.y && mouseY < outer.bottomLeft.y;
  const insideVisible = mouseX > visible.topLeft.x && mouseX < visible.topRight.x &&
                        mouseY > visible.topLeft.y && mouseY < visible.bottomLeft.y;
  const insideInner = mouseX > inner.topLeft.x && mouseX < inner.topRight.x &&
                      mouseY > inner.topLeft.y && mouseY < inner.bottomLeft.y;

  // State transitions
  useEffect(() => {
    if (membraneState === 'outside' && insideInner) {
      // Entered through inner boundary - now "inside"
      setMembraneState('inside');
    } else if (membraneState === 'inside' && !insideOuter) {
      // Exited through outer boundary - now "outside"
      setMembraneState('outside');
    }
  }, [mouseX, mouseY, insideOuter, insideInner, membraneState]);

  // Calculate pressure for grabbed state - stretches toward mouse position
  // Returns pressure from 0 (at visible edge) to -1 (at stretch zone edge)
  function getGrabbedPressure(edge: 'top' | 'right' | 'bottom' | 'left'): number {
    const stretchDistance = reach * stretch;

    switch (edge) {
      case 'top': {
        const edgeY = visible.topLeft.y;
        const maxStretchY = edgeY - stretchDistance;
        if (mouseY >= edgeY) return 0;
        const distance = edgeY - mouseY;
        return -Math.min(1, distance / stretchDistance);
      }
      case 'bottom': {
        const edgeY = visible.bottomLeft.y;
        const maxStretchY = edgeY + stretchDistance;
        if (mouseY <= edgeY) return 0;
        const distance = mouseY - edgeY;
        return -Math.min(1, distance / stretchDistance);
      }
      case 'left': {
        const edgeX = visible.topLeft.x;
        const maxStretchX = edgeX - stretchDistance;
        if (mouseX >= edgeX) return 0;
        const distance = edgeX - mouseX;
        return -Math.min(1, distance / stretchDistance);
      }
      case 'right': {
        const edgeX = visible.topRight.x;
        const maxStretchX = edgeX + stretchDistance;
        if (mouseX <= edgeX) return 0;
        const distance = mouseX - edgeX;
        return -Math.min(1, distance / stretchDistance);
      }
    }
    return 0;
  }

  // Calculate pressure for each edge based on current state
  // Pressure is PROGRESSIVE - increases as mouse moves deeper into the membrane zone
  // When "outside" (entering): pressure goes from 0 (at outer) to 1 (at inner)
  // When "inside" (exiting): pressure goes from 0 (at inner) to -1 (at outer)
  function getEdgePressure(edge: 'top' | 'right' | 'bottom' | 'left'): number {
    // When grabbed, use special stretch logic that ignores normal zone limits
    if (isGrabbed) {
      return getGrabbedPressure(edge);
    }

    const inHorizontalBounds = mouseX > outer.topLeft.x && mouseX < outer.topRight.x;
    const inVerticalBounds = mouseY > outer.topLeft.y && mouseY < outer.bottomLeft.y;

    if (membraneState === 'outside') {
      // ENTERING: progressive INWARD pressure from outer to inner
      if (!insideOuter) return 0;
      if (insideInner) return 0;

      // Calculate progress through membrane zone (0 at outer, 1 at inner)
      switch (edge) {
        case 'top':
          if (!inHorizontalBounds || mouseY < outer.topLeft.y || mouseY >= inner.topLeft.y) return 0;
          return (mouseY - outer.topLeft.y) / (inner.topLeft.y - outer.topLeft.y);
        case 'bottom':
          if (!inHorizontalBounds || mouseY > outer.bottomLeft.y || mouseY <= inner.bottomLeft.y) return 0;
          return (outer.bottomLeft.y - mouseY) / (outer.bottomLeft.y - inner.bottomLeft.y);
        case 'left':
          if (!inVerticalBounds || mouseX < outer.topLeft.x || mouseX >= inner.topLeft.x) return 0;
          return (mouseX - outer.topLeft.x) / (inner.topLeft.x - outer.topLeft.x);
        case 'right':
          if (!inVerticalBounds || mouseX > outer.topRight.x || mouseX <= inner.topRight.x) return 0;
          return (outer.topRight.x - mouseX) / (outer.topRight.x - inner.topRight.x);
      }
    } else {
      // EXITING: progressive OUTWARD pressure from inner to outer
      if (insideInner) return 0;
      if (!insideOuter) return 0;

      // Calculate progress through membrane zone (0 at inner, -1 at outer)
      switch (edge) {
        case 'top':
          if (!inHorizontalBounds || mouseY < outer.topLeft.y || mouseY >= inner.topLeft.y) return 0;
          return -((inner.topLeft.y - mouseY) / (inner.topLeft.y - outer.topLeft.y));
        case 'bottom':
          if (!inHorizontalBounds || mouseY > outer.bottomLeft.y || mouseY <= inner.bottomLeft.y) return 0;
          return -((mouseY - inner.bottomLeft.y) / (outer.bottomLeft.y - inner.bottomLeft.y));
        case 'left':
          if (!inVerticalBounds || mouseX < outer.topLeft.x || mouseX >= inner.topLeft.x) return 0;
          return -((inner.topLeft.x - mouseX) / (inner.topLeft.x - outer.topLeft.x));
        case 'right':
          if (!inVerticalBounds || mouseX > outer.topRight.x || mouseX <= inner.topRight.x) return 0;
          return -((mouseX - inner.topRight.x) / (outer.topRight.x - inner.topRight.x));
      }
    }
    return 0;
  }

  // Apply easing to pressure while preserving sign
  const applyEasing = (p: number) => {
    const sign = p < 0 ? -1 : 1;
    return sign * easeOutCubic(Math.abs(p));
  };

  // Get raw pressure for each edge (with easing applied for natural feel)
  const rawPressure = {
    top: applyEasing(getEdgePressure('top')),
    right: applyEasing(getEdgePressure('right')),
    bottom: applyEasing(getEdgePressure('bottom')),
    left: applyEasing(getEdgePressure('left')),
  };

  // When applying pressure, only bend ONE edge (the one with highest pressure)
  // Springs will handle multiple edges releasing simultaneously
  const maxEdge = (['top', 'right', 'bottom', 'left'] as const).reduce((max, edge) => {
    return Math.abs(rawPressure[edge]) > Math.abs(rawPressure[max]) ? edge : max;
  }, 'top' as const);

  const pressure = {
    top: maxEdge === 'top' ? rawPressure.top : 0,
    right: maxEdge === 'right' ? rawPressure.right : 0,
    bottom: maxEdge === 'bottom' ? rawPressure.bottom : 0,
    left: maxEdge === 'left' ? rawPressure.left : 0,
  };

  // Edge control points - all edges follow mouse position for natural sway
  // Each control point tracks mouse along its edge axis
  const edgeMidpoints = {
    top: { x: clampedMouseX, y: center.y - halfH },
    right: { x: center.x + halfW, y: clampedMouseY },
    bottom: { x: clampedMouseX, y: center.y + halfH },
    left: { x: center.x - halfW, y: clampedMouseY },
  };

  const inwardPoints = {
    top: { x: clampedMouseX, y: center.y - halfH + reach * squish * bezierCompensation },
    right: { x: center.x + halfW - reach * squish * bezierCompensation, y: clampedMouseY },
    bottom: { x: clampedMouseX, y: center.y + halfH - reach * squish * bezierCompensation },
    left: { x: center.x - halfW + reach * squish * bezierCompensation, y: clampedMouseY },
  };

  const outwardPoints = {
    top: { x: clampedMouseX, y: center.y - halfH - reach * squish * bezierCompensation * stretchFactor },
    right: { x: center.x + halfW + reach * squish * bezierCompensation * stretchFactor, y: clampedMouseY },
    bottom: { x: clampedMouseX, y: center.y + halfH + reach * squish * bezierCompensation * stretchFactor },
    left: { x: center.x - halfW - reach * squish * bezierCompensation * stretchFactor, y: clampedMouseY },
  };

  // Animated control points with membrane behavior (raw spring output)
  // Only the engaged edge uses taut config when grabbed; others use normal config
  const getSpringConfig = (edge: 'top' | 'right' | 'bottom' | 'left') => {
    if (isGrabbed && maxEdge === edge) return tautSpringConfig;
    return normalSpringConfig;
  };

  const rawControlPoints = {
    top: useMembranePoint(edgeMidpoints.top, inwardPoints.top, outwardPoints.top, pressure.top, getSpringConfig('top')),
    right: useMembranePoint(edgeMidpoints.right, inwardPoints.right, outwardPoints.right, pressure.right, getSpringConfig('right')),
    bottom: useMembranePoint(edgeMidpoints.bottom, inwardPoints.bottom, outwardPoints.bottom, pressure.bottom, getSpringConfig('bottom')),
    left: useMembranePoint(edgeMidpoints.left, inwardPoints.left, outwardPoints.left, pressure.left, getSpringConfig('left')),
  };

  // Clamp control points to rectangle bounds to prevent "narrow band" artifacts
  // Top/bottom: clamp X to [left edge, right edge]
  // Left/right: clamp Y to [top edge, bottom edge]
  const controlPoints = {
    top: {
      x: Math.max(center.x - halfW, Math.min(center.x + halfW, rawControlPoints.top.x)),
      y: rawControlPoints.top.y, // Y is the membrane deformation - don't clamp
    },
    right: {
      x: rawControlPoints.right.x, // X is the membrane deformation - don't clamp
      y: Math.max(center.y - halfH, Math.min(center.y + halfH, rawControlPoints.right.y)),
    },
    bottom: {
      x: Math.max(center.x - halfW, Math.min(center.x + halfW, rawControlPoints.bottom.x)),
      y: rawControlPoints.bottom.y, // Y is the membrane deformation - don't clamp
    },
    left: {
      x: rawControlPoints.left.x, // X is the membrane deformation - don't clamp
      y: Math.max(center.y - halfH, Math.min(center.y + halfH, rawControlPoints.left.y)),
    },
  };

  // Calculate inner rectangle dimensions for TwoRect (which uses center + width/height)
  const innerWidth = width - reach * 2;
  const innerHeight = height - reach * 2;
  const outerWidth = width + reach * 2;
  const outerHeight = height + reach * 2;

  // Stretch zone dimensions (how far it can stretch when grabbed)
  const stretchZoneWidth = width + reach * 2 * stretch;
  const stretchZoneHeight = height + reach * 2 * stretch;

  // Determine fill color based on hover/pressed state
  const getFillColor = () => {
    if (isGrabbed) return "rgba(100, 180, 255, 0.9)"; // Blue when pressed/grabbed
    if (insideVisible) return "rgba(80, 80, 80, 0.9)"; // Lighter when hovered
    return "rgba(60, 60, 60, 0.8)"; // Default
  };

  const getStrokeColor = () => {
    if (isGrabbed) return "rgba(60, 140, 220, 1)"; // Blue stroke when grabbed
    if (insideVisible) return "rgba(100, 100, 100, 1)"; // Lighter stroke when hovered
    return "rgba(40, 40, 40, 1)"; // Default
  };

  return (
    <TwoProvider width={500} height={500} type="canvas">
      {/* Debug: Stretch zone (how far it can stretch when grabbed) */}
      {showDebug && (
        <TwoRect
          x={center.x}
          y={center.y}
          width={stretchZoneWidth}
          height={stretchZoneHeight}
          fill="transparent"
          stroke={isGrabbed ? "rgba(255, 200, 100, 0.8)" : "rgba(255, 200, 100, 0.3)"}
          linewidth={isGrabbed ? 3 : 1}
        />
      )}

      {/* Debug: Outer detection zone (where inward pressure starts) */}
      {showDebug && (
        <TwoRect
          x={center.x}
          y={center.y}
          width={outerWidth}
          height={outerHeight}
          fill="transparent"
          stroke="rgba(255, 100, 100, 0.5)"
          linewidth={2}
        />
      )}

      {/* Debug: Inner release zone - color changes based on state */}
      {/* Green = "inside" (entered), Blue = "outside" (not yet entered or exited) */}
      {showDebug && innerWidth > 0 && innerHeight > 0 && (
        <TwoRect
          x={center.x}
          y={center.y}
          width={innerWidth}
          height={innerHeight}
          fill={membraneState === 'inside' ? "rgba(100, 255, 100, 0.3)" : "rgba(100, 100, 255, 0.1)"}
          stroke={membraneState === 'inside' ? "rgba(100, 255, 100, 0.8)" : "rgba(100, 100, 255, 0.5)"}
          linewidth={2}
        />
      )}

      {/* Debug: Quadrant dividers */}
      {showDebug && (
        <>
          {/* Vertical center line */}
          <TwoLine
            x1={center.x}
            y1={outerVertices.topLeft.y}
            x2={center.x}
            y2={outerVertices.bottomLeft.y}
            stroke="rgba(255, 255, 255, 0.2)"
            linewidth={1}
          />
          {/* Horizontal center line */}
          <TwoLine
            x1={outerVertices.topLeft.x}
            y1={center.y}
            x2={outerVertices.topRight.x}
            y2={center.y}
            stroke="rgba(255, 255, 255, 0.2)"
            linewidth={1}
          />
        </>
      )}

      {/* Main elastic rect with quadratic bezier curves */}
      {/* Color changes on hover (lighter) and grab (blue) */}
      <QuadraticBezierRect
        vertices={vertices}
        controlPoints={controlPoints}
        fill={getFillColor()}
        stroke={getStrokeColor()}
        linewidth={2}
      />

      {/* Warped text label that follows the bezier surface */}
      {label && (
        <WarpedTextWithSpring
          text={label}
          fontSize={fontSize}
          vertices={vertices}
          controlPoints={controlPoints}
          center={center}
          hasActivePressure={isGrabbed ||
            Math.abs(rawPressure.top) > 0.01 ||
            Math.abs(rawPressure.right) > 0.01 ||
            Math.abs(rawPressure.bottom) > 0.01 ||
            Math.abs(rawPressure.left) > 0.01}
          springConfig={normalSpringConfig}
        />
      )}

      {/* Debug: show control points */}
      {showDebug && (
        <>
          <TwoCircle x={controlPoints.top.x} y={controlPoints.top.y} radius={4} fill="rgba(255, 100, 100, 0.8)" />
          <TwoCircle x={controlPoints.right.x} y={controlPoints.right.y} radius={4} fill="rgba(100, 255, 100, 0.8)" />
          <TwoCircle x={controlPoints.bottom.x} y={controlPoints.bottom.y} radius={4} fill="rgba(100, 100, 255, 0.8)" />
          <TwoCircle x={controlPoints.left.x} y={controlPoints.left.y} radius={4} fill="rgba(255, 255, 100, 0.8)" />
        </>
      )}

      {/* Debug: Corner markers */}
      {showDebug && (
        <>
          <TwoCircle x={vertices.topLeft.x} y={vertices.topLeft.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
          <TwoCircle x={vertices.topRight.x} y={vertices.topRight.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
          <TwoCircle x={vertices.bottomRight.x} y={vertices.bottomRight.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
          <TwoCircle x={vertices.bottomLeft.x} y={vertices.bottomLeft.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
        </>
      )}
    </TwoProvider>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta<ElasticRectBendProps> = {
  title: 'Interactive/Elastic Rect Bend',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 50, max: 400, step: 10 },
      description: 'Width of the rectangle',
    },
    height: {
      control: { type: 'range', min: 50, max: 400, step: 10 },
      description: 'Height of the rectangle',
    },
    reach: {
      control: { type: 'range', min: 15, max: 80, step: 5 },
      description: 'Interaction aura - how far the membrane senses your cursor',
    },
    squish: {
      control: { type: 'range', min: 0.2, max: 1.0, step: 0.05 },
      description: 'Give - how much it yields to pressure',
    },
    stretch: {
      control: { type: 'range', min: 1, max: 6, step: 0.5 },
      description: 'Pull factor when grabbed',
    },
    tension: {
      control: { type: 'range', min: 50, max: 500, step: 10 },
      description: 'Snap factor - higher = crisper return',
    },
    settle: {
      control: { type: 'range', min: 5, max: 40, step: 1 },
      description: 'Chill factor - higher = less bounce',
    },
    weight: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.1 },
      description: 'Heft - higher = more momentum',
    },
    showDebug: {
      control: 'boolean',
      description: 'Show detection zones: red = outer (inward pressure), green = inner (release zone)',
    },
    label: {
      control: 'text',
      description: 'Text to display on the button (warps with surface)',
    },
    fontSize: {
      control: { type: 'range', min: 12, max: 48, step: 2 },
      description: 'Font size for the label',
    },
  },
};

export default meta;

type ElasticRectBendStory = StoryObj<ElasticRectBendProps>;

// Soft - Gentle, approachable
export const Soft: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    tension: 200,
    settle: 14,
    weight: 1.5,
    reach: 45,
    squish: 0.9,
    showDebug: false,
    label: 'SOFT',
    fontSize: 24,
  },
};

// Taut - Crisp, responsive
export const Taut: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    tension: 400,
    settle: 28,
    weight: 0.8,
    reach: 30,
    squish: 0.5,
    label: 'TAUT',
  },
};

// Jelly - Playful, bouncy
export const Jelly: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    tension: 150,
    settle: 6,
    weight: 2.5,
    reach: 55,
    squish: 1.0,
    label: 'JELLY',
  },
};

// Gooey - Thick, viscous
export const Gooey: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    tension: 80,
    settle: 10,
    weight: 4,
    reach: 70,
    squish: 1.0,
    label: 'GOOEY',
  },
};

// Glass - Minimal deformation, subtle
export const Glass: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    tension: 500,
    settle: 35,
    weight: 0.5,
    reach: 25,
    squish: 0.3,
    label: 'GLASS',
  },
};

export const DebugView: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    reach: 40,
    squish: 0.8,
    tension: 280,
    settle: 18,
    weight: 1.2,
    showDebug: true,
  },
};

export const WarpedTextDemo: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 280,
    height: 120,
    reach: 50,
    squish: 1.0,
    stretch: 3,
    tension: 150,
    settle: 10,
    weight: 2,
    showDebug: false,
    label: 'ELASTIC',
    fontSize: 36,
  },
};

export const ButtonWithLabel: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 160,
    height: 60,
    reach: 30,
    squish: 0.8,
    stretch: 2,
    tension: 200,
    settle: 15,
    weight: 1.5,
    showDebug: false,
    label: 'Submit',
    fontSize: 20,
  },
};
