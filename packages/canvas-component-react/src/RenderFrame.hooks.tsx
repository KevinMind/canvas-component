import { useContext, useEffect } from "react";
import { Draw } from "@canvas-component/core";

import { RenderFrameContext } from "./RenderFrame.context";
import { throwCanvasContext } from "./RenderFrame.utilities";

export function _usePrivateRenderFrameContext() {
  const context = useContext(RenderFrameContext);

  if (!context) {
    throwCanvasContext()
  }

  return context;
}

export function useRenderFrameCanvas(): [HTMLCanvasElement | null, {width: number; height: number}] {
  const {canvas} = _usePrivateRenderFrameContext();

  const {width = 0, height = 0} = canvas?.getBoundingClientRect() ?? {};

  return [canvas, {width, height}];
}

export function useRenderFrame(draw: Draw) {
  const context = _usePrivateRenderFrameContext();

  useEffect(() => {
    if (!context) return;

    context.add(draw);

    return () => {
      context.remove(draw);
    };
  }, [draw, context]);
}
