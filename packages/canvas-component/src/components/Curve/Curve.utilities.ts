import { Position } from "../../createDrawing.types";
import { createDrawing } from "../../createDrawing.utilities";

import { CurveArgs } from "./Curve.types";

/**
 * LRU cache for computed curve points
 * Key format: points|tension|numOfSeg|close
 */
const curvePointsCache = new Map<string, Float32Array>();
const CACHE_MAX_SIZE = 200;

/**
 * Cache for coefficient arrays (reused across all curves with same numOfSeg)
 * This is the most expensive part - only computed once per segment count
 */
const coefficientCache = new Map<number, Float32Array>();

/**
 * Generate a cache key from curve parameters
 */
function generateCacheKey(
  points: Position[],
  tension: number,
  numOfSeg: number,
  close: boolean
): string {
  // For large point arrays, use a hash approach
  const pointsStr = points.length <= 10
    ? points.map(p => `${p.x},${p.y}`).join(';')
    : `${points.length}:${points[0]?.x},${points[0]?.y}:${points[points.length - 1]?.x},${points[points.length - 1]?.y}`;
  return `${pointsStr}|${tension}|${numOfSeg}|${close}`;
}

/**
 * Get or compute coefficient cache for a given segment count
 * Coefficients only depend on numOfSeg, so can be reused across all curves
 */
function getCoefficients(numOfSeg: number): Float32Array {
  let cache = coefficientCache.get(numOfSeg);
  if (cache) return cache;

  // Create coefficient cache
  cache = new Float32Array((numOfSeg + 2) * 4);
  let cachePtr = 4;

  cache[0] = 1; // 1,0,0,0

  for (let i = 1; i < numOfSeg; i++) {
    const st = i / numOfSeg;
    const st2 = st * st;
    const st3 = st2 * st;
    const st23 = st3 * 2;
    const st32 = st2 * 3;

    cache[cachePtr++] = st23 - st32 + 1; // c1
    cache[cachePtr++] = st32 - st23;     // c2
    cache[cachePtr++] = st3 - 2 * st2 + st; // c3
    cache[cachePtr++] = st3 - st2;       // c4
  }

  cache[++cachePtr] = 1; // 0,1,0,0

  coefficientCache.set(numOfSeg, cache);
  return cache;
}

/**
 * Optimized curve point calculation with caching
 * Uses pre-computed coefficients and typed arrays throughout
 */
function getCurvePoints(
  p: Position[],
  tension = 0.5,
  numOfSeg = 25,
  close = false
): Float32Array {
  // Check cache first
  const cacheKey = generateCacheKey(p, tension, numOfSeg, close);
  let cached = curvePointsCache.get(cacheKey);
  if (cached) {
    // Move to end for LRU
    curvePointsCache.delete(cacheKey);
    curvePointsCache.set(cacheKey, cached);
    return cached;
  }

  // Convert points to flat array (reuse if possible)
  const l = p.length * 2;
  const points = new Float32Array(l);
  for (let i = 0, j = 0; i < p.length; i++, j += 2) {
    points[j] = p[i].x;
    points[j + 1] = p[i].y;
  }

  // Calculate result size
  const rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0);
  const res = new Float32Array(rLen);
  let rPos = 0;

  // Get cached coefficients
  const coeffs = getCoefficients(numOfSeg);

  // Prepare padded points array
  const ptsLen = l + 4;
  const pts = new Float32Array(ptsLen);

  if (close) {
    // Insert end point as first point
    pts[0] = points[l - 2];
    pts[1] = points[l - 1];
    pts.set(points, 2);
    pts[l + 2] = points[0];
    pts[l + 3] = points[1];
  } else {
    // Copy 1st point and insert at beginning
    pts[0] = points[0];
    pts[1] = points[1];
    pts.set(points, 2);
    pts[l + 2] = points[l - 2];
    pts[l + 3] = points[l - 1];
  }

  // Calculate points using typed arrays
  for (let i = 2; i < l; i += 2) {
    const pt1 = pts[i];
    const pt2 = pts[i + 1];
    const pt3 = pts[i + 2];
    const pt4 = pts[i + 3];
    const t1x = (pt3 - pts[i - 2]) * tension;
    const t1y = (pt4 - pts[i - 1]) * tension;
    const t2x = (pts[i + 4] - pt1) * tension;
    const t2y = (pts[i + 5] - pt2) * tension;

    for (let t = 0; t < numOfSeg; t++) {
      const c = t << 2;
      const c1 = coeffs[c];
      const c2 = coeffs[c + 1];
      const c3 = coeffs[c + 2];
      const c4 = coeffs[c + 3];

      res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
      res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
    }
  }

  // Handle close case
  if (close) {
    const closePts = new Float32Array(8);
    closePts[0] = points[l - 4];
    closePts[1] = points[l - 3];
    closePts[2] = points[l - 2];
    closePts[3] = points[l - 1];
    closePts[4] = points[0];
    closePts[5] = points[1];
    closePts[6] = points[2];
    closePts[7] = points[3];

    for (let i = 2; i < 4; i += 2) {
      const pt1 = closePts[i];
      const pt2 = closePts[i + 1];
      const pt3 = closePts[i + 2];
      const pt4 = closePts[i + 3];
      const t1x = (pt3 - closePts[i - 2]) * tension;
      const t1y = (pt4 - closePts[i - 1]) * tension;
      const t2x = (closePts[i + 4] - pt1) * tension;
      const t2y = (closePts[i + 5] - pt2) * tension;

      for (let t = 0; t < numOfSeg; t++) {
        const c = t << 2;
        const c1 = coeffs[c];
        const c2 = coeffs[c + 1];
        const c3 = coeffs[c + 2];
        const c4 = coeffs[c + 3];

        res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
        res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
      }
    }
  }

  // Add last point
  const lastIdx = close ? 0 : l - 2;
  res[rPos++] = points[lastIdx];
  res[rPos] = points[lastIdx + 1];

  // Cache result (with LRU eviction)
  if (curvePointsCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = curvePointsCache.keys().next().value;
    if (oldestKey !== undefined) {
      curvePointsCache.delete(oldestKey);
    }
  }
  curvePointsCache.set(cacheKey, res);

  return res;
}

/**
 * Clear the curve points cache
 * Call this if you need to force recalculation
 */
export function clearCurveCache(): void {
  curvePointsCache.clear();
}

export const drawCurve = createDrawing<CurveArgs>((ctx, args) => {
  if (args.points.length === 0) return;

  const res = getCurvePoints(
    args.points,
    args.tension,
    args.numOfSeg,
    args.close
  );

  // Draw curve using lineTo
  // First point is moveTo, rest are lineTo
  if (res.length >= 2) {
    ctx.moveTo(res[0], res[1]);
    for (let i = 2, l = res.length; i < l; i += 2) {
      ctx.lineTo(res[i], res[i + 1]);
    }
  }
});
