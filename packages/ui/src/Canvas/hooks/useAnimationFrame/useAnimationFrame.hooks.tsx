import { useMemo } from "react";
import {
  useRequestAnimationFrame,
  RequestAnimationFrameConfig,
} from "../useRequestAnimationFrame";
import { cubicBezier } from "./useAnimationFrame.utilities";

type Easing = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";
export interface UseAnimationFrameArgs
  extends Partial<RequestAnimationFrameConfig> {
  duration: number;
  from: number;
  to: number;
  easing?: Easing | [number, number, number, number];
}

export function useAnimationFrame({
  from,
  to,
  easing = "linear",
  ...rest
}: UseAnimationFrameArgs) {
  const easingFunction = useMemo(() => {
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

  return useRequestAnimationFrame((curr) => {
    return from + (to - from) * easingFunction(curr / rest.duration);
  }, rest);
}
