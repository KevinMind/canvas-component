export type PlayModes =
  | "forward"
  | "backward"
  | "pingpong"
  | "pingpong-backward";

export interface AnimationRequiredArgs {
  from: number;
  to: number;
}

export interface AnimationOptionalArgs {
  easing: (percentage: number) => number;
  auto: boolean;
  interval: number;
  duration: number;
  infinite: boolean;
  mode: PlayModes;
}

export type AnimationConfig = AnimationRequiredArgs & AnimationOptionalArgs;

export type AnimationArgs = Partial<AnimationOptionalArgs> &
  AnimationRequiredArgs;
