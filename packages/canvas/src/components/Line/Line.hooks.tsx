import { useRenderFrame } from "../../RenderFrame.hooks";
import { drawLine } from "./Line.utilities";
import { LineArgs } from "./Line.types";
import { drawEllipse } from "../Ellipse";

export function useLine(args: LineArgs) {
  useRenderFrame((ctx) => {
    drawLine(ctx, args);
  });
}
