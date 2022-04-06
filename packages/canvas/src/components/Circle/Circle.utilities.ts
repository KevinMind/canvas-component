import { CircleArgs } from "./Circle.types";

import { degreesToRadians } from "../Canvas/Canvas.utilities";

export function drawCircle(ctx: CanvasRenderingContext2D, args: CircleArgs) {
  const radiusX = args.radius;
  const radiusY = args?.radiusY ?? radiusX;
  const startAngle = 0;
  const endAngle = 2 * Math.PI;

  ctx.beginPath();

  ctx.ellipse(
    args.pos.x,
    args.pos.y,
    radiusX,
    radiusY,
    degreesToRadians(args.rotation),
    startAngle,
    endAngle
  );

  ctx.stroke();
}
