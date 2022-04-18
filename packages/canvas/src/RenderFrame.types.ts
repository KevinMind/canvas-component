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

export interface DrawnCanvasProps {
  rotation: number;
}

export interface FillArgs {
  fillStyle?: string;
}

export interface StrokeArgs {
  strokeStyle?: string;
  lineWidth?: number;
}

export interface DrawingArguments extends Partial<DrawnCanvasProps>, Partial<FillArgs>, Partial<StrokeArgs> {}

export interface RenderFrameProps {
  fillStyle?: string;
  strokeStyle?: string;
}
