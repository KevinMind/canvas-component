import { useRef, useState, useEffect } from "react";

export type RequestAnimationFrameCallback<T> = (frame: number) => T;

type PlayModes = "forward" | "backward" | "pingpong" | "pingpong-backward";

interface RequestAnimationPlayOptions {
  duration?: number;
  infinite?: boolean;
  mode?: Omit<PlayModes, "pingpong-backward">;
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
 * figure out how to correctly implement initial value.. needs to be based on mode at setup and play
 *
 * timing is not correct. I don't fully understand the cause but around 0 intervals are not 0 seconds.
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
    mode: baseMode = "forward",
  }: RequestAnimationFrameConfig = {
    auto: false,
    interval: 0,
    mode: "forward",
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
    const duration = playOptions.duration || baseDuration;
    const infinite = playOptions.infinite || baseInfinite;
    let playMode = playOptions.mode || baseMode;

    if (playMode === "backward" && !duration) {
      throw new Error(
        "must provide duration when playing backwards, otherwise we play backwards from infinity..."
      );
    }

    function innerRender(frame: number) {
      let step = playMode.includes("backward") ? duration! - frame : frame;
      setValue(callback(step));
    }

    function render(currentTime: number, isFirst = false) {
      if (isFirst) {
        startTime.current = currentTime;
        lastTime.current = 0;
      }

      let frame = Math.min(
        Math.max(Math.round(currentTime - startTime.current), 0),
        duration || Infinity
      );

      if (duration && frame >= duration) {
        innerRender(frame);

        switch (playMode) {
          case "forward":
          case "backward":
            return infinite ? start(playOptions) : stop();
          case "pingpong":
            return start({
              ...playOptions,
              mode: "pingpong-backward" as PlayModes,
            });
          case "pingpong-backward":
            return start({
              ...playOptions,
              mode: "pingpong",
            });
          default:
            return stop();
        }
      }

      if (frame - lastTime.current >= interval) {
        innerRender(frame);
        lastTime.current = frame;
      }

      id.current = window.requestAnimationFrame(render);
    }

    innerRender(0);
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
