import { useRenderFrame } from "../../RenderFrame.hooks";
import { drawCircle } from "./Circle.utilities";
import { CircleArgs } from "./Circle.types";

export function useCircle(args: CircleArgs) {
  useRenderFrame((ctx) => drawCircle(ctx, args));
}
