import { useRef } from "react";
import { useRenderFrame } from "../../RenderFrame.hooks";
import { CreateConicGradientArgs } from "./useConicGradient.types";

export function useConicGradient({colorStops = [], ...args}: CreateConicGradientArgs) {
  const gradient = useRef<CanvasGradient>();

  useRenderFrame((ctx) => {
    const grd = ctx.createConicGradient(args.angle, args.center.x, args.center.y);

    for (let colorStop of colorStops) {
      grd.addColorStop(...colorStop);
    }

    gradient.current = grd;
  });

  return gradient.current;

}
