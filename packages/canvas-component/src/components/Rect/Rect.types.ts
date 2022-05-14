import {
  BaseArgs,
  ShapeArgs,
  FillArgs,
  StrokeArgs,
} from "../../RenderFrame.types";

export interface RectArgs extends BaseArgs, ShapeArgs, FillArgs, StrokeArgs {
  width: number;
  height: number;
  borderRadius?: number;
}
