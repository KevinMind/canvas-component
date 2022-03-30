import React, { ComponentProps, useState, useEffect } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withCanvasProvider, withTodoList } from "../../.storybook/decorators";
import { useRequestAnimationFrame } from "../../hooks/useRequestAnimationFrame";
import { Line } from "./Line.component";

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
  const [x, { stop }] = useRequestAnimationFrame(
    (frame) => {
      return frame;
    },
    { auto: true }
  );

  const middle = { x: width / 2, y: height / 2 };

  useEffect(() => {
    if (x > 20_000) {
      stop();
    }
  }, [stop, x]);

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
