import { BaseArgs, Position, StrokeArgs } from "../../RenderFrame.types";

export interface LineArgs extends BaseArgs, StrokeArgs {
  start: Position;
  cp1?: Position;
  cp2?: Position;
  points?: Position[];
  end: Position;
}
