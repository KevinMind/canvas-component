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
    pos: {
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
}
