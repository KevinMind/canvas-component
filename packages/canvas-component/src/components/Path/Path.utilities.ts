import { createDrawing } from "../../RenderFrame.utilities";
import { drawEllipse } from "../Ellipse";

import { PathProps } from "./Path.types";

export const drawPath = createDrawing<PathProps>((ctx, {points = []}) => {
  if (points.length === 1) {
    // We want to actually make an `angle` prop that determines the beginning thickness of the lines. maybe a pen type.
    // need to research caligraphy to know how to name it.
    const [first] = points;
    drawEllipse(ctx, {center: first, radius: 1});
  }

  if (points.length > 1) {
    for (let point of points) {
      ctx.lineTo(point.x, point.y);
    }
  }
  
});