import { EllipseArgs } from "./Ellipse.types";

import { createDrawing } from "../../createDrawing.utilities";

export const drawEllipse = createDrawing<EllipseArgs>((ctx, args) => {
  const radiusX = args.radius;
  const radiusY = args?.radiusY ?? radiusX;
  const startAngle = 0;
  const endAngle = 2 * Math.PI;

  ctx.ellipse(
    args.center.x,
    args.center.y,
    radiusX,
    radiusY,
    0,
    startAngle,
    endAngle
  );
});
