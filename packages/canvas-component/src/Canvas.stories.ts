import { Story, Meta } from "@storybook/html";

import { drawEllipse } from "./components/Ellipse";
import { getCanvasContext } from "../.storybook/decorators";

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

  return "";
};

export const Default = Template.bind({});
