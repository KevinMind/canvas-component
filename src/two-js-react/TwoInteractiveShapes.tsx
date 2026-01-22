import { useEffect, useRef, memo, useCallback, useMemo } from "react";
import Two from "two.js";
import { Circle as TwoJsCircle } from "two.js/src/shapes/circle";
import { Rectangle as TwoJsRectangle } from "two.js/src/shapes/rectangle";
import { Polygon as TwoJsPolygon } from "two.js/src/shapes/polygon";
import { Path as TwoJsPath } from "two.js/src/path";

import { useTwo, useTwoInteraction } from "./TwoContext";
import { Position, InteractionEvent } from "../engine";
import { useInteractive } from "../hooks/useInteractive";

// ============================================
// Common Types
// ============================================

interface BaseInteractiveProps {
  fill?: string;
  stroke?: string;
  linewidth?: number;
  opacity?: number;
  visible?: boolean;
  rotation?: number;
  // Interactive props
  onClick?: (event: InteractionEvent) => void;
  onPointerEnter?: (event: InteractionEvent) => void;
  onPointerLeave?: (event: InteractionEvent) => void;
  // Focus props (called when keyboard focus changes)
  onFocus?: () => void;
  onBlur?: () => void;
  // Accessibility
  ariaLabel?: string;
  role?: "button" | "link" | "checkbox" | "radio";
  disabled?: boolean;
  tabIndex?: number;
}

let shapeIdCounter = 0;
function generateShapeId(): string {
  return `two-shape-${++shapeIdCounter}`;
}

// ============================================
// Interactive Circle
// ============================================

export interface InteractiveTwoCircleProps extends BaseInteractiveProps {
  x: number;
  y: number;
  radius: number;
}

/**
 * InteractiveTwoCircle - A Two.js circle with click handlers and accessibility.
 */
export const InteractiveTwoCircle = memo(function InteractiveTwoCircle({
  x,
  y,
  radius,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ariaLabel,
  role,
  disabled,
  tabIndex,
}: InteractiveTwoCircleProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsCircle | null>(null);
  const idRef = useRef(generateShapeId());

  // Calculate hit region points (approximate circle with polygon)
  const hitPoints = useMemo(() => {
    const points: Position[] = [];
    const segments = 16; // Approximate circle with 16-sided polygon
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
      });
    }
    return points;
  }, [x, y, radius]);

  // Register interactive region
  const interactive = useInteractive({
    id: idRef.current,
    points: hitPoints,
    onClick: disabled ? undefined : onClick,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ariaLabel,
    role: role ?? (onClick ? "button" : undefined),
    disabled,
    tabIndex,
  });

  // Create shape once
  useEffect(() => {
    const circle = two.makeCircle(x, y, radius);
    shapeRef.current = circle;

    return () => {
      circle.remove();
    };
  }, [two]);

  // Update properties
  useEffect(() => {
    const shape = shapeRef.current;
    if (!shape) return;

    shape.position.set(x, y);
    shape.radius = radius;

    if (fill !== undefined) shape.fill = fill;
    if (stroke !== undefined) {
      shape.stroke = stroke;
    } else {
      shape.noStroke();
    }
    if (linewidth !== undefined) shape.linewidth = linewidth;
    if (opacity !== undefined) shape.opacity = opacity;
    if (rotation !== undefined) shape.rotation = rotation;
    shape.visible = visible;
  }, [x, y, radius, fill, stroke, linewidth, opacity, visible, rotation]);

  return null;
});

// ============================================
// Interactive Rectangle
// ============================================

export interface InteractiveTwoRectProps extends BaseInteractiveProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const InteractiveTwoRect = memo(function InteractiveTwoRect({
  x,
  y,
  width,
  height,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ariaLabel,
  role,
  disabled,
  tabIndex,
}: InteractiveTwoRectProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsRectangle | null>(null);
  const idRef = useRef(generateShapeId());

  // Calculate hit region points (rectangle corners)
  // Note: Two.js rectangles are centered at x,y
  const hitPoints = useMemo(() => {
    const halfW = width / 2;
    const halfH = height / 2;
    return [
      { x: x - halfW, y: y - halfH },
      { x: x + halfW, y: y - halfH },
      { x: x + halfW, y: y + halfH },
      { x: x - halfW, y: y + halfH },
    ];
  }, [x, y, width, height]);

  // Register interactive region
  useInteractive({
    id: idRef.current,
    points: hitPoints,
    onClick: disabled ? undefined : onClick,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ariaLabel,
    role: role ?? (onClick ? "button" : undefined),
    disabled,
    tabIndex,
  });

  useEffect(() => {
    const rect = two.makeRectangle(x, y, width, height);
    shapeRef.current = rect;

    return () => {
      rect.remove();
    };
  }, [two]);

  useEffect(() => {
    const shape = shapeRef.current;
    if (!shape) return;

    shape.position.set(x, y);
    shape.width = width;
    shape.height = height;

    if (fill !== undefined) shape.fill = fill;
    if (stroke !== undefined) {
      shape.stroke = stroke;
    } else {
      shape.noStroke();
    }
    if (linewidth !== undefined) shape.linewidth = linewidth;
    if (opacity !== undefined) shape.opacity = opacity;
    if (rotation !== undefined) shape.rotation = rotation;
    shape.visible = visible;
  }, [x, y, width, height, fill, stroke, linewidth, opacity, visible, rotation]);

  return null;
});

