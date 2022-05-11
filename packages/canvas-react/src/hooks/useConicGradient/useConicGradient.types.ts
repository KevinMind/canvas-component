import { Position } from "../../RenderFrame.types";

type ColorStopArgs = [...Parameters<CanvasGradient['addColorStop']>];

export interface CreateConicGradientArgs {
  center: Position;
  angle: Parameters<CanvasRenderingContext2D['createConicGradient']>[0];
  colorStops?: ColorStopArgs[];
}

