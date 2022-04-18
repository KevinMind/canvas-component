import { ArcToArgs } from "./ArcTo.types";

export function drawArcTo(ctx: CanvasRenderingContext2D, {pos0, pos1, pos2, radius}: ArcToArgs) {  
  ctx.moveTo(pos0.x, pos0.y);
  ctx.arcTo(pos1.x, pos1.y, pos2.x, pos2.y, radius);
  ctx.stroke();
}