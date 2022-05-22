import { Position } from "../../createDrawing.types";
import { createDrawing } from "../../createDrawing.utilities";

import { CurveArgs } from "./Curve.types";

// This function is super inefficient.. need to rethink it's implementation
function getCurvePoints(
  p: Position[],
  tension = 0.5,
  numOfSeg = 25,
  close = false
): Float32Array {
  const points = p.flatMap((point) => [point.x, point.y]);
  let pts: number[] = [];
  let i = 1;
  let l = points.length;
  let rPos = 0;
  let rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0);
  let res = new Float32Array(rLen);
  let cache = new Float32Array((numOfSeg + 2) * 4);
  let cachePtr = 4;

  pts = points.slice(0);

  if (close) {
    pts.unshift(points[l - 1]); // insert end point as first point
    pts.unshift(points[l - 2]);
    pts.push(points[0], points[1]); // first point as last point
  } else {
    pts.unshift(points[1]); // copy 1. point and insert at beginning
    pts.unshift(points[0]);
    pts.push(points[l - 2], points[l - 1]); // duplicate end-points
  }

  // cache inner-loop calculations as they are based on t alone
  cache[0] = 1; // 1,0,0,0

  for (; i < numOfSeg; i++) {
    var st = i / numOfSeg,
      st2 = st * st,
      st3 = st2 * st,
      st23 = st3 * 2,
      st32 = st2 * 3;

    cache[cachePtr++] = st23 - st32 + 1; // c1
    cache[cachePtr++] = st32 - st23; // c2
    cache[cachePtr++] = st3 - 2 * st2 + st; // c3
    cache[cachePtr++] = st3 - st2; // c4
  }

  cache[++cachePtr] = 1; // 0,1,0,0

  // calc. points
  parse(pts, cache, l);

  if (close) {
    //l = points.length;
    pts = [];
    pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]); // second last and last
    pts.push(points[0], points[1], points[2], points[3]); // first and second
    parse(pts, cache, 4);
  }

  function parse(pts: number[], cache: Float32Array, l: number) {
    for (var i = 2, t; i < l; i += 2) {
      var pt1 = pts[i],
        pt2 = pts[i + 1],
        pt3 = pts[i + 2],
        pt4 = pts[i + 3],
        t1x = (pt3 - pts[i - 2]) * tension,
        t1y = (pt4 - pts[i - 1]) * tension,
        t2x = (pts[i + 4] - pt1) * tension,
        t2y = (pts[i + 5] - pt2) * tension;

      for (t = 0; t < numOfSeg; t++) {
        var c = t << 2, //t * 4;
          c1 = cache[c],
          c2 = cache[c + 1],
          c3 = cache[c + 2],
          c4 = cache[c + 3];

        res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
        res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
      }
    }
  }

  // add last point
  l = close ? 0 : points.length - 2;
  res[rPos++] = points[l];
  res[rPos] = points[l + 1];

  return res;
}

export const drawCurve = createDrawing<CurveArgs>((ctx, args) => {
  if (args.points.length === 0) return;

  const res = getCurvePoints(
    args.points,
    args.tension,
    args.numOfSeg,
    args.close
  );

  // add lines to path
  for (let i = 0, l = res.length; i < l; i += 2) {
    ctx.lineTo(res[i], res[i + 1]);
  }
});
