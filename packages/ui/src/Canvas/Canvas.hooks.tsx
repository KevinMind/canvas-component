import { useContext, useEffect } from "react";

import { CanvasContext, Drawing } from "./Canvas.context";

export function useCanvas() {
  const context = useContext(CanvasContext);

  if (!context) {
    throw new Error(
      "useCanvas() must be called within a <CanvasProvider> component scope"
    );
  }

  return context.canvas?.getContext("2d") ?? null;
}

export function useCanvasFrame(draw: Drawing) {
  const context = useContext(CanvasContext);

  useEffect(() => {
    if (!context) return;

    context.add(draw);

    return () => {
      context.remove(draw);
    };
  }, [draw, context]);
}
