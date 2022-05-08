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
    const [first, ...sides] = args.sides;

    const firstPoint = Array.isArray(first) ? first[1] : first;

    ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let side of sides) {
      drawSide(ctx, side);
    }

    drawSide(ctx, first);

  } else if ('sideLength' in args) {
    ctx.moveTo (args.center.x +  args.sideLength * Math.cos(0), args.center.y +  args.sideLength *  Math.sin(0));
    
    for (let i = 1; i <= args.sides; i += 1) {
      const offset = i * 2 * Math.PI / args.sides;
      const xTranslation = args.sideLength * Math.cos(offset);
      const yTranslation = args.sideLength * Math.sin(offset);

      const nextPoint = {
        x: args.center.x + xTranslation,
        y: args.center.y + yTranslation,
      }

      const controlPoint = args.controlPoint || nextPoint;

      drawSide(ctx, [controlPoint, nextPoint]);
    }
  }
});
