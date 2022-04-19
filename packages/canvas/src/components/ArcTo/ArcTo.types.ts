import { BaseArgs, Position, StrokeArgs } from "../../RenderFrame.types";

export interface ArcToArgs extends BaseArgs, StrokeArgs {
  pos0: Position;
  pos1: Position;
  pos2: Position;
  radius: number;
}

