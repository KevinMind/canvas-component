import { BaseArgs, Position, FillArgs, StrokeArgs} from "../../RenderFrame.types";

export interface EllipseArgs extends BaseArgs, FillArgs, StrokeArgs {
  pos: Position;
  radius: number;
  radiusY?: number;
}
