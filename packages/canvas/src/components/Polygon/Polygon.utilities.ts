import { Position } from "../../RenderFrame.types";
import { createDrawing } from "../../RenderFrame.utilities";

import { PolygonArgs, Side } from "./Polygon.types";

function drawSide(ctx: CanvasRenderingContext2D, side: Side) {
  const [cp, pos] = Array.isArray(side) ? side : [side, side];
  ctx.quadraticCurveTo(cp.x, cp.y, pos.x, pos.y);
}

export const drawPolygon = createDrawing<PolygonArgs>((ctx, args) => {
  let numSides: number;

  if (Array.isArray(args.sides)) {
    numSides = args.sides.length;
  } else {
    numSides = args.sides;
  }
  
  if (numSides < 3) {
    throw new Error('polygon must contain at least 3 sides');
  }
  
  if (Array.isArray(args.sides)) {
    const [first, ...rest] = args.sides;

    drawSide(ctx, first);

    for (let vertices of rest) {
      drawSide(ctx, vertices);
    }

    drawSide(ctx, first);
  } else if ('sideLength' in args) {
    ctx.moveTo (args.center.x +  args.sideLength * Math.cos(0), args.center.y +  args.sideLength *  Math.sin(0));
    
    for (let i = 1; i <= args.sides; i += 1) {
      const offset = i * 2 * Math.PI / args.sides;
      const xTranslation = args.sideLength * Math.cos(offset);
      const yTranslation = args.sideLength * Math.sin(offset);

      const nextPoint: Position = {
        x: args.center.x + xTranslation,
        y: args.center.y + yTranslation,
      }

      const controlPoint = args.controlPoint || nextPoint;
  
      ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, nextPoint.x, nextPoint.y);
    }
  }
});
