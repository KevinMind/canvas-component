import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider, withCenterDot, withRotation } from "../../../.storybook/decorators";
import { bezierEasing } from "../../utilities/bezier";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";
import { useLinearGradient } from "../../hooks/useLinearGradient";

import { Text } from "./Text.component";
import { useText } from "./Text.hooks";

const fillStyle = randomColor({format: 'rgba', hue: 'green', luminosity: 'bright'});
const strokeStyle = randomColor({format: 'rgba', hue: 'green', luminosity: 'dark'});

export default {
  decorators: [withCenterDot,withRenderFrameProvider],
  component: Text,
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  }
} as ComponentMeta<typeof Text>;

type TextStory = StoryObj<ComponentProps<typeof Text>>;

export const Default: TextStory = {
  args: {
    text: 'Hello world',
    center: {
      x: 250,
      y: 250,
    },
    fillStyle: 'black',
    font: 'bold 48px serif',
    textAlign: 'center',
    textBaseline: 'middle',
  },
};

export const Rotate: TextStory = {
  // @TODO: fix broken decorator function signature
  // @ts-ignore
  decorators: [withRotation],
  ...Default,
};

export const Stroke: TextStory = {
  args: {
    ...Default.args,
    fillStyle: '',
    strokeStyle,
  },
};

export const Fill: TextStory = {
  args: {
    ...Default.args,
    fillStyle,
  },
};


function RenderGradient() {
  const grd = useLinearGradient({
    start: {x: 0, y: 250},
    end: {x: 500, y: 250},
    colorStops: [
      [0, 'red'],
      [0.4, 'red'],
      [0.41, 'yellow'],
      [0.6, 'yellow'],
      [0.61, 'black'],
      [1, 'black'],
    ],
  });

  return (
    <Text
      {...Default.args}
      text={Default.args?.text!}
      center={{x: 250, y: 250}}
      fillStyle={grd || 'black'}
    />
  )
}

export const LinearGradient: StoryObj = {
  render: () => <RenderGradient />,
};

export const Shadow: TextStory = {
  args: {
    ...Default.args,
    shadowColor: strokeStyle,
    shadowBlur: 10,
    shadowOffsetX: 10,
    shadowOffsetY: 20,
  }
};

export const MaxWidth: TextStory = {
  args: {
    ...Default.args,
    maxWidth: 240,
    font: 'bold 480px serif'
  }
};

function RenderAnimated() {
  const [fontSize] = useAnimationFrame({
    from: 0,
    to: 480,
    duration: 1_000,
    mode: 'pingpong',
    auto: true,
    infinite: true,
    easing: bezierEasing('ease-in-out'),
  });
  const [maxWidth] = useAnimationFrame({
    from: 0,
    to: fontSize,
    duration: 1_000,
    mode: 'pingpong',
    auto: true,
    infinite: true,
    easing: bezierEasing('ease-out')
  });

  useText({
    center: {
      x: 250,
      y: 250,
    },
    maxWidth,
    text: 'Hello world',
    font: `bold ${fontSize}px serif`,
    fillStyle,
    textAlign: 'center',
    textBaseline: 'middle',
  });

  return null;
}

export const Animated = {
  render: () => <RenderAnimated />
};
