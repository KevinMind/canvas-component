/**
 * ObjectPool - Generic object pool for reducing GC pressure
 *
 * Instead of creating new objects every frame, objects are acquired from the pool
 * and released back when done. This dramatically reduces garbage collection pauses
 * during animation.
 *
 * @example
 * ```typescript
 * const vectorPool = new ObjectPool(
 *   () => ({ x: 0, y: 0 }),
 *   (v) => { v.x = 0; v.y = 0; }
 * );
 *
 * // In render loop:
 * const vec = vectorPool.acquire();
 * vec.x = 100; vec.y = 200;
 * // ... use vec ...
 * vectorPool.release(vec);
 * ```
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  /**
   * Create a new object pool
   * @param factory Function to create new objects when pool is empty
   * @param reset Function to reset object state when released back to pool
   * @param maxSize Maximum pool size (default 1000)
   */
  constructor(
    factory: () => T,
    reset: (obj: T) => void = () => {},
    maxSize: number = 1000
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  /**
   * Acquire an object from the pool
   * Returns a pooled object if available, otherwise creates a new one
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * Release an object back to the pool
   * The object is reset and stored for future reuse
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  /**
   * Release multiple objects back to the pool
   */
  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }

  /**
   * Pre-warm the pool by creating objects ahead of time
   * @param count Number of objects to pre-create
   */
  prewarm(count: number): void {
    const toCreate = Math.min(count, this.maxSize - this.pool.length);
    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool.length = 0;
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.pool.length;
  }
}

/**
 * Pre-configured pool for position/vector objects
 */
export const positionPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (v) => { v.x = 0; v.y = 0; }
);

/**
 * Pre-configured pool for bounding box objects
 */
export const boundsPool = new ObjectPool(
  () => ({ x: 0, y: 0, width: 0, height: 0 }),
  (b) => { b.x = 0; b.y = 0; b.width = 0; b.height = 0; }
);

/**
 * Pre-configured pool for color arrays (RGBA)
 */
export const colorPool = new ObjectPool(
  () => new Float32Array(4),
  (c) => { c[0] = 0; c[1] = 0; c[2] = 0; c[3] = 1; }
);

/**
 * Pre-configured pool for transform matrices (3x3)
 */
export const matrixPool = new ObjectPool(
  () => new Float32Array(9),
  (m) => {
    // Reset to identity matrix
    m[0] = 1; m[1] = 0; m[2] = 0;
    m[3] = 0; m[4] = 1; m[5] = 0;
    m[6] = 0; m[7] = 0; m[8] = 1;
  }
);
