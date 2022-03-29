import React, { ComponentProps, useState, useEffect } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { waitFor } from "@storybook/testing-library";

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
  const [x, setX] = useState<number>(0);
  const [count, setCount] = useState<number>(1);

  useRequestAnimationFrame(() => {
    setX((curr) => {
      return curr + 3;
    });
  });

  useEffect(() => {
    setTimeout(() => {
      setCount((curr) => curr + 1);
    }, count);
  }, [count]);

  const middle = { x: width / 2, y: height / 2 };

  return (
    <>
      {Array.apply(null, Array(count)).map((_, idx) => (
        <Line
          start={{ x: x / idx + 1, y: 0 }}
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
