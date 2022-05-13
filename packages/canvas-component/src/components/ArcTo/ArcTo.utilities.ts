import { createDrawing } from "../../RenderFrame.utilities";

import { ArcToArgs } from "./ArcTo.types";

export const drawArcTo = createDrawing<ArcToArgs>((ctx, args) => {
  ctx.moveTo(args.pos0.x, args.pos0.y);
  ctx.arcTo(args.pos1.x, args.pos1.y, args.pos2.x, args.pos2.y, args.radius);
});
