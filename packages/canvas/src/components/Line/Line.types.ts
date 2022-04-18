import { DrawnCanvasProps, Position, StrokeArgs } from "../../RenderFrame.types";

export interface LineArgs extends DrawnCanvasProps, StrokeArgs {
  start: Position;
  cp1?: Position;
  cp2?: Position;
  end: Position;
}
