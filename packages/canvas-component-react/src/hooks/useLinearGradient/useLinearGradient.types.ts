import { Position } from "@canvas-component/core";

type ColorStopArgs = [...Parameters<CanvasGradient['addColorStop']>];

export interface CreateLinearGradientArgs {
  start: Position;
  end: Position;
  colorStops?: ColorStopArgs[];
}

