import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider, withTodoList} from "../../../.storybook/decorators";
import { bezierEasing, EasingType } from "../../utilities/bezier";
import {
  useAnimationFrame,
} from "../../hooks/useAnimationFrame";
import { Ellipse } from "../../components/Ellipse";
import {UseAnimationFrameArgs} from '../../hooks/useAnimationFrame';

const r = 125;

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
      <Ellipse pos={{x, y: r}} radius={r} rotation={0} />
      <Ellipse pos={{x, y: r}} radius={radius} rotation={0} />
      <Ellipse pos={{x: 2 * x, y: r}} radius={r / 2} rotation={0} />
    </>
  );
}

export default {
  component: BezierEasing,
  decorators: [withRenderFrameProvider, withTodoList],
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