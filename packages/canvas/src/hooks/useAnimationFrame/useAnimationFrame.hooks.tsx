import { useRef, useEffect, useState, MutableRefObject } from "react";

import { linearEasing } from "./useAnimationFrame.utilities";
import { PlayModes, UseAnimationFrameArgs, UseAnimationFrameOptionalArgs } from "./useAnimationFrame.types";

function useRefValue<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

const defaultConfig: UseAnimationFrameOptionalArgs = {
  easing: linearEasing,
  mode: 'forward',
  duration: Number.MAX_SAFE_INTEGER,
  infinite: false,
  interval: 0,
  auto: false,
};

export function useAnimationFrame(inputConfig: UseAnimationFrameArgs): [
  number,
  { start(mode?: PlayModes): void; stop(): void; reset(): void }
] {
  const config = {...defaultConfig, ...inputConfig};

  // config parameters must be refs currently to prevent stale closures
  // @TODO: find out how to solve this without refs.
  const mode = useRef<PlayModes>(config.mode);
  const duration = useRefValue(config.duration);
  const easing = useRefValue(config.easing);
  const auto = useRefValue(config.auto);
  const interval = useRefValue(config.interval);
  const infinite = useRefValue(config.infinite);
  const from = useRefValue(config.from);
  const to = useRefValue(config.to);

  const [value, setValue] = useState(0);

  function _render(frame: number) {
    let step = mode.current?.includes("backward") ? duration.current - frame : frame;
    setValue(from.current + (to.current - from.current) * easing.current(step / duration.current));
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
        duration.current
      );

      if (frame >= duration.current) {
        _render(frame);

        if (!infinite.current) {
          return stop();
        }

        switch (mode.current) {
          case "forward":
          case "backward":
            return start(mode.current);
          case "pingpong":
            return start("pingpong-backward");
          case "pingpong-backward":
            return start("pingpong");
          default:
            return stop();
        }
      }

      if (frame - lastTime.current >= interval.current) {
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
    let isAuto = auto.current;
    if (isAuto) {
      start();
    }
    return () => {
      if (isAuto) {
        stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.auto]);

  return [value, { start, stop, reset }];
}
