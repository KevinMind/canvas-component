import { createDrawing } from "../../RenderFrame.utilities";

import {
  CreateConicGradientArgs,
  CreateLinearGradientArgs,
  CreateRadialGradientArgs,
} from "./Gradient.types";

export const createConicGradient = createDrawing<
  CreateConicGradientArgs,
  CanvasGradient
>((ctx, { colorStops = [], ...args }) => {
  const grd = ctx.createConicGradient(args.angle, args.center.x, args.center.y);

  for (let colorStop of colorStops) {
    grd.addColorStop(...colorStop);
  }

  return grd;
});

export const createLinearGradient = createDrawing<
  CreateLinearGradientArgs,
  CanvasGradient
>((ctx, { colorStops = [], ...args }) => {
  const grd = ctx.createLinearGradient(
    args.start.x,
    args.start.y,
    args.end.x,
    args.end.y
  );

  for (let colorStop of colorStops) {
    grd.addColorStop(...colorStop);
  }

  return grd;
});

export const createRadialGradient = createDrawing<
  CreateRadialGradientArgs,
  CanvasGradient
>((ctx, { colorStops = [], ...args }) => {
  const grd = ctx.createRadialGradient(
    args.start.x,
    args.start.y,
    args.startRadius,
    args.end.x,
    args.end.y,
    args.endRadius
  );

  for (let colorStop of colorStops) {
    grd.addColorStop(...colorStop);
  }

  return grd;
});
