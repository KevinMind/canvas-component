import { DrawnCanvasProps, Position, FillArgs, StrokeArgs } from "../../RenderFrame.types";

export interface RectArgs extends DrawnCanvasProps, FillArgs, StrokeArgs {
  pos: Position;
  width: number;
  height: number;
}

