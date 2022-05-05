import { useRenderFrame } from "../../RenderFrame.hooks";
import { PathProps } from "./Path.types";

import { drawPath } from "./Path.utilities";

export function usePath(args: PathProps) {
  useRenderFrame((ctx) => drawPath(ctx, args));
}
