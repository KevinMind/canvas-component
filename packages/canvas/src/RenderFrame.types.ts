export interface Position {
  x: number;
  y: number;
}

export interface Vertice {
  length: number; // 0-Infinity
  degree: number; // 0-180
}

export interface Draw {
  (ctx: CanvasRenderingContext2D, frame: number): void;
}

export interface BaseArgs {
  rotation: number;
  filter?: CanvasRenderingContext2D['filter'];
}

export interface FillArgs {
  fillStyle?: CanvasRenderingContext2D['fillStyle'];
}

export interface StrokeArgs {
  strokeStyle?: CanvasRenderingContext2D['strokeStyle'];
  lineWidth?: CanvasRenderingContext2D['lineWidth'];
}

export interface DrawingArguments extends Partial<BaseArgs>, Partial<FillArgs>, Partial<StrokeArgs> {}

export interface RenderFrameProps {
  fillStyle?: string;
  strokeStyle?: string;
}
