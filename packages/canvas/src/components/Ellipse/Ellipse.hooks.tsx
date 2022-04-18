import { useRenderFrame } from "../../RenderFrame.hooks";
import { drawEllipse } from "./Ellipse.utilities";
import { EllipseArgs } from "./Ellipse.types";

export function useEllipse(args: EllipseArgs) {
  useRenderFrame((ctx) => drawEllipse(ctx, args));
}
