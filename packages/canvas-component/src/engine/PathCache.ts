/**
 * PathCache - LRU cache for Path2D objects
 *
 * Path2D objects can be reused across frames for static geometry.
 * This cache stores computed paths keyed by a string identifier,
 * avoiding path recreation on every render.
 *
 * Uses LRU (Least Recently Used) eviction when cache exceeds max size.
 *
 * @example
 * ```typescript
 * const cache = new PathCache(100);
 *
 * function drawShape(ctx: CanvasRenderingContext2D, x: number, y: number) {
 *   const key = `rect-${x}-${y}-50-50`;
 *   const path = cache.getOrCreate(key, () => {
 *     const p = new Path2D();
 *     p.rect(x, y, 50, 50);
 *     return p;
 *   });
 *   ctx.fill(path);
 * }
 * ```
 */
export class PathCache {
  private cache: Map<string, Path2D> = new Map();
  private maxSize: number;

  /**
   * Create a new path cache
   * @param maxSize Maximum number of paths to cache (default 500)
   */
  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  /**
   * Get a cached path or create and cache a new one
   * @param key Unique identifier for the path
   * @param creator Function to create the path if not cached
   */
  getOrCreate(key: string, creator: () => Path2D): Path2D {
    let path = this.cache.get(key);

    if (path) {
      // Move to end for LRU (delete and re-add)
      this.cache.delete(key);
      this.cache.set(key, path);
      return path;
    }

    // Create new path
    path = creator();

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, path);
    return path;
  }

  /**
   * Check if a path is cached
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get a cached path without updating LRU order
   */
  peek(key: string): Path2D | undefined {
    return this.cache.get(key);
  }

  /**
   * Remove a specific path from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate all paths matching a prefix
   * Useful when a shape's base properties change
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Global path cache instance for shape rendering
 */
export const globalPathCache = new PathCache(500);

/**
 * Generate a cache key from shape parameters
 * @param shapeType The type of shape (rect, ellipse, etc.)
 * @param params The shape parameters
 */
export function generatePathKey(shapeType: string, params: Record<string, unknown>): string {
  const paramStr = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
    .join('|');
  return `${shapeType}|${paramStr}`;
}
