import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { ElasticRect } from "./ElasticRect.component";
import { withMousePosition, withRenderFrameProvider } from "../../../../.storybook/decorators";

export default {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  decorators: [withMousePosition, withRenderFrameProvider],
  component: ElasticRect,
} as ComponentMeta<typeof ElasticRect>;

type ElasticRectStory = StoryObj<ComponentProps<typeof ElasticRect>>;

export const Default: ElasticRectStory = {
  args: {
    width: 250,
    height: 150,
    center: {
      x: 250,
      y: 250,
    }
  },
};
