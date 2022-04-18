import React, { ComponentProps, useContext } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider } from "../../../.storybook/decorators";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

import { Box } from "./Box.component";
import { useBox } from "./Box.hooks";
import { useCircle } from "../Circle";

export default {
  decorators: [withRenderFrameProvider],
  component: Box,
} as ComponentMeta<typeof Box>;

type BoxStory = StoryObj<ComponentProps<typeof Box>>;

export const Default: BoxStory = {
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
    rotation: 0,
  },
};

function RenderExpanding() {
  const [width] = useAnimationFrame({
    from: 0,
    to: 200,
    duration: 1_000,
    auto: true,
    infinite: true,
  });

  useBox({pos: {x: 125, y: 125}, width, height: width, rotation: 0});
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
  useBox({
    pos: {x: 125, y: 125},
    width,
    height: width,
    rotation,
  });

  useCircle({
    pos: {x: 125, y: 125},
    radius: 100,
    radiusY: 125,
    rotation: 0,
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
