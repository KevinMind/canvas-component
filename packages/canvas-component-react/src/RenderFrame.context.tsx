import { createContext } from "react";
import { Draw } from "@canvas-component/core";

import { throwCanvasContext } from "./RenderFrame.utilities";

export interface RenderFrameContextValue {
  canvas: HTMLCanvasElement | null;
  add: (draw: Draw) => void;
  remove: (draw: Draw) => void;
  _addCanvas: (ref: HTMLCanvasElement) => void;
}

export const RenderFrameContext = createContext<RenderFrameContextValue>({
  canvas: null,
  add: throwCanvasContext,
  remove: throwCanvasContext,
  _addCanvas: throwCanvasContext,
});
