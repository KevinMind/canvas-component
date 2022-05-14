import { useRenderFrame } from "../../RenderFrame.hooks";
import { drawLine } from "./Line.utilities";
import { LineArgs } from "./Line.types";

export function useLine(args: LineArgs) {
  useRenderFrame((ctx) => {
    drawLine(ctx, args);
  });
}