// ============================================
// Interactive Polygon (custom vertices)
// ============================================

export interface InteractiveTwoPolygonProps extends BaseInteractiveProps {
  /** Array of vertices defining the polygon */
  vertices: Position[];
  /** Whether to close the path */
  closed?: boolean;
}

export const InteractiveTwoPolygon = memo(function InteractiveTwoPolygon({
  vertices,
  closed = true,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ariaLabel,
  role,
  disabled,
  tabIndex,
}: InteractiveTwoPolygonProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsPath | null>(null);
  const idRef = useRef(generateShapeId());

  // Register interactive region using the polygon vertices directly
  useInteractive({
    id: idRef.current,
    points: vertices,
    onClick: disabled ? undefined : onClick,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ariaLabel,
    role: role ?? (onClick ? "button" : undefined),
    disabled,
    tabIndex,
  });

  useEffect(() => {
    const anchors = vertices.map((v) => new Two.Anchor(v.x, v.y));
    const path = two.makePath(anchors) as TwoJsPath;
    (path as any).closed = closed;
    shapeRef.current = path;

    return () => {
      path.remove();
    };
  }, [two, vertices.length, closed]);

  useEffect(() => {
    const shape = shapeRef.current;
    if (!shape) return;

    // Update vertices
    for (let i = 0; i < vertices.length && i < shape.vertices.length; i++) {
      shape.vertices[i].set(vertices[i].x, vertices[i].y);
    }

    if (fill !== undefined) shape.fill = fill;
    if (stroke !== undefined) {
      shape.stroke = stroke;
    } else {
      shape.noStroke();
    }
    if (linewidth !== undefined) shape.linewidth = linewidth;
    if (opacity !== undefined) shape.opacity = opacity;
    if (rotation !== undefined) shape.rotation = rotation;
    shape.visible = visible;
  }, [vertices, fill, stroke, linewidth, opacity, visible, rotation]);

  return null;
});

// ============================================
// Interactive Regular Polygon
// ============================================

export interface InteractiveTwoRegularPolygonProps extends BaseInteractiveProps {
  x: number;
  y: number;
  radius: number;
  sides: number;
}

export const InteractiveTwoRegularPolygon = memo(function InteractiveTwoRegularPolygon({
  x,
  y,
  radius,
  sides,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation = 0,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ariaLabel,
  role,
  disabled,
  tabIndex,
}: InteractiveTwoRegularPolygonProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsPolygon | null>(null);
  const idRef = useRef(generateShapeId());

  // Calculate hit region points
  const hitPoints = useMemo(() => {
    const points: Position[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation;
      points.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
      });
    }
    return points;
  }, [x, y, radius, sides, rotation]);

  useInteractive({
    id: idRef.current,
    points: hitPoints,
    onClick: disabled ? undefined : onClick,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    ariaLabel,
    role: role ?? (onClick ? "button" : undefined),
    disabled,
    tabIndex,
  });

  useEffect(() => {
    const polygon = two.makePolygon(x, y, radius, sides);
    shapeRef.current = polygon;

    return () => {
      polygon.remove();
    };
  }, [two, sides, radius]);

  useEffect(() => {
    const shape = shapeRef.current;
    if (!shape) return;

    shape.position.set(x, y);

    if (fill !== undefined) shape.fill = fill;
    if (stroke !== undefined) {
      shape.stroke = stroke;
    } else {
      shape.noStroke();
    }
    if (linewidth !== undefined) shape.linewidth = linewidth;
    if (opacity !== undefined) shape.opacity = opacity;
    if (rotation !== undefined) shape.rotation = rotation;
    shape.visible = visible;
  }, [x, y, fill, stroke, linewidth, opacity, visible, rotation]);

  return null;
});
