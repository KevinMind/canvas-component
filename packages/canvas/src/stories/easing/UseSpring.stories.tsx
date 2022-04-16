import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import {useSpring} from 'use-spring';

import { withRenderFrameProvider, withMousePosition, useMousePos, withTodoList } from "../../../.storybook/decorators";
import { Circle } from "../../components/Circle";

const r = 125;

function UseSpring(config: Parameters<typeof useSpring>[1]) {
  const [x] = useMousePos();
  const [springX] = useSpring(x, config);

  return (
    <>
      <Circle pos={{x: springX, y: r}} radius={r} rotation={0} />
      <Circle pos={{x, y: r}} radius={r} rotation={0} />
    </>
  );
}

export default {
  component: UseSpring,
  decorators: [withTodoList, withMousePosition, withRenderFrameProvider],
  parameters: {
    canvasProvider: {
      width: 500,
      height: 250,
    },
  },
  argTypes: {
    stiffness: {
      control: { type: 'range', min: 0, max: 200, step: 1 },
      defaultValue: 10,
    },
    damping: {
      control: { type: 'range', min: 0, max: 20, step: 1 },
      defaultValue: 10,
    },
    mass: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      defaultValue: 10,
    },
    decimals: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      defaultValue: 10,
    },
    initialSpeed: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      defaultValue: 10,
    },
    from: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      defaultValue: 10,
    },
  }
} as ComponentMeta<typeof UseSpring>;

type UseSpringStory = StoryObj<ComponentProps<typeof UseSpring>>;

export const Default: UseSpringStory = {
  args: {
    stiffness: 170,
    damping: 26,
    mass: 1,
    decimals: 2,
    teleport: false,
    initialSpeed: 0
  }
};