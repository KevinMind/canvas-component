import { IntCanvas } from "./Canvas.types";
import { Draw } from "./createDrawing.types";
import { createDrawing } from "./createDrawing.utilities";
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

export class Canvas implements IntCanvas {
  #id?: number;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  drawings: Map<Draw, true> = new Map();

  #avgCycleTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("cannot find canvas context");
    }

    this.canvas = canvas;
    this.context = context;

    const dpr = window.devicePixelRatio;
    const rect = this.canvas.getBoundingClientRect();

    console.log({ dpr, rect });

    // this.canvas.width = rect.width * dpr;
    // this.canvas.height = rect.height * dpr;

    // this.context.scale(dpr, dpr);

    // this.canvas.style.width = rect.width + "px";
    // this.canvas.style.height = rect.height + "px";
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  public start(): void {
    const render = (frame = 0) => {
      this.render(frame);
      this.#id = window.requestAnimationFrame(render);
    };

    render();
  }

  public stop(): void {
    if (this.#id) {
      window.cancelAnimationFrame(this.#id);
      this.#id = 0;
    }
  }

  private render(frame = 0) {
    this.context.clearRect(0, 0, this.width, this.height);

    for (let draw of this.drawings.keys()) {
      draw(this.context, frame);
    }
  }

  public add(draw: Draw) {
    if (!this.drawings.has(draw)) {
      this.drawings.set(draw, true);
    }
  }

  public remove(draw: Draw) {
    this.drawings.delete(draw);
  }

  public createConicGradient(args: CreateConicGradientArgs) {
    return createConicGradient(this.context, args);
  }

  public createLinearGradient(args: CreateLinearGradientArgs) {
    return createLinearGradient(this.context, args);
  }

  public createRadialGradient(args: CreateRadialGradientArgs) {
    return createRadialGradient(this.context, args);
  }

  public get size(): number {
    return this.drawings.size;
  }
}
