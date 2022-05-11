import { Position, BaseArgs, StrokeArgs } from "../../RenderFrame.types";

export interface PathProps extends BaseArgs, StrokeArgs {
  points?: Position[];
}

