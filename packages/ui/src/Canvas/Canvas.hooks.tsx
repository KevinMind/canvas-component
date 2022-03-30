import { useContext, useEffect } from "react";

import { CanvasContext } from "./Canvas.context";
import { Draw } from "./Canvas.types";

export function useCanvasContext() {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error(
      "useCanvas() must be called within a <CanvasProvider> component scope"
    );
  }

  return context;
}

export function useCanvas() {
  const context = useCanvasContext();

  return context.canvas?.getContext("2d") ?? null;
}

export function useCanvasFrame(draw: Draw) {
  const context = useCanvasContext();

  useEffect(() => {
    if (!context) return;

    context.addDrawing(draw);

    return () => {
      context.removeDrawing(draw);
    };
  }, [draw, context]);
}
