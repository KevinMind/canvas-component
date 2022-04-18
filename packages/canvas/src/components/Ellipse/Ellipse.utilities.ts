import { EllipseArgs } from "./Ellipse.types";

import { degreesToRadians, createDrawing } from "../../RenderFrame.utilities";

export const drawEllipse = createDrawing<EllipseArgs>((ctx, args) => {
  const radiusX = args.radius;
  const radiusY = args?.radiusY ?? radiusX;
  const startAngle = 0;
  const endAngle = 2 * Math.PI;

  ctx.ellipse(
    args.pos.x,
    args.pos.y,
    radiusX,
    radiusY,
    degreesToRadians(args.rotation),
    startAngle,
    endAngle
  );
});
