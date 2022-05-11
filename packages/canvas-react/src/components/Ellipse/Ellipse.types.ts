import { BaseArgs, FillArgs, StrokeArgs, ShapeArgs } from "../../RenderFrame.types";

export interface EllipseArgs extends BaseArgs, ShapeArgs, FillArgs, StrokeArgs {
  radius: number;
  radiusY?: number;
}
