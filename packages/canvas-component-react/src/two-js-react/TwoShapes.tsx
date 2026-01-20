import { useEffect, useRef, memo, MutableRefObject } from "react";
import Two from "two.js";
import { Circle as TwoJsCircle } from "two.js/src/shapes/circle";
import { Rectangle as TwoJsRectangle } from "two.js/src/shapes/rectangle";
import { Ellipse as TwoJsEllipse } from "two.js/src/shapes/ellipse";
import { Line as TwoJsLine } from "two.js/src/shapes/line";
import { Path as TwoJsPath } from "two.js/src/path";
import { Polygon as TwoJsPolygon } from "two.js/src/shapes/polygon";
import { Shape as TwoJsShape } from "two.js/src/shape";

import { useTwo } from "./TwoContext";

// ============================================
// Common Types
// ============================================

interface BaseShapeProps {
  fill?: string;
  stroke?: string;
  linewidth?: number;
  opacity?: number;
  visible?: boolean;
  rotation?: number;
}

// ============================================
// Circle
// ============================================

export interface TwoCircleProps extends BaseShapeProps {
  x: number;
  y: number;
  radius: number;
}

/**
 * TwoCircle - A high-performance circle powered by Two.js.
 * The circle is created once and only properties are updated.
 */
export const TwoCircle = memo(function TwoCircle({
  x,
  y,
  radius,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation,
}: TwoCircleProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsCircle | null>(null);

  // Create shape once
  useEffect(() => {
    const circle = two.makeCircle(x, y, radius);
    shapeRef.current = circle;

    return () => {
      circle.remove();
    };
  }, [two]);

  // Update properties when they change
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
// Ellipse
// ============================================

export interface TwoEllipseProps extends BaseShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TwoEllipse = memo(function TwoEllipse({
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
}: TwoEllipseProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsEllipse | null>(null);

  useEffect(() => {
    const ellipse = two.makeEllipse(x, y, width / 2, height / 2);
    shapeRef.current = ellipse;

    return () => {
      ellipse.remove();
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
// Rectangle
// ============================================

export interface TwoRectProps extends BaseShapeProps {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TwoRect = memo(function TwoRect({
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
}: TwoRectProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsRectangle | null>(null);

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
// Line
// ============================================

export interface TwoLineProps extends BaseShapeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const TwoLine = memo(function TwoLine({
  x1,
  y1,
  x2,
  y2,
  stroke = "black",
  linewidth = 1,
  opacity,
  visible = true,
}: TwoLineProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsLine | null>(null);

  useEffect(() => {
    const line = two.makeLine(x1, y1, x2, y2);
    shapeRef.current = line;

    return () => {
      line.remove();
    };
  }, [two]);

  useEffect(() => {
    const shape = shapeRef.current;
    if (!shape) return;

    // Update line vertices
    shape.vertices[0].set(x1, y1);
    shape.vertices[1].set(x2, y2);

    shape.stroke = stroke;
    shape.linewidth = linewidth;
    if (opacity !== undefined) shape.opacity = opacity;
    shape.visible = visible;
  }, [x1, y1, x2, y2, stroke, linewidth, opacity, visible]);

  return null;
});

// ============================================
// Polygon
// ============================================

export interface TwoPolygonProps extends BaseShapeProps {
  x: number;
  y: number;
  radius: number;
  sides: number;
}

export const TwoPolygon = memo(function TwoPolygon({
  x,
  y,
  radius,
  sides,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation,
}: TwoPolygonProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsPolygon | null>(null);

  // Recreate if sides or radius changes significantly
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
    // Note: Two.js polygon radius can't be changed after creation,
    // so we recreate on radius change via the dependency above

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

// ============================================
// Path (for custom shapes with arbitrary vertices)
// ============================================

export interface Vertex {
  x: number;
  y: number;
}

export interface TwoPathProps extends BaseShapeProps {
  vertices: Vertex[];
  closed?: boolean;
  curved?: boolean;
}

export const TwoPath = memo(function TwoPath({
  vertices,
  closed = true,
  curved = false,
  fill,
  stroke,
  linewidth,
  opacity,
  visible = true,
  rotation,
}: TwoPathProps) {
  const two = useTwo();
  const shapeRef = useRef<TwoJsPath | null>(null);

  useEffect(() => {
    const anchors = vertices.map((v) => new Two.Anchor(v.x, v.y));
    // Create path - Two.js types are incomplete, use any cast
    const path = two.makePath(anchors) as TwoJsPath;
    // Reset position to (0, 0) so vertices are treated as world coordinates
    // Two.js defaults to positioning path at centroid, which causes offset issues
    // when vertices are later updated with world coordinates
    path.position.set(0, 0);
    (path as any).closed = closed;
    if (curved) {
      (path as any).automatic = true;
    }
    shapeRef.current = path;

    return () => {
      path.remove();
    };
  }, [two, vertices.length, closed, curved]);

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
// Hook for direct Two.js access
// ============================================

/**
 * useTwoShape - Create and manage a custom Two.js shape.
 *
 * @example
 * ```tsx
 * function CustomShape() {
 *   const shapeRef = useTwoShape((two) => {
 *     const circle = two.makeCircle(100, 100, 50);
 *     circle.fill = 'red';
 *     return circle;
 *   });
 *
 *   useEffect(() => {
 *     if (shapeRef.current) {
 *       shapeRef.current.position.x = 200;
 *     }
 *   }, []);
 *
 *   return null;
 * }
 * ```
 */
export function useTwoShape<T extends TwoJsShape>(
  creator: (two: Two) => T
): MutableRefObject<T | null> {
  const two = useTwo();
  const shapeRef = useRef<T | null>(null);

  useEffect(() => {
    const shape = creator(two);
    shapeRef.current = shape;

    return () => {
      shape.remove();
    };
  }, [two, creator]);

  return shapeRef;
}
