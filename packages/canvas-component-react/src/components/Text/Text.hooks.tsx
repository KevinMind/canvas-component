import { drawText, TextArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useText(args: TextArgs) {
  useRenderFrame((ctx) => drawText(ctx, args));
}
