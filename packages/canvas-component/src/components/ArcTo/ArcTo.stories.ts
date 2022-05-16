import { Story, Meta } from "@storybook/html";
import randomColor from "randomcolor";

import { getCanvasContext } from "../../../.storybook/decorators";

import { drawEllipse } from "../Ellipse";

import { ArcToArgs } from "./ArcTo.types";
import { drawArcTo } from "./ArcTo.utilities";

export default {} as Meta;

const Template: Story<ArcToArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((ctx) => {
    drawArcTo(ctx, args);
  });

  return canvas.canvas;
};

export const Default = Template.bind({});

Default.args = {
  pos0: {
    x: 200,
    y: 50,
  },
  pos1: {
    x: 100,
    y: 200,
  },
  pos2: {
    x: 50,
    y: 125,
  },
  radius: 40,
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

const HelpersTemplate: Story<ArcToArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((ctx) => {
    const { pos0, pos1, pos2, radius } = args;

    // Tangential lines
    // @TODO: uncomment when drawLine is implemented
    // drawLine(canvasContext, {start: pos0, end: pos1});
    // drawLine(canvasContext, {start: pos1, end: pos2});

    // Start point
    drawEllipse(ctx, { center: { x: pos0.x, y: pos0.y }, radius: 5 });
    // Control points
    drawEllipse(ctx, { center: { x: pos1.x, y: pos1.y }, radius: 5 });
    drawEllipse(ctx, { center: { x: pos2.x, y: pos2.y }, radius: 5 });

    // arc circle
    drawEllipse(ctx, { center: { x: pos1.x, y: pos2.y }, radius });

    drawArcTo(ctx, args);
  });

  return canvas.canvas;
};

export const WithHelpers = HelpersTemplate.bind({});

WithHelpers.args = Default.args;
