import { drawLine, LineArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useLine(args: LineArgs) {
  useRenderFrame((ctx) => {
    drawLine(ctx, args);
  });
}
