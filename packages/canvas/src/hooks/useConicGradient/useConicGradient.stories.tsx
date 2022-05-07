import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider } from "../../../.storybook/decorators";
import { useRect } from "../../components/Rect";

import { useConicGradient } from "./useConicGradient.hooks";
import { CreateConicGradientArgs } from "./useConicGradient.types";

function RenderConicGradient(args: CreateConicGradientArgs) {
  useRect({
    width: 250,
    height: 150,
    center: {x: 250, y: 250},
    fillStyle: useConicGradient(args)
  });
  return null;
}

export default {
  decorators: [withRenderFrameProvider],
  component: RenderConicGradient,
} as ComponentMeta<typeof RenderConicGradient>;

type useConicGradientStory = StoryObj<ComponentProps<typeof RenderConicGradient>>;

export const Default: useConicGradientStory = {
  args: {
    center: {x: 250, y: 250},
    angle: 0,
    colorStops: [
      [0, 'red'],
      [0.4, 'red'],
      [0.41, 'yellow'],
      [0.6, 'yellow'],
      [0.61, 'black'],
      [1, 'black'],
    ],
  },
};
