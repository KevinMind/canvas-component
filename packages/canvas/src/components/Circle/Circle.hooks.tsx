import { useCanvasFrame } from "../Canvas/Canvas.hooks";
import { drawCircle } from "./Circle.utilities";
import { CircleArgs } from "./Circle.types";

export function useCircle(args: CircleArgs) {
  useCanvasFrame((ctx) => drawCircle(ctx, args));
}
