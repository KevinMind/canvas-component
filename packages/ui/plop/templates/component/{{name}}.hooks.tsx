import { useCanvasFrame } from "../../Canvas.hooks";
import { draw{{name}} } from "./{{name}}.utilities";
import { {{name}}Args } from "./{{name}}.types";

export function use{{name}}(args: {{name}}Args) {
  useCanvasFrame((ctx) => draw{{name}}(ctx, args));
}
