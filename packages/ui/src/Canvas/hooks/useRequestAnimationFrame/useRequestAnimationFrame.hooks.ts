import { useRef, useState, useEffect } from "react";

export type RequestAnimationFrameCallback<T> = (frame: number) => T;

interface RequestAnimationPlayOptions {
  duration?: number;
  infinite?: boolean;
}

export type RequestAnimationFrameReturnType<T> = [
  T,
  {
    start: (config?: RequestAnimationPlayOptions) => void;
    stop: () => void;
    reset: () => void;
  }
];

export interface RequestAnimationFrameConfig
  extends RequestAnimationPlayOptions {
  auto?: boolean;
  interval?: number;
}

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
 */
export function useRequestAnimationFrame<T = void>(
  callback: RequestAnimationFrameCallback<T>,
  {
    auto = false,
    interval = 0,
    duration: baseDuration,
    infinite: baseInfinite,
  }: RequestAnimationFrameConfig = {
    auto: false,
    interval: 0,
  }
): RequestAnimationFrameReturnType<T> {
  const [value, setValue] = useState<T>(callback(0));

  let id = useRef<number>();
  const startTime = useRef<number>(0);
  const lastTime = useRef<number>(0);

  function stop() {
    if (id.current) {
      window.cancelAnimationFrame(id.current);
    }
  }

  function start(playOptions: RequestAnimationPlayOptions = {}) {
    function render(currentTime: number, isFirst = false) {
      const duration = playOptions.duration || baseDuration;
      const infinite = playOptions.infinite || baseInfinite;

      if (isFirst) {
        startTime.current = currentTime;
        lastTime.current = 0;
      }

      let frame = Math.round(Math.max(currentTime - startTime.current, 0));

      if (duration && frame > duration) {
        if (infinite) {
          return start(playOptions);
        }
        setValue(callback(frame));
        return stop();
      }

      if (frame - lastTime.current >= interval) {
        setValue(callback(frame));
        lastTime.current = frame;
      }

      id.current = window.requestAnimationFrame(render);
    }

    // pre-render first frame
    setValue(callback(0));
    render(performance.now(), true);
  }

  function reset() {
    setValue(callback(0));
  }

  useEffect(() => {
    if (auto) {
      start();
    }
    return () => {
      if (auto) {
        stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  return [value, { start, stop, reset }];
}
