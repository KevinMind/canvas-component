import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider } from "../../../.storybook/decorators";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

import { Rect } from "./Rect.component";
import { useRect } from "./Rect.hooks";
import { useEllipse } from "../Ellipse";

export default {
  decorators: [withRenderFrameProvider],
  component: Rect,
} as ComponentMeta<typeof Rect>;

type RectStory = StoryObj<ComponentProps<typeof Rect>>;

export const Default: RectStory = {
  parameters: {
    canvasProvider: {
      height: 250,
      width: 250,
    },
  },
  args: {
    pos: {x: 125, y: 125},
    width: 200,
    height: 200,
  },
};

export const FillStyle: RectStory = {
  ...Default,
  args: {
    ...Default.args,
    fillStyle: randomColor({
      format: "rgba",
      alpha: 0.5,
    }),
  }
}

export const Stroke: RectStory = {
  ...Default,
  args: {
    ...Default.args,
    strokeStyle: randomColor({
      format: "rgba",
      alpha: 0.5,
    }),
  }
}

function RenderExpanding() {
  const [width] = useAnimationFrame({
    from: 0,
    to: 200,
    duration: 1_000,
    auto: true,
    infinite: true,
  });

  useRect({pos: {x: 125, y: 125}, width, height: width});
  return null;
}

export const Exapanding: StoryObj = {
  parameters: {
    canvasProvider: {
      height: 250,
      width: 250,
    },
  },
  render: () => <RenderExpanding />,
};

function RenderRotate() {
  const [width] = useAnimationFrame({
    from: 0,
    to: 200,
    duration: 1_000,
    auto: true,
    infinite: true,
    mode: "pingpong",
  });

  const [rotation ] = useAnimationFrame({
    from: 0,
    to: 360,
    duration: 1_000,
    auto: true,
    infinite: true,
  })
  useRect({
    pos: {x: 125, y: 125},
    width,
    height: width,
    rotation,
  });

  useEllipse({
    pos: {x: 125, y: 125},
    radius: 100,
    radiusY: 125,
  });

  return null;
}

export const Rotate: StoryObj = {
  parameters: {
    canvasProvider: {
      height: 250,
      width: 250,
    },
  },
  render: () => <RenderRotate />,
}
