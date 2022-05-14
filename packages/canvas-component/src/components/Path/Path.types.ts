import { Position, BaseArgs, StrokeArgs } from "../../RenderFrame.types";

export interface PathArgs extends BaseArgs, StrokeArgs {
  points?: Position[];
}
