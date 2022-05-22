import {
  BaseArgs,
  ShapeArgs,
  FillArgs,
  StrokeArgs,
} from "../../createDrawing.types";

export interface RectArgs extends BaseArgs, ShapeArgs, FillArgs, StrokeArgs {
  width: number;
  height: number;
  borderRadius?: number;
}
