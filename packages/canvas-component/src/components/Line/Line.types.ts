import { BaseArgs, Position, StrokeArgs } from "../../RenderFrame.types";

export interface LineArgs extends BaseArgs, StrokeArgs {
  start: Position;
  points?: Position[];
  end: Position;
  smooth?: boolean;
  showControlPoints?: boolean;
}
