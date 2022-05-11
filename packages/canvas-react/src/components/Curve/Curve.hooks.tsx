import { useRenderFrame } from "../../RenderFrame.hooks";

import { CurveProps } from "./Curve.types";
import { drawCurve } from "./Curve.utilities";

export function useCurve(args: CurveProps) {
  useRenderFrame((ctx) => drawCurve(ctx, args));
}
