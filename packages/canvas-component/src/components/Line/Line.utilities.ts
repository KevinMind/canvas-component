import { createDrawing } from "../../createDrawing.utilities";
import { drawEllipse } from "../Ellipse";

import { LineArgs } from "./Line.types";

export const drawLine = createDrawing<LineArgs>((ctx, { smooth, ...args }) => {
  if (args.showControlPoints) {
    for (let center of args.points || []) {
      drawEllipse(ctx, { center, radius: 1 });
    }
  }

  ctx.moveTo(args.start.x, args.start.y);

  if (Array.isArray(args.points) && args.points.length > 0) {
    const coords = [...args.points, args.end];

    if (smooth) {
      let i = 0;
      for (i; i < coords.length - 2; i++) {
        const xc = (coords[i].x + coords[i + 1].x) / 2;
        const yc = (coords[i].y + coords[i + 1].y) / 2;

        const cpx = coords[i].x;
        const cpy = coords[i].y;

        ctx.quadraticCurveTo(cpx, cpy, xc, yc);
      }
      ctx.quadraticCurveTo(
        coords[i].x,
        coords[i].y,
        coords[i + 1].x,
        coords[i + 1].y
      );
    } else {
      for (let point of coords) {
        ctx.lineTo(point.x, point.y);
      }
    }
  }

  return ctx.lineTo(args.end.x, args.end.y);
});
