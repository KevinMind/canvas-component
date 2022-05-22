import React, {
  useEffect,
  useState,
} from "react";
import { Canvas } from "@canvas-component/core";

import { RenderFrameContext } from "./RenderFrame.context";
import { RenderFrameProps } from "./RenderFrame.types";

export function RenderFrameProvider({
  children,
  ...props
}: RenderFrameProps) {
  const [context, setContext] = useState<Canvas | null>(null);

  function createCanvas(el: HTMLCanvasElement) {
    if (el && !context) {
      setContext(new Canvas(el));
    }
  }

  useEffect(() => {
    if (context) {
      context.start();
    }
    return () => {
      if (context) {
        context.stop();
      }
    }
  }, [context]);

  return (
    <RenderFrameContext.Provider value={context}>
      <canvas {...props} ref={createCanvas}>
        {children}
      </canvas>
    </RenderFrameContext.Provider>
  );
}
