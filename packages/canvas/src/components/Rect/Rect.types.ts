import { DrawnCanvasProps, Position, FillAndStrokeArgs } from "../../RenderFrame.types";

export interface RectArgs extends DrawnCanvasProps, FillAndStrokeArgs {
  pos: Position;
  width: number;
  height: number;
}

