import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { TrailingCircle } from "./TrailingCircle.component";
import { withMousePosition, withRenderFrameProvider } from "../../../../.storybook/decorators";

export default {
  decorators: [withMousePosition, withRenderFrameProvider],
  component: TrailingCircle,
} as ComponentMeta<typeof TrailingCircle>;

type TrailingCircleStory = StoryObj<ComponentProps<typeof TrailingCircle>>;

export const Default: TrailingCircleStory = {
  args: {
    radius: 20,
    fillStyle: 'red',
  },
};
