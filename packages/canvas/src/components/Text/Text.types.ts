import { Position, BaseArgs, StrokeArgs, FillArgs } from "../../RenderFrame.types";

export interface TextProps extends BaseArgs, StrokeArgs, FillArgs, Partial<CanvasTextDrawingStyles> {
  pos: Position;
  text: string;
  maxWidth?: number;
}

