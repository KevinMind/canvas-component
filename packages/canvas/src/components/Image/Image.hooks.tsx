import { useRenderFrame } from "../../RenderFrame.hooks";

import { ImageProps } from "./Image.types";
import { drawImage } from "./Image.utilities";

export function useImage(args: ImageProps) {
  useRenderFrame((ctx) => drawImage(ctx, args));
}
