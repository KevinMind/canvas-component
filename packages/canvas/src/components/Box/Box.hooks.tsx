import { useRenderFrame } from "../../RenderFrame.hooks";

import { BoxArgs } from "./Box.types";
import { drawBox } from "./Box.utilities";

export function useBox(args: BoxArgs) {
  useRenderFrame((ctx) => drawBox(ctx, args));
}
