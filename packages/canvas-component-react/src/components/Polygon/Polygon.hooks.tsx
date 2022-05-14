import { drawPolygon, PolygonArgs } from "@canvas-component/core";

import { useRenderFrame } from "../../RenderFrame.hooks";

export function usePolygon(args: PolygonArgs) {
  useRenderFrame((ctx) => drawPolygon(ctx, args));
}
