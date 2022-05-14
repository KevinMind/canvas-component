import { drawPath, PathArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function usePath(args: PathArgs) {
  useRenderFrame((ctx) => drawPath(ctx, args));
}
