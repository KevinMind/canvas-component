import { Story, Meta } from "@storybook/html";

import { getCanvasContext } from "../../../.storybook/decorators";

import { ImageArgs } from "./Image.types";
import { drawImage } from "./Image.utilities";

export default {} as Meta;

const Template: Story<ImageArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((canvasContext) => {
    drawImage(canvasContext, args);
  });

  return canvas.canvas;
};

const baseImage = new Image(300, 227);
baseImage.src =
  "https://yari-demos.prod.mdn.mozit.cloud/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage/rhino.jpg";

export const Default = Template.bind({});

Default.args = {
  image: baseImage,
  center: {
    x: 250,
    y: 250,
  },
};

export const Styled = Template.bind({});

Styled.args = {
  ...Default.args,
  shadowColor: "blue",
  shadowBlur: 10,
  shadowOffsetX: 10,
  shadowOffsetY: 10,
};

const smoothImage = new Image(100, 100);
smoothImage.src =
  "https://interactive-examples.mdn.mozilla.net/media/examples/star.png";

const RenderSmoothing: Story<ImageArgs> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  canvas.add((canvasContext) => {
    drawImage(canvasContext, { image: smoothImage, center: { x: 50, y: 50 } });
    drawImage(canvasContext, {
      image: smoothImage,
      center: { x: 0, y: 0 },
      dWidth: smoothImage.width * 4,
      dHeight: smoothImage.height * 4,
    });
    drawImage(canvasContext, {
      image: smoothImage,
      center: { x: 100, y: 50 },
      dWidth: smoothImage.width * 4,
      dHeight: smoothImage.height * 4,
      smooth: args.smooth,
    });
  });

  return canvas.canvas;
};

export const Smooth = RenderSmoothing.bind({});

Smooth.args = {
  smooth: true,
};
