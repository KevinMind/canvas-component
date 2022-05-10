import { addDecorator } from "@storybook/html";

const CANVAS_CONTEXT_KEY = "__canvas_context";

export function getCanvasContext(ctx: any): CanvasRenderingContext2D {
  const canvasContext = ctx[CANVAS_CONTEXT_KEY];

  if (!canvasContext) {
    throw new Error("no canvas context in storybook context");
  }

  return canvasContext;
}

addDecorator((fn, ctx) => {
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500;

  ctx[CANVAS_CONTEXT_KEY] = canvas.getContext("2d");

  fn(ctx.args);

  return canvas;
});
