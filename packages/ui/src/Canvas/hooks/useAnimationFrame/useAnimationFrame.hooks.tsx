import {
  useRequestAnimationFrame,
  RequestAnimationFrameConfig,
} from "../useRequestAnimationFrame";

export interface UseAnimationFrameArgs
  extends Partial<RequestAnimationFrameConfig> {
  duration: number;
  from: number;
  to: number;
}

export function useAnimationFrame({
  from,
  to,
  ...rest
}: UseAnimationFrameArgs) {
  /**
   * implement animation frame that more closely reflects the needs of animations
   *
   * 1. should have curves "linear", "cubic" etc.
   *
   */

  return useRequestAnimationFrame((curr) => {
    return from + (to - from) * (curr / rest.duration);
  }, rest);
}
