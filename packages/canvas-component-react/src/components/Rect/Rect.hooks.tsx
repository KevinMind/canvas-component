import { drawRect, RectArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useRect(args: RectArgs) {
  useRenderFrame((ctx) => drawRect(ctx, args));
}
