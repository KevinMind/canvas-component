import React, {
  PropsWithChildren,
  CanvasHTMLAttributes,
  useRef,
  useState,
  forwardRef,
  useEffect,
} from "react";

import { CanvasContext } from "./Canvas.context";
import { Draw } from "./Canvas.types";
import { useRequestAnimationFrame } from "./hooks/useRequestAnimationFrame";

const Canvas = forwardRef<
  HTMLCanvasElement,
  PropsWithChildren<CanvasHTMLAttributes<{}>>
>(({ children, ...props }, ref) => {
  return (
    <canvas {...props} ref={ref}>
      {children}
    </canvas>
  );
});

interface Props {
  fillStyle?: string;
  strokeStyle?: string;
}

export function CanvasProvider({
  children,
  fillStyle = "black",
  strokeStyle = "black",
  ...canvasProps
}: PropsWithChildren<CanvasHTMLAttributes<{}>> & Props) {
  const [, setReady] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawings = useRef<Map<Draw, true>>(new Map());

  const setCanvasRef = (ref: HTMLCanvasElement) => {
    canvasRef.current = ref;
    setReady(true);
  };

  const [, actions] = useRequestAnimationFrame((frame) => {
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

  useEffect(() => {
    actions.start();

    return () => {
      actions.stop();
    };
  }, [actions]);

  function addDrawing(draw: Draw) {
    if (!drawings.current.has(draw)) {
      drawings.current.set(draw, true);
    }
  }

  function removeDrawing(draw: Draw) {
    drawings.current.delete(draw);
  }

  return (
    <CanvasContext.Provider
      value={{
        canvas: canvasRef.current,
        addDrawing,
        removeDrawing,
        start: actions.start,
        stop: actions.stop,
      }}
    >
      <Canvas ref={setCanvasRef} {...canvasProps}>
        {children}
      </Canvas>
    </CanvasContext.Provider>
  );
}
