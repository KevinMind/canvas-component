import { useRenderFrame } from "../../RenderFrame.hooks";

import { ArcToArgs } from "./ArcTo.types";
import { drawArcTo } from "./ArcTo.utilities";

export function useArcTo(args: ArcToArgs) {
  useRenderFrame((ctx) => drawArcTo(ctx, args));
}
