import { Position } from "../../RenderFrame.types";
import { createDrawing } from "../../RenderFrame.utilities";

import { LineArgs } from "./Line.types";

function getCurvePoints(pts: number[], tension = 0.5, isClosed = false, numOfSegments = 16) {

  var _pts = [], res = [],    // clone array
      x, y,           // our x,y coords
      t1x, t2x, t1y, t2y, // tension vectors
      c1, c2, c3, c4,     // cardinal points
      st, t, i;       // steps based on num. of segments

  // clone array so we don't change the original
  //
  _pts = pts.slice(0);

  // The algorithm require a previous and next point to the actual point array.
  // Check if we will draw closed or open curve.
  // If closed, copy end points to beginning and first points to end
  // If open, duplicate first points to befinning, end points to end
  if (isClosed) {
      _pts.unshift(pts[pts.length - 1]);
      _pts.unshift(pts[pts.length - 2]);
      _pts.unshift(pts[pts.length - 1]);
      _pts.unshift(pts[pts.length - 2]);
      _pts.push(pts[0]);
      _pts.push(pts[1]);
  }
  else {
      _pts.unshift(pts[1]);   //copy 1. point and insert at beginning
      _pts.unshift(pts[0]);
      _pts.push(pts[pts.length - 2]); //copy last point and append
      _pts.push(pts[pts.length - 1]);
  }

  // ok, lets start..

  // 1. loop goes through point array
  // 2. loop goes through each segment between the 2 pts + 1e point before and after
  for (i=2; i < (_pts.length - 4); i+=2) {
      for (t=0; t <= numOfSegments; t++) {

          // calc tension vectors
          t1x = (_pts[i+2] - _pts[i-2]) * tension;
          t2x = (_pts[i+4] - _pts[i]) * tension;

          t1y = (_pts[i+3] - _pts[i-1]) * tension;
          t2y = (_pts[i+5] - _pts[i+1]) * tension;

          // calc step
          st = t / numOfSegments;

          // calc cardinals
          c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
          c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
          c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st; 
          c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

          // calc x and y cords with common control vectors
          x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
          y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

          //store points in array
          res.push(x);
          res.push(y);

      }
  }

  return res;
}


export const drawLine = createDrawing<LineArgs>((ctx, args) => {
  if (Array.isArray(args.points) && args.points.length > 0) {
    ctx.beginPath();

    const mapPoints = args.points.map((pos) => [pos.x, pos.y]).flat();
    // @TODO: fix getCurvePoints to use Position objects instead of flat array
    // fix broken line
    const pts = getCurvePoints(mapPoints, 1)

    ctx.moveTo(pts[0], pts[1]);

    for(let i=2; i<pts.length-1; i+=2) {
      ctx.lineTo(pts[i], pts[i+1]);
    }

    return;
  }

  ctx.moveTo(args.start.x, args.start.y);

  // @TODO: remove cp1/cp2 just use points array. {start: Position; points: Position[]; end: Position; tension: number; straight: boolean;}
  
  if (!!args.cp1 && !!args.cp2) {
    // bezier
    ctx.bezierCurveTo(args.cp1.x, args.cp1.y, args.cp2.x, args.cp2.y, args.end.x, args.end.y);
  } else if (!!args.cp1 && !args.cp2) {
    // quadratic
    ctx.quadraticCurveTo(args.cp1?.x, args.cp1.y, args.end.x, args.end.y);
  } else if (!args.cp1 && !!args.cp2) {
    // invalid
    throw new Error('cannot provide only cp2, must provide cp1 & cp2');
  } else {
    // linear
    ctx.lineTo(args.end.x, args.end.y);
  }  
});