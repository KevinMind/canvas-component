import { Story, Meta } from "@storybook/html";
import randomColor from "randomcolor";

import { getCanvasContext } from "../../../.storybook/decorators";

import { TextArgs } from "./Text.types";
import { drawText } from "./Text.utilities";

export default {} as Meta;

const fillStyle = randomColor({
  format: "rgba",
  hue: "green",
  luminosity: "bright",
});
const strokeStyle = randomColor({
  format: "rgba",
  hue: "green",
  luminosity: "dark",
});

const Template: Story<TextArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((canvasContext) => {
    drawText(canvasContext, args);
  });

  return "";
};

export const Default = Template.bind({});

Default.args = {
  text: "Hello world",
  center: {
    x: 250,
    y: 250,
  },
  fillStyle: "black",
  font: "bold 48px serif",
  textAlign: "center",
  textBaseline: "middle",
};

export const Stroke = Template.bind({});

Stroke.args = {
  ...Default.args,
  fillStyle: "",
  strokeStyle,
};

export const Fill = Template.bind({});

Fill.args = {
  ...Default.args,
  fillStyle,
};

export const MaxWidth = Template.bind({});

MaxWidth.args = {
  ...Default.args,
  maxWidth: 240,
  font: "bold 480px serif",
};
