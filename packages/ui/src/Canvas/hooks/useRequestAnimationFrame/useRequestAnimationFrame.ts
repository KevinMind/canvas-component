import { useEffect, useRef } from "react";

export function useRequestAnimationFrame(
  callback: (int: number) => void,
  interval = 0
) {
  const last = useRef<number>(0);
  useEffect(() => {
    let id: number;

    function render(frame = 0) {
      if (frame - last.current >= interval) {
        callback(frame);
        last.current = frame;
      }

      id = window.requestAnimationFrame(render);
    }

    render();

    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [callback, interval]);
}
