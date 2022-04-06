import { useRef, useEffect, useMemo, useState } from "react";
import { cubicBezier } from "./useAnimationFrame.utilities";

export type Easing = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

export type PlayModes =
  | "forward"
  | "backward"
  | "pingpong"
  | "pingpong-backward";
export interface UseAnimationFrameConfig {
  from: number;
  to: number;
  easing:
    | Easing
    | [number, number, number, number]
    | ((time: number) => number);
  auto: boolean;
  interval: number;
  duration: number;
  infinite: boolean;
  mode: PlayModes;
}

export type UseAnimationFrameArgs = Partial<UseAnimationFrameConfig> &
  Pick<UseAnimationFrameConfig, "from" | "to">;

export function useAnimationFrame({
  from,
  to,
  easing = "linear",
  mode: defaultMode = "forward",
  duration = Number.MAX_SAFE_INTEGER,
  infinite = false,
  interval = 0,
  auto = false,
}: UseAnimationFrameArgs): [
  number,
  { start(mode?: PlayModes): void; stop(): void; reset(): void }
] {
  const easingFunction = useMemo(() => {
    if (typeof easing === "function") {
      return easing;
    }
    if (Array.isArray(easing)) {
      return cubicBezier(...easing);
    }
    switch (easing) {
      case "ease":
        return cubicBezier(0.25, 0.1, 0.25, 0.1);
      case "ease-in":
        return cubicBezier(0.42, 0, 1, 1);
      case "ease-out":
        return cubicBezier(0, 0, 0.58, 1);
      case "ease-in-out":
        return cubicBezier(0.42, 0, 0.58, 1);
      case "linear":
      default:
        return cubicBezier(0, 0, 1, 1);
    }
  }, [easing]);

  const mode = useRef<PlayModes>(defaultMode);

  const [value, setValue] = useState(0);

  function _render(frame: number) {
    let step = mode.current?.includes("backward") ? duration - frame : frame;
    setValue(from + (to - from) * easingFunction(step / duration));
  }

  let id = useRef<number>();
  const startTime = useRef<number>(0);
  const lastTime = useRef<number>(0);

  function stop() {
    if (id.current) {
      window.cancelAnimationFrame(id.current);
    }
  }

  function start(playMode?: PlayModes) {
    if (playMode) {
      mode.current = playMode;
    }

    function render(currentTime: number, isFirst = false) {
      if (isFirst) {
        startTime.current = currentTime;
        lastTime.current = 0;
      }

      let frame = Math.min(
        Math.max(Math.round(currentTime - startTime.current), 0),
        duration
      );

      if (frame >= duration) {
        _render(frame);

        switch (mode.current) {
          case "forward":
          case "backward":
            return infinite ? start(mode.current) : stop();
          case "pingpong":
            return start("pingpong-backward");
          case "pingpong-backward":
            return start("pingpong");
          default:
            return stop();
        }
      }

      if (frame - lastTime.current >= interval) {
        _render(frame);
        lastTime.current = frame;
      }

      id.current = window.requestAnimationFrame(render);
    }

    _render(0);
    render(performance.now(), true);
  }

  function reset() {
    _render(0);
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
