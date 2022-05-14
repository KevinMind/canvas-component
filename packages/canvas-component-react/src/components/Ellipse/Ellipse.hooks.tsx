import { drawEllipse, EllipseArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useEllipse(args: EllipseArgs) {
  useRenderFrame((ctx) => drawEllipse(ctx, args));
}
