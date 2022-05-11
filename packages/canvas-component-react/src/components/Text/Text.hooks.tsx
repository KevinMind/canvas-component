import { useRenderFrame } from "../../RenderFrame.hooks";

import { TextProps } from "./Text.types";
import { drawText } from "./Text.utilities";

export function useText(args: TextProps) {
  useRenderFrame((ctx) => drawText(ctx, args));
}
