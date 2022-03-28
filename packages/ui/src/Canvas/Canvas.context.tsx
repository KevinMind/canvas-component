import { createContext } from "react";

export type Drawing = (
  context: CanvasRenderingContext2D,
  frame: number
) => void;

interface CanvasContextValue {
  canvas: HTMLCanvasElement | null;
  add: (draw: Drawing) => void;
  remove: (draw: Drawing) => void;
}

export const CanvasContext = createContext<CanvasContextValue>({
  canvas: null,
  add: () => {},
  remove: () => {},
});
