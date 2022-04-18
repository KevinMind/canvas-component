import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from 'randomcolor';

import { Ellipse } from "./Ellipse.component";
import {
  withRenderFrameProvider,
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
    rotation: 0,
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

export const Rotating: EllipseStory = {
  ...Elipse,
  decorators: [
    (Story, ctx) => {
      const [rotation] = useAnimationFrame({
        auto: true,
        duration: 1000,
        infinite: true,
        from: 0,
        to: 360,
      });
      const [radius] = useAnimationFrame({
        auto: true,
        mode: "pingpong",
        duration: 1000,
        from: 0,
        to: 125,
      });
      ctx.args.rotation = rotation;
      ctx.args.radius = radius;
      return <Story />;
    },
  ],
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
