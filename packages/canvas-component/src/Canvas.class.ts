import { IntCanvas } from "./Canvas.types";
import { Draw } from "./createDrawing.types";
import { createDrawing } from "./createDrawing.utilities";
import {
  CreateConicGradientArgs,
  CreateLinearGradientArgs,
  CreateRadialGradientArgs,
} from "./Gradient.types";
import { InteractionManager } from "./engine/InteractionManager";

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
  interaction: InteractionManager;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("cannot find canvas context");
    }

    this.canvas = canvas;
    this.context = context;
    this.interaction = new InteractionManager(canvas);
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  public start(): void {
    const self = this;
    function render(frame = 0) {
      self.render(frame);
      self.#id = window.requestAnimationFrame(render);
    }

    render();
  }

  public stop(): void {
    if (this.#id) {
      window.cancelAnimationFrame(this.#id);
      this.#id = 0;
    }
    this.interaction.destroy();
  }

  private render(frame = 0) {
    this.context.clearRect(0, 0, this.width, this.height);

    this.drawings.forEach((_, draw) => {
      this.context.resetTransform();
      this.context.setLineDash([]);
      this.context.beginPath();
      draw(this.context, frame);
    });
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
}
