import { DrawnCanvasProps, Position, FillAndStrokeArgs} from "../../RenderFrame.types";

export interface EllipseArgs extends DrawnCanvasProps, FillAndStrokeArgs {
  pos: Position;
  radius: number;
  radiusY?: number;
}
