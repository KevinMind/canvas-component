import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { Image as ImageComponent } from "./Image.component";
import { withRenderFrameProvider, withRotation } from "../../../.storybook/decorators";

export default {
  decorators: [withRenderFrameProvider],
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  component: ImageComponent,
} as ComponentMeta<typeof ImageComponent>;

type ImageStory = StoryObj<ComponentProps<typeof ImageComponent>>;

const baseImage = new Image(300, 227);
baseImage.src = 'https://yari-demos.prod.mdn.mozit.cloud/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage/rhino.jpg';

export const Default: ImageStory = {
  args: {
    image: baseImage,
    pos: {
      x: 250,
      y: 250,
    },
  },
};

export const Rotate: ImageStory = {
  // @TODO: fix broken decorator function signature
  // @ts-ignore
  decorators: [withRotation],
  ...Default,
};

export const Styled: ImageStory = {
  ...Default,
  args: {
    ...Default.args,
    shadowColor: 'blue',
    shadowBlur: 10,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
  },
};

const smoothImage = new Image(100, 100);
smoothImage.src = 'https://interactive-examples.mdn.mozilla.net/media/examples/star.png';

function RenderSmoothing({smooth}: {smooth: boolean}) {
  return (
    <>
    <ImageComponent
      image={smoothImage}
      rotation={0}
      dx={50}
      dy={50}
    />
    <ImageComponent
      image={smoothImage}
      rotation={0}
      dx={0}
      dy={0}
      dWidth={smoothImage.width * 4}
      dHeight={smoothImage.height * 4}
    />
    <ImageComponent
      image={smoothImage}
      rotation={0}
      dx={100}
      dy={50}
      dWidth={smoothImage.width * 4}
      dHeight={smoothImage.height * 4}
      smooth={smooth}
    />
    </>
  )
}

export const Smoothing: StoryObj<ComponentProps<typeof RenderSmoothing>> = {
  render: (args) => <RenderSmoothing {...args} />,
  args: {
    smooth: true,
  }
};
