import { Position } from "../../RenderFrame.types";

type ColorStopArgs = [...Parameters<CanvasGradient["addColorStop"]>];

export interface CreateConicGradientArgs {
  center: Position;
  angle: Parameters<CanvasRenderingContext2D["createConicGradient"]>[0];
  colorStops?: ColorStopArgs[];
}

export interface CreateLinearGradientArgs {
  start: Position;
  end: Position;
  colorStops?: ColorStopArgs[];
  // @TODO: remove hack to force using some of base args
  center: never;
}

export interface CreateRadialGradientArgs {
  start: Position;
  startRadius: number;
  end: Position;
  endRadius: number;
  colorStops?: ColorStopArgs[];
  // @TODO: remove hack to force using some of base args
  center: never;
}
