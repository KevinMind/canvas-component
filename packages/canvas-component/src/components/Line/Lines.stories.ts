import { Story, Meta } from "@storybook/html";
import randomColor from "randomcolor";

import { getCanvasContext } from "../../../.storybook/decorators";

import { LineArgs } from "./Line.types";
import { drawLine } from "./Line.utilities";

export default {} as Meta;

const Template: Story<LineArgs> = (args, ctx) => {
  const canvasContext = getCanvasContext(ctx);

  drawLine(canvasContext, args);
  return "";
};

export const Default = Template.bind({});

Default.args = {
  start: { x: 50, y: 50 },
  end: { x: 200, y: 200 },
};

export const Stroke = Template.bind({});

Stroke.args = {
  ...Default.args,
  strokeStyle: randomColor({
    format: "rgba",
    alpha: 0.5,
  }),
  lineWidth: 10,
};

export const LineCap = Template.bind({});

LineCap.args = {
  ...Stroke.args,
  lineCap: "round",
};

export const Dashed = Template.bind({});

Dashed.args = {
  ...Stroke.args,
  lineDash: [10, 5],
};

export const Quadratic = Template.bind({});

Quadratic.args = {
  start: {
    x: 0,
    y: 0,
  },
  points: [
    {
      x: 430,
      y: 30,
    },
  ],
  end: {
    x: 500,
    y: 500,
  },
  smooth: true,
};

export const Bezier = Template.bind({});

Bezier.args = {
  start: {
    x: 0,
    y: 0,
  },
  points: [
    {
      x: 430,
      y: 30,
    },
    {
      x: 150,
      y: 400,
    },
  ],
  end: {
    x: 500,
    y: 500,
  },
  smooth: true,
};
