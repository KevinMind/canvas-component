import { BaseArgs, Position, StrokeArgs } from "../../RenderFrame.types";

// points: number[], tension = 0.5, numOfSeg = 25, close = false
export interface CurveProps extends BaseArgs, StrokeArgs {
  points: Position[];
  tension?: number;
  numOfSeg?: number;
  close?: boolean;
}

