import { Story, Meta } from "@storybook/html";

import { getCanvasContext } from "../../../.storybook/decorators";

import { CurveArgs } from "./Curve.types";
import { drawCurve } from "./Curve.utilities";

export default {} as Meta;

const Template: Story<CurveArgs> = (args, ctx) => {
  const canvasContext = getCanvasContext(ctx);

  drawCurve(canvasContext, args);
  return "";
};

export const Default = Template.bind({});

Default.args = {
  points: [
    { x: 0, y: 250 },
    { x: 100, y: 450 },
    { x: 200, y: 50 },
    { x: 350, y: 250 },
    { x: 400, y: 500 },
    { x: 500, y: 250 },
  ],
};
