import { BaseArgs, ShapeArgs, StrokeArgs, FillArgs } from "../../RenderFrame.types";

export interface TextProps extends BaseArgs, ShapeArgs, StrokeArgs, FillArgs, Partial<CanvasTextDrawingStyles> {
  text: string;
  maxWidth?: number;
}

