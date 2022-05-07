import { Position } from "../../RenderFrame.types";

type ColorStopArgs = [...Parameters<CanvasGradient['addColorStop']>];

export interface CreateRadialGradientArgs {
  start: Position;
  startRadius: number;
  end: Position;
  endRadius: number;
  colorStops?: ColorStopArgs[];
}

