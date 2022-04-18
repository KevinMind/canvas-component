import { EllipseArgs } from "./Ellipse.types";

import { degreesToRadians } from "../../RenderFrame.utilities";

export function drawEllipse(ctx: CanvasRenderingContext2D, args: EllipseArgs) {
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
