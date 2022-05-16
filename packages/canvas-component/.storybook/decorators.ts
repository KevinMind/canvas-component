import { addDecorator } from "@storybook/html";

import { Canvas } from "../src";

const CANVAS_CONTEXT_KEY = "__canvas_context";

export function getCanvasContext(ctx: any): Canvas {
  const canvasContext = ctx[CANVAS_CONTEXT_KEY];

  if (!canvasContext) {
    throw new Error("no canvas context in storybook context");
  }

  return canvasContext;
}

addDecorator((fn, ctx) => {
  const el = document.createElement("canvas");
  el.width = 500;
  el.height = 500;
  el.style.border = "1px solid";

  const canvas = new Canvas(el);

  ctx[CANVAS_CONTEXT_KEY] = canvas;

  canvas.start();

  const wrapper = document.createElement("div");
  
  const story = fn(ctx.args);

  wrapper.append(story);

  return wrapper;
});
