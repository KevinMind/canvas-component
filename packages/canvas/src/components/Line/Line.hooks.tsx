import { useCanvasFrame } from "../Canvas/Canvas.hooks";
import { drawLine } from "./Line.utilities";
import { LineArgs } from "./Line.types";

export function useLine(args: LineArgs) {
  useCanvasFrame((ctx) => drawLine(ctx, args));
}
