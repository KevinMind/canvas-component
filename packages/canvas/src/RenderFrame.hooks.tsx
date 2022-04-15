import { useContext, useEffect } from "react";

import { RenderFrameContext } from "./RenderFrame.context";
import { Draw } from "./RenderFrame.types";
import { throwCanvasContext } from "./RenderFrame.utilities";

export function _usePrivateRenderFrameContext() {
  const context = useContext(RenderFrameContext);

  if (!context) {
    throwCanvasContext()
  }

  return context;
}

export function useRenderFrameCanvas() {
  const {canvas} = _usePrivateRenderFrameContext();

  return canvas;
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
