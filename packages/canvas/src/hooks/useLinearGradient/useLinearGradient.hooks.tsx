import { useRef } from "react";
import { useRenderFrame } from "../../RenderFrame.hooks";
import { CreateLinearGradientArgs } from "./useLinearGradient.types";

export function useLinearGradient({colorStops = [], ...args}: CreateLinearGradientArgs) {
  const gradient = useRef<CanvasGradient>();

  useRenderFrame((ctx) => {
    const grd = ctx.createLinearGradient(args.start.x, args.start.y, args.end.x, args.end.y);

    for (let colorStop of colorStops) {
      grd.addColorStop(...colorStop);
    }

    gradient.current = grd;
  });

  return gradient.current;

}
