import React, {
  PropsWithChildren,
  CanvasHTMLAttributes,
  useRef,
  useState,
  forwardRef,
  useEffect,
} from "react";

import { CanvasContext, Drawing } from "./Canvas.context";

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
  const drawings = useRef<Map<Drawing, true>>(new Map());

  const setCanvasRef = (ref: HTMLCanvasElement) => {
    canvasRef.current = ref;
    setReady(true);
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");

    if (!context) return;

    let frame = 0;
    let animationFrameId: number;

    const render = () => {
      frame++;
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      for (let draw of drawings.current.keys()) {
        context.fillStyle = fillStyle;
        context.strokeStyle = strokeStyle;
        context.resetTransform();
        context.setLineDash([]);
        context.beginPath();
        draw(context, frame);
      }
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [drawings, fillStyle, strokeStyle]);

  function add(draw: Drawing) {
    if (!drawings.current.has(draw)) {
      drawings.current.set(draw, true);
    }
  }

  function remove(draw: Drawing) {
    drawings.current.delete(draw);
  }

  return (
    <CanvasContext.Provider value={{ canvas: canvasRef.current, add, remove }}>
      <Canvas ref={setCanvasRef} {...canvasProps}>
        {children}
      </Canvas>
    </CanvasContext.Provider>
  );
}
