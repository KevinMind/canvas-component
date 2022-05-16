import { IntCanvas } from "./Canvas.types";
import { Draw } from "./RenderFrame.types";

export class Canvas implements IntCanvas {
  #id?: number;

  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  drawings: Map<Draw, true> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("cannot find canvas context");
    }

    this.canvas = canvas;
    this.context = context;
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
}
