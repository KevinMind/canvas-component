import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider } from "../../../.storybook/decorators";
import { useEllipse } from "../../components/Ellipse";

import { useRadialGradient } from "./useRadialGradient.hooks";


function RenderLinearGradient(args: Parameters<typeof useRadialGradient>[0]) {
  useEllipse({
    radius: 250,
    center: {x: 250, y: 250},
    fillStyle: useRadialGradient(args)
  });
  return null;
}

export default {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  decorators: [withRenderFrameProvider],
  component: RenderLinearGradient,
} as ComponentMeta<typeof RenderLinearGradient>;

type RadialGradientStory = StoryObj<ComponentProps<typeof RenderLinearGradient>>;

export const Default: RadialGradientStory = {
  args: {
    start: {x: 250, y: 250},
    startRadius: 30,
    end: {x: 250, y: 250},
    endRadius: 250,
    colorStops: [
      [0, 'black'],
      [0.15, 'black'],
      [0.16, randomColor({hue: 'blue', luminosity: 'bright'})],
      [0.18, randomColor({hue: 'blue', luminosity: 'light'})],
      [0.55, randomColor({hue: 'blue', luminosity: 'dark'})],
      [0.56, 'white'],
      [0.86, 'white'],
      [1, '#eeeeee'],
    ],
  },
};
