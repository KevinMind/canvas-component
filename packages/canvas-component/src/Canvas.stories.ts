import { Story, Meta } from "@storybook/html";

import { drawEllipse } from "./components/Ellipse";
import { getCanvasContext } from "../.storybook/decorators";
import {
  CreateConicGradientArgs,
  CreateLinearGradientArgs,
  CreateRadialGradientArgs,
} from "./Gradient.types";
import { drawRect } from "./components/Rect";
import randomColor from "randomcolor";

export default {} as Meta;

const Template: Story = (_args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((ctx, frame) => {
    const radius = frame / 100;
    drawEllipse(ctx, { center: { x: 250, y: 250 }, radius });
  });

  setTimeout(() => {
    canvas.stop();
  }, 10_000);

  return canvas.canvas;
};

export const Default = Template.bind({});

const ConicTemplate: Story<CreateConicGradientArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  const grd = canvas.createConicGradient(args);

  canvas.add((canvasContext) => {
    drawRect(canvasContext, {
      width: 250,
      height: 250,
      fillStyle: grd,
      center: {
        x: 250,
        y: 250,
      },
    });
  });

  return canvas.canvas;
};

export const Conic = ConicTemplate.bind({});

Conic.args = {
  center: { x: 250, y: 250 },
  angle: 0,
  colorStops: [
    [0, "red"],
    [0.4, "red"],
    [0.41, "yellow"],
    [0.6, "yellow"],
    [0.61, "black"],
    [1, "black"],
  ],
};

const LinearTemplate: Story<CreateLinearGradientArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((canvasContext) => {
    const grd = canvas.createLinearGradient(args);

    drawRect(canvasContext, {
      width: 250,
      height: 250,
      fillStyle: grd,
      center: {
        x: 250,
        y: 250,
      },
    });
  });

  return canvas.canvas;
};

export const Linear = LinearTemplate.bind({});

Linear.args = {
  start: { x: 0, y: 250 },
  end: { x: 500, y: 250 },
  colorStops: [
    [0, "red"],
    [0.4, "red"],
    [0.41, "yellow"],
    [0.6, "yellow"],
    [0.61, "black"],
    [1, "black"],
  ],
};

const RadialTemplate: Story<CreateRadialGradientArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  const grd = canvas.createRadialGradient(args);

  canvas.add((canvasContext) => {
    drawRect(canvasContext, {
      width: 500,
      height: 500,
      fillStyle: grd,
      center: {
        x: 250,
        y: 250,
      },
    });
  });

  return canvas.canvas;
};

export const Radial = RadialTemplate.bind({});

Radial.args = {
  start: { x: 250, y: 250 },
  startRadius: 30,
  end: { x: 250, y: 250 },
  endRadius: 250,
  colorStops: [
    [0, "black"],
    [0.15, "black"],
    [0.16, randomColor({ hue: "blue", luminosity: "bright" })],
    [0.18, randomColor({ hue: "blue", luminosity: "light" })],
    [0.55, randomColor({ hue: "blue", luminosity: "dark" })],
    [0.56, "white"],
    [0.86, "white"],
    [1, "#eeeeee"],
  ],
};
