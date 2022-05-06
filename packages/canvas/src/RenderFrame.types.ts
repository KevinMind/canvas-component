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
  rotation?: number;
  filter?: CanvasRenderingContext2D['filter'];
  shadowColor?: CanvasRenderingContext2D['shadowColor'];
  shadowBlur?: CanvasRenderingContext2D['shadowBlur'];
  shadowOffsetX?: CanvasRenderingContext2D['shadowOffsetX'];
  shadowOffsetY?: CanvasRenderingContext2D['shadowOffsetY'];
}

export interface ShapeArgs {
  pos: Position;
}

export interface FillArgs {
  fillStyle?: CanvasRenderingContext2D['fillStyle'];
}

export interface StrokeArgs {
  strokeStyle?: CanvasRenderingContext2D['strokeStyle'];
  lineWidth?: CanvasRenderingContext2D['lineWidth'];
  lineCap?: CanvasRenderingContext2D['lineCap'];
  lineDashOffset?: CanvasRenderingContext2D['lineDashOffset'];
  lineJoin?: CanvasRenderingContext2D['lineJoin'];
  lineDash?: Parameters<CanvasRenderingContext2D['setLineDash']>[0];
}

export interface DrawingArguments extends Partial<BaseArgs>, Partial<ShapeArgs>, Partial<FillArgs>, Partial<StrokeArgs> {}

export interface RenderFrameProps {
  fillStyle?: string;
  strokeStyle?: string;
}
