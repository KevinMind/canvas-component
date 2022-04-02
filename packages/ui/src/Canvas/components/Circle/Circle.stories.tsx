import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { Circle } from "./Circle.component";
import { withCanvasProvider, withTodoList } from "../../.storybook/decorators";
import { useRequestAnimationFrame } from "../../hooks/useRequestAnimationFrame";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

export default {
  decorators: [withCanvasProvider, withTodoList],
  component: Circle,
} as ComponentMeta<typeof Circle>;

type CircleStory = StoryObj<ComponentProps<typeof Circle>>;

export const Default: CircleStory = {
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

export const Expanding: CircleStory = {
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

export const Elipse: CircleStory = {
  ...Default,
  args: {
    ...Default.args,
    radiusY: 50,
  },
};

export const Rotating: CircleStory = {
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
