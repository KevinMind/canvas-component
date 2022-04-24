import React, { ComponentProps, useEffect, useRef } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { Image as ImageComponent } from "./Image.component";
import { withRenderFrameProvider } from "../../../.storybook/decorators";
import { useRenderFrame } from "../../RenderFrame.hooks";

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

const baseImage = new Image(40, 50);
baseImage.src = 'https://yari-demos.prod.mdn.mozit.cloud/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage/rhino.jpg';

export const Default: ImageStory = {
  args: {
    image: baseImage,
    dx: 100,
    dy: 100,
  },
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
