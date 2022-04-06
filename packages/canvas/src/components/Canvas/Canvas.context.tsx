import { createContext } from "react";
import { Draw } from "./Canvas.types";
export interface CanvasContextValue {
  canvas: HTMLCanvasElement | null;
  add: (draw: Draw) => void;
  remove: (draw: Draw) => void;
}

export const CanvasContext = createContext<CanvasContextValue>({
  canvas: null,
  add: () => {},
  remove: () => {},
});
