import { LineArgs } from "./Line.types";

export function drawLine(ctx: CanvasRenderingContext2D, args: LineArgs) {
  ctx.beginPath();

  ctx.moveTo(args.start.x, args.start.y);
  ctx.lineTo(args.end.x, args.end.y);

  ctx.stroke();
  ctx.closePath();
}
