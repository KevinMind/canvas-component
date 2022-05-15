import { Story, Meta } from "@storybook/html";

import { getCanvasContext } from "../../../.storybook/decorators";

import { PathArgs } from "./Path.types";
import { drawPath } from "./Path.utilities";

export default {} as Meta;

const Template: Story<PathArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((canvasContext) => {
    drawPath(canvasContext, args);
  });

  return "";
};

export const Default = Template.bind({});

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getPoint() {
  return { x: getRandomArbitrary(0, 450), y: getRandomArbitrary(0, 450) };
}

Default.args = {
  points: Array.apply(null, Array(50)).map(getPoint),
};
