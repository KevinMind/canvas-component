import { useRef } from "react";

export function useRequestAnimationFrame(
  callback: (timestamp: number) => void
): { start: () => void; stop: () => void } {
  let id = useRef<number>();

  function stop() {
    if (id.current) {
      window.cancelAnimationFrame(id.current);
    }
  }

  function start() {
    // @TODO: it is unclear what should be the first time stamp. performance.now() consistently returns
    // values greater than the first actual animated frame.
    function render(currentTime = 0) {
      callback(currentTime);
      id.current = window.requestAnimationFrame(render);
    }

    render();
  }

  return { start, stop };
}
