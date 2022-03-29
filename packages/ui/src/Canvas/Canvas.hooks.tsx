import { useContext, useEffect } from "react";

import { CanvasContext } from "./Canvas.context";
import { Draw } from "./Canvas.types";

export function useCanvas() {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error(
      "useCanvas() must be called within a <CanvasProvider> component scope"
    );
  }

  return context.canvas?.getContext("2d") ?? null;
}

export function useCanvasFrame(draw: Draw) {
  const context = useContext(CanvasContext);

  useEffect(() => {
    if (!context) return;

    context.add(draw);

    return () => {
      context.remove(draw);
    };
  }, [draw, context]);
}
