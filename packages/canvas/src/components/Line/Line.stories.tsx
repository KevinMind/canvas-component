import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from 'randomcolor';

import {
  withRenderFrameProvider,
  withTodoList,
} from "../../../.storybook/decorators";
import { Line } from "./Line.component";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import { useLine } from "./Line.hooks";
import { Position } from "../../RenderFrame.types";
import { LineArgs } from "./Line.types";
import { bezierEasing } from "../../utilities/bezier";

export default {
  decorators: [withRenderFrameProvider, withTodoList],
  component: Line,
} as ComponentMeta<typeof Line>;

type LineStory = StoryObj<ComponentProps<typeof Line>>;

export const Default: LineStory = {
  args: {
    start: { x: 50, y: 50 },
    end: { x: 200, y: 200 },
  },
  parameters: {
    canvasProvider: {
      height: 250,
      width: 250,
    },
  },
};

export const StrokeStyle: LineStory = {
  ...Default,
  args: {
    ...Default.args,
    strokeStyle: randomColor({
      format: 'rgba',
      alpha: 0.5,
    }),
    lineWidth: 10,
  }
};

export const LineCap: LineStory = {
  ...Default,
  args: {
    ...StrokeStyle.args,
    lineCap: 'round'
  },
};

export const DashedLine: LineStory = {
  ...Default,
  args: {
    ...StrokeStyle.args,
    lineDash: [10, 5],
  },
};

export const Quadratic: LineStory = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    }
  },
  args: {
    start: {
      x: 0,
      y: 0, 
    },
    points: [
      {
        x: 430,
        y: 30,
      }
    ],
    end: {
      x: 500,
      y: 500,
    },
    smooth: true,
  },
};

export const BezierCurve: LineStory = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    }
  },
  args: {
    start: {
      x: 0,
      y: 0, 
    },
    points: [
      {
        x: 430,
        y: 30,
      },
      {
        x: 150,
        y: 400,
      },
    ],
    end: {
      x: 500,
      y: 500,
    },
    smooth: true,
  },
};

function Wave({
  waveLength,
  amplitude = 0,
  amplitudeX = amplitude,
  amplitudeY = amplitude,
  start,
  end,
  midPoint,
}: {
  waveLength: number;
  amplitude?: number;
  amplitudeX?: number;
  amplitudeY?: number;
  start: LineArgs['start'];
  end: LineArgs['end'];
  midPoint: Position;
}) {
  const offsetX = amplitudeX * midPoint.x;
  const offsetY = amplitudeY * midPoint.y;

  const [y] = useAnimationFrame({
    easing: bezierEasing('ease-in-out'),
    from: midPoint.y - offsetY * Math.LOG10E,
    to: midPoint.y + offsetY,
    auto: true,
    infinite: true,
    duration: waveLength * Math.LN2,
    mode: 'pingpong',
  });

  const [x] = useAnimationFrame({
    from: midPoint.x - offsetX,
    to: midPoint.x + offsetX,
    auto: true,
    infinite: true,
    duration: waveLength * Math.LN10,
    mode: 'pingpong',
  })

  useLine({
    smooth: true,
    start,
    points: [{x, y}],
    end,
    rotation: 0,
    showControlPoints: true,
  });

  return null;

}

function RenderWaves() {
  const start = {x: 0, y: 250};
  const end = {x: 500, y: 250};
  return (
    <>
      <Wave
        start={start}
        end={end}
        midPoint={{x: 250, y: 250}}
        amplitude={0.1}
        waveLength={3_000}
      />
      <Wave
        start={start}
        end={end}
        midPoint={{x: 250, y: 250}}
        amplitude={0.3}
        amplitudeX={0.8}
        waveLength={6_000}
      />
      <Wave
        start={start}
        end={end}
        midPoint={{x: 400, y: 250}}
        amplitude={0.1}
        amplitudeY={0.5}
        waveLength={4_000}
      />

    </>
  )

}

export const Waves: StoryObj = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    }
  },
  args: {},
  render: () => <RenderWaves />,
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
