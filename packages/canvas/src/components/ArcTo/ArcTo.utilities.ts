import { createDrawing } from "../../RenderFrame.utilities";

import { ArcToArgs } from "./ArcTo.types";

export const drawArcTo = createDrawing<ArcToArgs>((ctx, {pos0, pos1, pos2, radius}) => {
  ctx.moveTo(pos0.x, pos0.y);
  ctx.arcTo(pos1.x, pos1.y, pos2.x, pos2.y, radius);
});