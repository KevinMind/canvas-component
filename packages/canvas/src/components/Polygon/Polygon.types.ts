import { DrawnCanvasProps, Position, FillArgs, StrokeArgs } from "../../RenderFrame.types";

export interface PolygonArgs extends DrawnCanvasProps, FillArgs, StrokeArgs {
  pos: Position;
  sides: number | Position[];
  size: number;
}

