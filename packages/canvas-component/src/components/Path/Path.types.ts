import { Position, BaseArgs, StrokeArgs } from "../../createDrawing.types";

export interface PathArgs extends BaseArgs, StrokeArgs {
  points?: Position[];
}
