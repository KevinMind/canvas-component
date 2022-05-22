import { useContext, useEffect } from "react";
import { Draw } from "@canvas-component/core";

import { RenderFrameContext } from "./RenderFrame.context";

export function useCanvas() {
  const context = useContext(RenderFrameContext);

  return context;
}

export function useRenderFrameCanvas(): [HTMLCanvasElement | null, {width: number; height: number}] {
  const context = useCanvas();

  if (!context) {
    return [null, {
      height: 0,
      width: 0,
    }];
  }

  const {width, height} = context.canvas.getBoundingClientRect();

  return [context.canvas, {width, height}];
}

export function useRenderFrame(draw: Draw) {
  const context = useCanvas();

  useEffect(() => {
    if (!context) return;

    context.add(draw);

    return () => {
      context.remove(draw);
    };
  }, [draw, context]);
}
