import { Position } from "./types";

export interface AABB {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface HitRegionConfig {
  id: string;
  points: Position[];
  bounds?: AABB;
}

/**
 * Point-in-polygon test using ray casting algorithm.
 * Returns true if the point is inside the polygon.
 */
export function pointInPolygon(point: Position, polygon: Position[]): boolean {
  const { x, y } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Check if a point is inside an axis-aligned bounding box.
 * Fast pre-check before doing expensive point-in-polygon test.
 */
export function pointInAABB(point: Position, bounds: AABB): boolean {
  return (
    point.x >= bounds.minX &&
    point.x <= bounds.maxX &&
    point.y >= bounds.minY &&
    point.y <= bounds.maxY
  );
}

/**
 * Calculate the axis-aligned bounding box for a set of points.
 */
export function calculateAABB(points: Position[]): AABB {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.x > maxX) maxX = point.x;
    if (point.y > maxY) maxY = point.y;
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Expand bounds by a padding amount (useful for stroke width).
 */
export function expandAABB(bounds: AABB, padding: number): AABB {
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
  };
}

/**
 * HitRegion represents an interactive area on the canvas.
 * Used for click detection and accessibility.
 */
export class HitRegion {
  readonly id: string;
  readonly points: Position[];
  readonly bounds: AABB;

  constructor(config: HitRegionConfig) {
    this.id = config.id;
    this.points = config.points;
    this.bounds = config.bounds ?? calculateAABB(config.points);
  }

  /**
   * Test if a point is inside this hit region.
   * Uses AABB for fast rejection, then ray casting for precise test.
   */
  containsPoint(point: Position): boolean {
    // Fast AABB rejection
    if (!pointInAABB(point, this.bounds)) {
      return false;
    }

    // Precise polygon test
    return pointInPolygon(point, this.points);
  }

  /**
   * Get the center point of this hit region.
   */
  getCenter(): Position {
    return {
      x: (this.bounds.minX + this.bounds.maxX) / 2,
      y: (this.bounds.minY + this.bounds.maxY) / 2,
    };
  }
}
