import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider } from "../../../.storybook/decorators";

import { ArcTo } from "./ArcTo.component";
import { ArcToArgs } from "./ArcTo.types";
import { useArcTo } from "./ArcTo.hooks";
import { useEllipse } from "../Ellipse";
import { useLine } from "../Line";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import { Position } from "../../RenderFrame.types";

export default {
  decorators: [withRenderFrameProvider],
  component: ArcTo,
  parameters: {
    canvasProvider: {
      width: 250,
      height: 250,
    },
  },
} as ComponentMeta<typeof ArcTo>;

type ArcToStory = StoryObj<ComponentProps<typeof ArcTo>>;

export const Default: ArcToStory = {
  args: {
    pos0: {
      x: 200,
      y: 50,
    },
    pos1: {
      x: 100,
      y: 200,
    },
    pos2: {
      x: 50,
      y: 125,
    },
    radius: 40,
  },
};

export const StrokeStyle: ArcToStory = {
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

function RenderArcWithHelpers(props: ArcToArgs) {
  const {pos0, pos1, pos2, radius} = props;

  // Tangential lines
  useLine({start: pos0, end: pos1});
  useLine({start: pos1, end: pos2});

  // Start point
  useEllipse({center: {x: pos0.x, y: pos0.y}, radius: 5});
  // Control points
  useEllipse({center: {x: pos1.x, y: pos1.y}, radius: 5});
  useEllipse({center: {x: pos2.x, y: pos2.y}, radius: 5});

  // arc circle
  useEllipse({center: {x: pos1.x, y: pos2.y}, radius});

  useArcTo(props);

  return null;
}

export const ArcWithHelpers: ArcToStory = {
  ...Default,
  render: (args) => <RenderArcWithHelpers {...args} />
}

function usePosition(from: Position, to: Position) {
  const [x] = useAnimationFrame({from: from.x, to: to.x, duration: 1_000, auto: true, infinite: true, mode: "pingpong"});
  const [y] = useAnimationFrame({from: from.y, to: to.y, duration: 1_000, auto: true, infinite: true, mode: "pingpong"});

  return {x, y};
}

function RenderMoving() {
  const pos0 = usePosition({x: 250, y: 50}, {x: 200, y: 100});
  const pos1 = usePosition({x: 100, y: 200}, {x: 200, y: 200});
  const pos2 = usePosition({x: 50, y: 50}, {x: 50, y: 125});
  useArcTo({
    pos0,
    pos1,
    pos2,
    radius: 50,
  });

  return null;
}

export const Moving: StoryObj = {
  render: () => <RenderMoving />,
}

function RenderRadius() {
  const [radius] = useAnimationFrame({from: 0, to: 100, duration: 1_000, auto: true, infinite: true, mode: "pingpong"});

  useArcTo({
    pos0: Default.args?.pos0!,
    pos1: Default.args?.pos1!,
    pos2: Default.args?.pos2!,
    radius,
  });

  return null;
}

export const Radius: StoryObj = {
  render: () => <RenderRadius />,
};
