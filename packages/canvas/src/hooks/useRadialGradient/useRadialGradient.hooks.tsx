import { useRef } from "react";
import { useRenderFrame } from "../../RenderFrame.hooks";
import { CreateRadialGradientArgs } from "./useRadialGradient.types";

export function useRadialGradient({colorStops = [], ...args}: CreateRadialGradientArgs) {
  const gradient = useRef<CanvasGradient>();

  useRenderFrame((ctx) => {
    const grd = ctx.createRadialGradient(args.start.x, args.start.y, args.startRadius, args.end.x, args.end.y, args.endRadius);

    for (let colorStop of colorStops) {
      grd.addColorStop(...colorStop);
    }

    gradient.current = grd;
  });

  return gradient.current;

}
