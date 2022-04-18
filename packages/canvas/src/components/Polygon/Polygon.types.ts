import { DrawnCanvasProps, Position, FillAndStrokeArgs } from "../../RenderFrame.types";

export interface PolygonArgs extends DrawnCanvasProps, FillAndStrokeArgs {
  pos: Position;
  sides: number | Position[];
  size: number;
}

