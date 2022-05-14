import { drawImage, ImageArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function useImage(args: ImageArgs) {
  useRenderFrame((ctx) => drawImage(ctx, args));
}
