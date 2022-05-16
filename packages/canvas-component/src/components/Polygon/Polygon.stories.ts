import { Story, Meta } from "@storybook/html";
import randomColor from "randomcolor";

import { getCanvasContext } from "../../../.storybook/decorators";

import { PolygonArgs } from "./Polygon.types";
import { drawPolygon } from "./Polygon.utilities";

export default {} as Meta;

const Template: Story<PolygonArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((canvasContext) => {
    drawPolygon(canvasContext, args);
  });

  return canvas.canvas;
};

export const Default = Template.bind({});

Default.args = {
  sides: 3,
  sideLength: 100,
  center: {
    x: 250,
    y: 250,
  },
};

export const BentRectangle = Template.bind({});

BentRectangle.args = {
  sides: [
    [
      { x: 100, y: 100 },
      { x: 100, y: 100 },
    ],
    [
      { x: 250, y: 150 },
      { x: 400, y: 100 },
    ],
    [
      { x: 400, y: 400 },
      { x: 400, y: 400 },
    ],
    [
      { x: 100, y: 400 },
      { x: 100, y: 400 },
    ],
    [
      { x: 150, y: 200 },
      { x: 100, y: 100 },
    ],
  ],
  center: {
    x: 250,
    y: 250,
  },
};

export const Fill = Template.bind({});

Fill.args = {
  ...Default.args,
  fillStyle: randomColor({
    format: "rgba",
    alpha: 0.5,
  }),
};

export const Stroke = Template.bind({});

Stroke.args = {
  ...Default.args,
  strokeStyle: randomColor({
    format: "rgba",
    alpha: 0.5,
  }),
  lineWidth: 2,
};

export const Custom = Template.bind({});

Custom.args = {
  sides: [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    [
      { x: 200, y: 230 },
      { x: 250, y: 250 },
    ],
    [
      { x: 300, y: 150 },
      { x: 470, y: 300 },
    ],
    { x: 100, y: 400 },
  ],
  sideLength: 100,
  center: {
    x: 250,
    y: 250,
  },
};
