import React, {
  PropsWithChildren,
  useRef,
  useEffect,
  useState,
  useMemo,
} from "react";

import { RenderFrameContext } from "./RenderFrame.context";
import { Draw, RenderFrameProps } from "./RenderFrame.types";
import { useRequestAnimationFrame } from "./hooks/useRequestAnimationFrame";

export function RenderFrameProvider({
  children,
  fillStyle = "black",
  strokeStyle = "black",
}: PropsWithChildren<RenderFrameProps>) {
  const [ready, forceRender] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawings = useRef<Map<Draw, true>>(new Map());

  const { start, stop } = useRequestAnimationFrame((frame) => {
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");

    if (!context) return;

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    for (let draw of drawings.current.keys()) {
      context.fillStyle = fillStyle;
      context.strokeStyle = strokeStyle;
      context.resetTransform();
      context.setLineDash([]);
      context.beginPath();
      draw(context, frame);
    }
  });

  function add(draw: Draw) {
    if (!drawings.current.has(draw)) {
      drawings.current.set(draw, true);
    }
  }

  function remove(draw: Draw) {
    drawings.current.delete(draw);
  }

  function _addCanvas(ref: HTMLCanvasElement) {
    if (canvasRef.current === null) {
      canvasRef.current = ref;
      forceRender(true);
    } else if (!ref.isSameNode(canvasRef.current)) {
      throw new Error('<Canvas /> element already rendered in <RenderFrameProvider />');
    }
  }

  useEffect(() => {
    start();

    return () => {
      stop();
    };
  }, [start, stop]);

  const value = useMemo(() => {
    return {
      canvas: canvasRef.current,
      add,
      remove,
      _addCanvas,
    };
  }, [ready]);

  return (
    <RenderFrameContext.Provider value={value}>
      {children}
    </RenderFrameContext.Provider>
  );
}
