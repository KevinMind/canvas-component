import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import {
  withCanvasProvider,
  withTodoList,
} from "../../../.storybook/decorators";
import { Line } from "./Line.component";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

export default {
  decorators: [withCanvasProvider, withTodoList],
  component: Line,
} as ComponentMeta<typeof Line>;

type LineStory = StoryObj<ComponentProps<typeof Line>>;

export const Default: LineStory = {
  args: {
    start: { x: 0, y: 0 },
    end: { x: 250, y: 250 },
  },
  parameters: {
    canvasProvider: {
      height: 250,
      width: 250,
    },
  },
};

function RenderManyLines({ width, height }: { width: number; height: number }) {
  const [x] = useAnimationFrame({
    auto: true,
    from: 0,
    to: 50_000,
    duration: 20_000,
  });

  const middle = { x: width / 2, y: height / 2 };

  return (
    <>
      {Array.apply(null, Array(Math.round(x / 100))).map((_, idx) => (
        <Line
          start={{ x: x / (idx + 1) + (Math.random() * x) / 300, y: 0 }}
          end={middle}
          rotation={0}
          key={idx}
        />
      ))}
      <Line
        start={{ x: 0, y: height / 2 }}
        end={{ x: width, y: height / 2 }}
        rotation={0}
      />
      <Line start={{ x, y: height }} end={middle} rotation={0} />
    </>
  );
}

export const ManyLines: LineStory = {
  args: {
    start: { x: 0, y: 0 },
    end: { x: 250, y: 250 },
  },
  parameters: {
    canvasProvider: {
      height: 500,
      width: 1000,
    },
  },
  render: (_args, ctx) => {
    const width = ctx.parameters.canvasProvider.width;
    const height = ctx.parameters.canvasProvider.height;

    return <RenderManyLines width={width} height={height} />;
  },
  play: async () => {
    await new Promise((r) => setTimeout(r, 10_000));
  },
};
