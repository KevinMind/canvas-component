import {drawArcTo, ArcToArgs} from '@canvas-component/core';

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useArcTo(args: ArcToArgs) {
  useRenderFrame((ctx) => drawArcTo(ctx, args));
}
