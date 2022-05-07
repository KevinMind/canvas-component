import { Position } from "../../RenderFrame.types";

type ColorStopArgs = [...Parameters<CanvasGradient['addColorStop']>];

export interface CreateLinearGradientArgs {
  start: Position;
  end: Position;
  colorStops?: ColorStopArgs[];
}

