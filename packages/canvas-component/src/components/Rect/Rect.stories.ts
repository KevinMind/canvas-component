import { Story, Meta } from "@storybook/html";
import randomColor from "randomcolor";

import { getCanvasContext } from "../../../.storybook/decorators";

import { RectArgs } from "./Rect.types";
import { drawRect } from "./Rect.utilities";

export default {} as Meta;

const Template: Story<RectArgs> = (args, ctx) => {
  const canvasContext = getCanvasContext(ctx);

  drawRect(canvasContext, args);
  return "";
};

export const Default = Template.bind({});

Default.args = {
  center: { x: 125, y: 125 },
  width: 200,
  height: 200,
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
};

export const Rounded = Template.bind({});

Rounded.args = {
  ...Default.args,
  borderRadius: 10,
};
