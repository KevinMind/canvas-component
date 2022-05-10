import { Story, Meta } from "@storybook/html";

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
  radius: 10,
  center: { x: 250, y: 250 },
};
