import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider, withRotation } from "../../../.storybook/decorators";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

import { Rect } from "./Rect.component";
import { useRect } from "./Rect.hooks";
import { useEllipse } from "../Ellipse";
import { useLinearGradient } from "../../hooks/useLinearGradient";

export default {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  decorators: [withRenderFrameProvider],
  component: Rect,
} as ComponentMeta<typeof Rect>;

type RectStory = StoryObj<ComponentProps<typeof Rect>>;

export const Default: RectStory = {
  args: {
    center: {x: 125, y: 125},
    width: 200,
    height: 200,
  },
};

export const Rotate: RectStory = {
  // @TODO: fix broken decorator function signature
  // @ts-ignore
  decorators: [withRotation],
  ...Default,
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

function RenderGradient() {
  const grd = useLinearGradient({
    start: {x: 0, y: 250},
    end: {x: 500, y: 250},
    colorStops: [
      [0, 'red'],
      [0.4, 'red'],
      [0.41, 'yellow'],
      [0.6, 'yellow'],
      [0.61, 'black'],
      [1, 'black'],
    ],
  });

  return (
    <Rect
      width={250}
      height={150}
      center={{x: 250, y: 250}}
      fillStyle={grd}
    />
  )
}

export const LinearGradient: StoryObj = {
  render: () => <RenderGradient />,
};

function RenderExpanding() {
  const [width] = useAnimationFrame({
    from: 0,
    to: 200,
    duration: 1_000,
    auto: true,
    infinite: true,
  });

  useRect({center: {x: 125, y: 125}, width, height: width});
  return null;
}

export const Exapanding: StoryObj = {
  render: () => <RenderExpanding />,
};

export const Rounded: RectStory = {
  ...Default,
  args: {
    ...Default.args,
    borderRadius: 10,
  },
};
