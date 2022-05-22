import { Draw } from "./createDrawing.types";

export interface IntCanvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  drawings: Map<Draw, true>;
}
