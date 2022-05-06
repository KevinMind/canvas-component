import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider } from "../../../.storybook/decorators";

import { Shadow } from "./Shadow.component";
import randomColor from "randomcolor";

export default {
  decorators: [withRenderFrameProvider],
  component: Shadow,
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  args: {
    center: {
      x: 250,
      y: 250,
    },
    width: 250,
    height: 250,
    fillStyle: 'green',
  },
} as ComponentMeta<typeof Shadow>;

type ShadowStory = StoryObj<ComponentProps<typeof Shadow>>;

export const Default: ShadowStory = {
  args: {
    shadowColor: randomColor(),
    shadowBlur: 15,
    shadowOffsetX: -10,
    shadowOffsetY: -10,
  },
};
