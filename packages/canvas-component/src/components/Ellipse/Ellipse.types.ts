import {
  BaseArgs,
  FillArgs,
  StrokeArgs,
  ShapeArgs,
} from "../../createDrawing.types";

export interface EllipseArgs extends BaseArgs, ShapeArgs, FillArgs, StrokeArgs {
  radius: number;
  radiusY?: number;
}
