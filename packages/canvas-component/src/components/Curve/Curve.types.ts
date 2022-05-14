import {
  BaseArgs,
  FillArgs,
  Position,
  StrokeArgs,
} from "../../RenderFrame.types";

// points: number[], tension = 0.5, numOfSeg = 25, close = false
export interface CurveArgs extends BaseArgs, StrokeArgs, FillArgs {
  points: Position[];
  tension?: number;
  numOfSeg?: number;
  close?: boolean;
}
