import { createContext } from "react";
import { Draw } from "./Canvas.types";
export interface CanvasContextValue {
  canvas: HTMLCanvasElement | null;
  addDrawing: (draw: Draw) => void;
  removeDrawing: (draw: Draw) => void;
  start(): void;
  stop(): void;
}

export const CanvasContext = createContext<CanvasContextValue>({
  canvas: null,
  addDrawing: () => {},
  removeDrawing: () => {},
  start: () => {},
  stop: () => {},
});
