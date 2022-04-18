import { createDrawing } from "../../RenderFrame.utilities";

import { LineArgs } from "./Line.types";

export const drawLine = createDrawing<LineArgs>((ctx, args) => {
  ctx.moveTo(args.start.x, args.start.y);
  
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