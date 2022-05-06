import { BaseArgs, Position, FillArgs, StrokeArgs, ShapeArgs } from "../../RenderFrame.types";

export interface PolygonArgs extends BaseArgs, ShapeArgs, FillArgs, StrokeArgs {
  sides: number | Position[];
  size: number;
}

