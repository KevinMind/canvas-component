import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { Curve } from "./Curve.component";
import { withRenderFrameProvider, withTodoList } from "../../../.storybook/decorators";
import { Position } from "../../RenderFrame.types";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import { bezierEasing } from "../../utilities/bezier";

export default {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    tension: { control: { type: 'range', min: 0, max: 2, step: 0.1 } },
  },
  decorators: [withRenderFrameProvider, withTodoList],
  component: Curve,
} as ComponentMeta<typeof Curve>;

type CurveStory = StoryObj<ComponentProps<typeof Curve>>;

export const Default: CurveStory = {
  args: {
    points: [
      {x: 0, y: 250},
      {x: 100, y: 450},
      {x: 200, y: 50},
      {x: 350, y: 250},
      {x: 400, y: 500},
      {x: 500, y: 250},
    ],
  },
};

function RenderMoving(args: ComponentProps<typeof Curve>) {
  const points: Position[] = [];

  const [tension] = useAnimationFrame({
    from: 0,
    to: 2,
    duration: 1_000,
    auto: true,
    infinite: true,
    mode: 'pingpong',
  });

  for (let i = 0; i <= 5; i++) {
    const [y] = useAnimationFrame({
      easing: bezierEasing('ease-in-out'),
      duration: Math.E * 1000,
      from: 0,
      to: 500,
      auto: true,
      infinite: true,
      mode: i % 2 === 0 ? 'pingpong' : 'pingpong-backward',
    });
    points.push({x: i * 100, y});
  }


  return <Curve {...args} tension={tension} points={points} />

}

export const Moving: CurveStory = {
  ...Default,
  render: ({tension, ...args}) => <RenderMoving {...args} />,
};

function RenderWave() {
  const points = [];

  const [offset] = useAnimationFrame({
    easing: bezierEasing('ease-in-out'),
    duration: 3_000,
    from: -100,
    to: 200,
    auto: true,
    infinite: true,
    mode: 'pingpong',
  });

  const length = 5;
  const middle = length / 2;

  for (let i = 0; i <= length; i++) {
    const factor = Math.cos((middle - i) / length);
    const x = i * 100;
    points.push({x, y: 250 + (factor * offset)});
  }
  return <Curve points={points} tension={0.2} rotation={0} />;
}

export const Wave: StoryObj = {
  render: () => <RenderWave />,
}
