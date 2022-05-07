import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from 'randomcolor';

import { Ellipse } from "./Ellipse.component";
import {
  withRenderFrameProvider,
  withRotation,
  withTodoList,
} from "../../../.storybook/decorators";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import { useLinearGradient } from "../../hooks/useLinearGradient";

export default {
  decorators: [withRenderFrameProvider, withTodoList],
  component: Ellipse,
} as ComponentMeta<typeof Ellipse>;

type EllipseStory = StoryObj<ComponentProps<typeof Ellipse>>;

export const Default: EllipseStory = {
  parameters: {
    canvasProvider: {
      height: 250,
      width: 250,
    },
  },
  args: {
    radius: 125,
    center: {
      x: 125,
      y: 125,
    },
  },
};

export const Expanding: EllipseStory = {
  ...Default,
  decorators: [
    (Story, ctx) => {
      const [radius] = useAnimationFrame({
        from: 0,
        to: 125,
        auto: true,
        duration: 1000,
        mode: "pingpong",
      });
      ctx.args.radius = radius;
      return <Story />;
    },
  ],
};

export const Elipse: EllipseStory = {
  ...Default,
  args: {
    ...Default.args,
    radiusY: 50,
  },
};

export const Rotate: EllipseStory = {
  // @TODO: fix broken decorator function signature
  // @ts-ignore
  decorators: [withRotation],
  ...Elipse,
};

export const Filled: EllipseStory = {
  ...Default,
  args: {
    ...Default.args,
    fillStyle: randomColor({
      format: 'rgba',
      alpha: 0.5,
    }),
  }
}

export const StrokeStyle: EllipseStory = {
  ...Default,
  args: {
    ...Default.args,
    strokeStyle: randomColor({
      format: 'rgba',
      alpha: 0.5,
    }),
    lineWidth: 10,
  }
};

function RenderGradient() {
  const grd = useLinearGradient({
    start: {x: 0, y: 250},
    end: {x: 250, y: 250},
    colorStops: [
      [0, 'red'],
      [0.3, 'red'],
      [0.31, 'yellow'],
      [0.7, 'yellow'],
      [0.71, 'black'],
      [1, 'black'],
    ],
  });

  return (
    <Ellipse
      radius={125}
      center={{x: 125, y: 125}}
      fillStyle={grd}
    />
  )
}

export const LinearGradient: StoryObj = {
  render: () => <RenderGradient />,
};
