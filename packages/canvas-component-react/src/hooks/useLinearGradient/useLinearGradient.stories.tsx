import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider } from "../../../.storybook/decorators";
import { useRect } from "../../components/Rect";

import { useLinearGradient } from "./useLinearGradient.hooks";

function RenderLinearGradient(args: Parameters<typeof useLinearGradient>[0]) {
  useRect({
    width: 250,
    height: 150,
    center: {x: 250, y: 250},
    fillStyle: useLinearGradient(args),
  });
  return null;
}

export default {
  decorators: [withRenderFrameProvider],
  component: RenderLinearGradient,
} as ComponentMeta<typeof RenderLinearGradient>;

type useLinearGradientStory = StoryObj<ComponentProps<typeof RenderLinearGradient>>;

export const Default: useLinearGradientStory = {
  args: {
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
  },
};
