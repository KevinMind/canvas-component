import { {{name}}Args } from "./{{name}}.types";

export function draw{{name}}(ctx: CanvasRenderingContext2D, args: {{name}}Args) {
  ctx.beginPath();
  ctx.moveTo(args.pos.x, args.pos.y);
}
