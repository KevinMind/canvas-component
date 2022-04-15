import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { Canvas } from "./Canvas.component";
import { RenderFrameProvider } from "../../RenderFrame.component";

export default {
  component: Canvas,
  decorators: [
    (Story) => {
      return (
        <RenderFrameProvider>
          <Story />
        </RenderFrameProvider>
      )
    }
  ],
} as ComponentMeta<typeof Canvas>;

type CanvasStory = StoryObj<ComponentProps<typeof Canvas>>;

export const Default: CanvasStory = {
  args: {
    style: {
      border: '1px solid blue',
    }
  }
};
