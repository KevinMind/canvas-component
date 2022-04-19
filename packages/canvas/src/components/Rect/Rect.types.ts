import { BaseArgs, Position, FillArgs, StrokeArgs } from "../../RenderFrame.types";

export interface RectArgs extends BaseArgs, FillArgs, StrokeArgs {
  pos: Position;
  width: number;
  height: number;
}

