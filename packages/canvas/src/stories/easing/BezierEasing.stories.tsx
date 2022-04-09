import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withCanvasProvider, withTodoList} from "../../../.storybook/decorators";
import {
  useAnimationFrame,
} from "../../hooks/useAnimationFrame";
import { Circle } from "../../components/Circle";
import {UseAnimationFrameArgs} from '../../hooks/useAnimationFrame';

const r = 125;

import bezier from 'bezier-easing';

export type EasingType = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

function bezierEasing(easingType: EasingType | [number, number, number, number]): (p: number) => number {
  if (Array.isArray(easingType)) {
    return bezier(...easingType);
  }
  switch (easingType) {
    case "ease":
      return bezier(0.25, 0.1, 0.25, 0.1);
    case "ease-in":
      return bezier(0.42, 0, 1, 1);
    case "ease-out":
      return bezier(0, 0, 0.58, 1);
    case "ease-in-out":
      return bezier(0.42, 0, 0.58, 1);
    case "linear":
    default:
      return bezier(0, 0, 1, 1);
  }
}

function BezierEasing({ easing, interval, duration }: Pick<UseAnimationFrameArgs, "interval" | "duration"> & {easing: EasingType}) {
  const [x] = useAnimationFrame({
    easing: bezierEasing(easing),
    auto: true,
    infinite: true,
    interval,
    mode: 'pingpong',
    duration,
    from: 0,
    to: 500,
  });
  const [radius] = useAnimationFrame({
    auto: true,
    mode: "forward",
    easing: bezierEasing([1, 0, 1, 1]),
    infinite: true,
    duration: 5_000,
    from: 0,
    to: 50,
  });

  return (
    <>
      <Circle pos={{x, y: r}} radius={r} rotation={0} />
      <Circle pos={{x, y: r}} radius={radius} rotation={0} />
      <Circle pos={{x: 2 * x, y: r}} radius={r / 2} rotation={0} />
    </>
  );
}

export default {
  component: BezierEasing,
  decorators: [withCanvasProvider, withTodoList],
  parameters: {
    canvasProvider: {
      width: 500,
      height: 250,
    },
  },
  argTypes: {
    easing: {
      options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
      control: { type: "radio" },
      defaultValue: "linear",
    },
    duration: {
      control: { type: 'range', min: 100, max: 10_000, step: 100 },
      defaultValue: 1_000,
    },
    interval: {
      control: { type: 'range', min: 0, max: 10_000, step: 10 },
      defaultValue: 0,
    }
  },
} as ComponentMeta<typeof BezierEasing>;

type BezierEasingStory = StoryObj<ComponentProps<typeof BezierEasing>>;

export const Default: BezierEasingStory = {
  args: {
    easing: "linear",
    duration: 1_000,
    interval: 0,
  },
};