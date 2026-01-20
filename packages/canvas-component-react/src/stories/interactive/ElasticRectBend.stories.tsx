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
  buffer?: number;      // Thickness of membrane zone (extends both outside and inside the edge)
  resistance?: number;  // How far curve extends to boundaries (0-1, 1 = full extent)
  stiffness?: number;   // Spring tension - higher = snappier return
  damping?: number;     // How quickly wobble dies - lower = more bouncy
  mass?: number;        // Inertia - higher = more wobble/momentum
  showDebug?: boolean;  // Show detection zones and quadrants
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

// Membrane state: tracks whether we're "inside" or "outside" the membrane
type MembraneState = 'outside' | 'inside';

function ElasticRectBendDemo({
  center,
  width,
  height,
  buffer = 60,
  resistance = 0.4,
  stiffness = 180,
  damping = 12,
  mass = 2,
  showDebug = false,
}: ElasticRectBendProps) {
  const [mouseX, mouseY] = useMousePos();

  // Track membrane state: are we "inside" (entered through inner) or "outside" (exited through outer)
  const [membraneState, setMembraneState] = useState<MembraneState>('outside');

  // Spring configuration for membrane behavior
  const springConfig: SpringConfig = { stiffness, damping, mass };

  // Calculate corner positions
  const halfW = width / 2;
  const halfH = height / 2;

  // Outer rectangle (visible boundary)
  const vertices = {
    topLeft: { x: center.x - halfW, y: center.y - halfH },
    topRight: { x: center.x + halfW, y: center.y - halfH },
    bottomRight: { x: center.x + halfW, y: center.y + halfH },
    bottomLeft: { x: center.x - halfW, y: center.y + halfH },
  };

  // Inner rectangle (tension release zone - smaller)
  const innerVertices = {
    topLeft: { x: center.x - halfW + buffer, y: center.y - halfH + buffer },
    topRight: { x: center.x + halfW - buffer, y: center.y - halfH + buffer },
    bottomRight: { x: center.x + halfW - buffer, y: center.y + halfH - buffer },
    bottomLeft: { x: center.x - halfW + buffer, y: center.y + halfH - buffer },
  };

  // Outer detection zone (larger than visible rect)
  const outerVertices = {
    topLeft: { x: center.x - halfW - buffer, y: center.y - halfH - buffer },
    topRight: { x: center.x + halfW + buffer, y: center.y - halfH - buffer },
    bottomRight: { x: center.x + halfW + buffer, y: center.y + halfH + buffer },
    bottomLeft: { x: center.x - halfW - buffer, y: center.y + halfH + buffer },
  };

  // Edge midpoints (rest positions)
  const edgeMidpoints = {
    top: { x: center.x, y: center.y - halfH },
    right: { x: center.x + halfW, y: center.y },
    bottom: { x: center.x, y: center.y + halfH },
    left: { x: center.x - halfW, y: center.y },
  };

  // Bezier curves don't reach their control points - they bend toward them.
  // To make the curve peak actually touch the boundary, we overshoot the control point.
  // The 0.66 factor in bezier handles + curve math means we reach ~50% of target distance.
  // So we multiply by ~2 to compensate.
  const bezierCompensation = 2.0;

  // Inward push points - curve should peak at inner rectangle boundary
  const inwardPoints = {
    top: { x: center.x, y: center.y - halfH + buffer * resistance * bezierCompensation },
    right: { x: center.x + halfW - buffer * resistance * bezierCompensation, y: center.y },
    bottom: { x: center.x, y: center.y + halfH - buffer * resistance * bezierCompensation },
    left: { x: center.x - halfW + buffer * resistance * bezierCompensation, y: center.y },
  };

  // Outward push points - curve should peak at outer rectangle boundary
  const outwardPoints = {
    top: { x: center.x, y: center.y - halfH - buffer * resistance * bezierCompensation },
    right: { x: center.x + halfW + buffer * resistance * bezierCompensation, y: center.y },
    bottom: { x: center.x, y: center.y + halfH + buffer * resistance * bezierCompensation },
    left: { x: center.x - halfW - buffer * resistance * bezierCompensation, y: center.y },
  };

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

  // Calculate pressure for each edge based on current state
  // Pressure is PROGRESSIVE - increases as mouse moves deeper into the membrane zone
  // When "outside" (entering): pressure goes from 0 (at outer) to 1 (at inner)
  // When "inside" (exiting): pressure goes from 0 (at inner) to -1 (at outer)
  function getEdgePressure(edge: 'top' | 'right' | 'bottom' | 'left'): number {
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

  // Get raw pressure for each edge
  const rawPressure = {
    top: getEdgePressure('top'),
    right: getEdgePressure('right'),
    bottom: getEdgePressure('bottom'),
    left: getEdgePressure('left'),
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

  // Animated control points with membrane behavior
  const controlPoints = {
    top: useMembranePoint(edgeMidpoints.top, inwardPoints.top, outwardPoints.top, pressure.top, springConfig),
    right: useMembranePoint(edgeMidpoints.right, inwardPoints.right, outwardPoints.right, pressure.right, springConfig),
    bottom: useMembranePoint(edgeMidpoints.bottom, inwardPoints.bottom, outwardPoints.bottom, pressure.bottom, springConfig),
    left: useMembranePoint(edgeMidpoints.left, inwardPoints.left, outwardPoints.left, pressure.left, springConfig),
  };

  // Calculate inner rectangle dimensions for TwoRect (which uses center + width/height)
  const innerWidth = width - buffer * 2;
  const innerHeight = height - buffer * 2;
  const outerWidth = width + buffer * 2;
  const outerHeight = height + buffer * 2;

  return (
    <TwoProvider width={500} height={500} type="canvas">
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
      <QuadraticBezierRect
        vertices={vertices}
        controlPoints={controlPoints}
        fill="rgba(60, 60, 60, 0.8)"
        stroke="rgba(40, 40, 40, 1)"
        linewidth={2}
      />

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
    buffer: {
      control: { type: 'range', min: 20, max: 100, step: 5 },
      description: 'Thickness of membrane zone (extends both outside and inside the edge)',
    },
    resistance: {
      control: { type: 'range', min: 0.1, max: 1.0, step: 0.05 },
      description: 'Curve peak depth - 1.0 = extends to inner/outer rect boundaries',
    },
    stiffness: {
      control: { type: 'range', min: 20, max: 500, step: 10 },
      description: 'Spring tension - higher = snappier return to rest',
    },
    damping: {
      control: { type: 'range', min: 1, max: 40, step: 1 },
      description: 'Wobble decay - lower = more bouncy, higher = less oscillation',
    },
    mass: {
      control: { type: 'range', min: 0.5, max: 10, step: 0.5 },
      description: 'Inertia/momentum - higher = more wobble and overshoot',
    },
    showDebug: {
      control: 'boolean',
      description: 'Show detection zones: red = outer (inward pressure), green = inner (release zone)',
    },
  },
};

export default meta;

type ElasticRectBendStory = StoryObj<ElasticRectBendProps>;

export const Default: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    buffer: 60,
    resistance: 1.0,
    stiffness: 180,
    damping: 12,
    mass: 2,
    showDebug: false,
  },
};

export const Bouncy: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    buffer: 70,
    resistance: 1.0,
    stiffness: 200,
    damping: 6,   // Low damping = lots of bounce
    mass: 3,      // Higher mass = more wobble
  },
};

export const Snappy: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    buffer: 50,
    resistance: 1.0,
    stiffness: 400, // High stiffness = fast return
    damping: 25,    // Higher damping = less wobble
    mass: 1,        // Low mass = responsive
  },
};

export const Sluggish: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    buffer: 80,
    resistance: 1.0,
    stiffness: 60,  // Low stiffness = slow return
    damping: 8,     // Medium damping
    mass: 5,        // High mass = heavy, lots of momentum
  },
};

export const DebugView: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    buffer: 60,
    resistance: 1.0,
    stiffness: 180,
    damping: 12,
    mass: 2,
    showDebug: true, // Debug visualization enabled
  },
};
