import { useRef, useState } from "react";

export type RequestAnimationFrameCallback<T> = (
  frame: number,
  duration: number
) => T;

export type RequestAnimationFrameReturnType<T> = [
  T,
  { start: (duration?: number) => void; stop: () => void; reset: () => void }
];

/**
 * todo:
 *
 * play mode: forward/backward/pingpong/random
 *
 * start({mode: 'forward'}) ->
 * * start({mode: 'pingpong'}) <->
 *
 * from/to: play from a frame and two a frame
 *
 * start({from: 3_000, to: 230_000}); first plays from 3-230 seconds/frames
 *
 * interval: only recompute value on specified interval
 *
 * infinite: replay with current settings infinitely
 *
 * auto: automatically start on mount of the calling component
 */
export function useRequestAnimationFrame<T = void>(
  callback: RequestAnimationFrameCallback<T>
): RequestAnimationFrameReturnType<T> {
  const [value, setValue] = useState<T>(callback(0, 0));

  let id = useRef<number>();
  const startTime = useRef<number>(0);

  function stop() {
    if (id.current) {
      window.cancelAnimationFrame(id.current);
    }
  }

  function start(duration = 0) {
    function render(currentTime: number, isFirst = false) {
      if (isFirst) {
        startTime.current = currentTime;
      }

      let frame = Math.max(currentTime - startTime.current, 0);

      if (duration && frame > duration) {
        return stop();
      }

      setValue(callback(frame, duration));

      id.current = window.requestAnimationFrame(render);
    }

    render(performance.now(), true);
  }

  function reset() {
    setValue(callback(0, 0));
  }

  return [value, { start, stop, reset }];
}
