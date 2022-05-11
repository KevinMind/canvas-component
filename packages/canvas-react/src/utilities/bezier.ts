import bezier from 'bezier-easing';

export type EasingType = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

export function bezierEasing(easingType: EasingType | [number, number, number, number]): (p: number) => number {
  if (Array.isArray(easingType)) {
    return bezier(...easingType);
  }
  switch (easingType) {
    case "ease":
      return bezier(0.25, 0.1, 0.25, 0.1);
    case "ease-in":
      return bezier(0.42, 0, 1, 1);
    case "ease-out":
      return bezier(0, 0, 0.58, 1);
    case "ease-in-out":
      return bezier(0.42, 0, 0.58, 1);
    case "linear":
    default:
      return bezier(0, 0, 1, 1);
  }
}