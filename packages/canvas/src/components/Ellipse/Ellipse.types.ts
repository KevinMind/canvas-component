import { DrawnCanvasProps, Position, FillArgs, StrokeArgs} from "../../RenderFrame.types";

export interface EllipseArgs extends DrawnCanvasProps, FillArgs, StrokeArgs {
  pos: Position;
  radius: number;
  radiusY?: number;
}
