import { useRenderFrame } from "../../RenderFrame.hooks";
import { PolygonArgs } from "./Polygon.types";

import { drawPolygon } from "./Polygon.utilities";

export function usePolygon(args: PolygonArgs) {
  useRenderFrame((ctx) => drawPolygon(ctx, args));
}
