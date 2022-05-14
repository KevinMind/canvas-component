import { drawCurve, CurveArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useCurve(args: CurveArgs) {
  useRenderFrame((ctx) => drawCurve(ctx, args));
}
