import { useRef, useState, useEffect, useMemo } from "react";

export type RequestAnimationFrameCallback<T> = (
  currentFrame: number,
  totalFrames: number
) => T;

type PlayModes = "forward" | "backward" | "pingpong" | "pingpong-backward";

interface RequestAnimationPlayOptions {
  duration: number;
  infinite: boolean;
  mode: PlayModes;
}

export type RequestAnimationFrameReturnType<T> = [
  T,
  {
    start: (config?: Partial<RequestAnimationPlayOptions>) => void;
    stop: () => void;
    reset: () => void;
  }
];

export interface RequestAnimationFrameConfig
  extends RequestAnimationPlayOptions {
  auto: boolean;
  interval: number;
  from: number;
  to: number;
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

const defaultConfig: RequestAnimationFrameConfig = {
  auto: false,
  interval: 0,
  duration: Number.MAX_SAFE_INTEGER,
  infinite: false,
  mode: "forward",
  from: 0,
  to: 100,
};

export function useRequestAnimationFrame<T = void>(
  callback: RequestAnimationFrameCallback<T>,
  inputConfig: Partial<RequestAnimationFrameConfig> = defaultConfig
): RequestAnimationFrameReturnType<T> {
  const baseConfig = useMemo(
    () => ({
      ...defaultConfig,
      ...inputConfig,
    }),
    [inputConfig]
  );

  const [value, setValue] = useState<T>(callback(0, baseConfig.duration));

  let id = useRef<number>();
  const startTime = useRef<number>(0);
  const lastTime = useRef<number>(0);

  function _render(playMode: PlayModes, frame: number, duration: number) {
    let step = playMode?.includes("backward") ? duration! - frame : frame;
    setValue(callback(step, duration));
  }

  function stop() {
    if (id.current) {
      window.cancelAnimationFrame(id.current);
    }
  }

  function start(playOptions: Partial<RequestAnimationPlayOptions> = {}) {
    const {
      duration,
      infinite,
      interval,
      mode: playMode,
    } = { ...baseConfig, ...playOptions };

    if (playMode === "backward" && !duration) {
      throw new Error(
        "must provide duration when playing backwards, otherwise we play backwards from infinity..."
      );
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
        _render(playMode, frame, duration);

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
        _render(playMode, frame, duration);
        lastTime.current = frame;
      }

      id.current = window.requestAnimationFrame(render);
    }

    _render(playMode, 0, duration);
    render(performance.now(), true);
  }

  function reset() {
    _render(baseConfig.mode, 0, baseConfig.duration);
  }

  useEffect(() => {
    if (baseConfig.auto) {
      start();
    }
    return () => {
      if (baseConfig.auto) {
        stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseConfig.auto]);

  return [value, { start, stop, reset }];
}
