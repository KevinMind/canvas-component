import { useRenderFrame } from "../../RenderFrame.hooks";

import { RectArgs } from "./Rect.types";
import { drawRect } from "./Rect.utilities";

export function useRect(args: RectArgs) {
  useRenderFrame((ctx) => drawRect(ctx, args));
}
