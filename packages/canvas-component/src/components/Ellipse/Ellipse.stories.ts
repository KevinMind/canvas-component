import { Story, Meta } from "@storybook/html";
import randomColor from "randomcolor";

import { getCanvasContext } from "../../../.storybook/decorators";

import { EllipseArgs } from "./Ellipse.types";
import { drawEllipse } from "./Ellipse.utilities";

export default {} as Meta;

const Template: Story<EllipseArgs> = (args, ctx) => {
  const canvasContext = getCanvasContext(ctx);

  drawEllipse(canvasContext, args);
  return "";
};

export const Default = Template.bind({});

Default.args = {
  radius: 125,
  center: {
    x: 250,
    y: 250,
  },
};

export const Filled = Template.bind({});

Filled.args = {
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
  lineWidth: 10,
};
