import { BaseArgs, Position, FillArgs, StrokeArgs } from "../../RenderFrame.types";

export interface PolygonArgs extends BaseArgs, FillArgs, StrokeArgs {
  pos: Position;
  sides: number | Position[];
  size: number;
}

