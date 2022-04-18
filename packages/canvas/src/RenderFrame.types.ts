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

export interface FillAndStrokeArgs {
  fillStyle?: string;
}

export interface DrawingArguments extends Partial<DrawnCanvasProps>, Partial<FillAndStrokeArgs> {}

export interface RenderFrameProps {
  fillStyle?: string;
  strokeStyle?: string;
}
