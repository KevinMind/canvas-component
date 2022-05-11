export type PlayModes =
  | "forward"
  | "backward"
  | "pingpong"
  | "pingpong-backward";

export interface UseAnimationFrameRequiredArgs {
  from: number;
  to: number;
}

export interface UseAnimationFrameOptionalArgs {
  easing: ((percentage: number) => number);
  auto: boolean;
  interval: number;
  duration: number;
  infinite: boolean;
  mode: PlayModes;
}

export type UseAnimationFrameConfig = Required<UseAnimationFrameRequiredArgs> & UseAnimationFrameOptionalArgs;

export type UseAnimationFrameArgs = Partial<UseAnimationFrameOptionalArgs> & UseAnimationFrameRequiredArgs;