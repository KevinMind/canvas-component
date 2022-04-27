import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withMousePosition, withRenderFrameProvider } from "../../../../.storybook/decorators";

import { FourDCircle } from "./FourDCircle.component";

export default {
  decorators: [withMousePosition, withRenderFrameProvider],
  component: FourDCircle,
} as ComponentMeta<typeof FourDCircle>;

type FourDCircleStory = StoryObj<ComponentProps<typeof FourDCircle>>;

export const Default: FourDCircleStory = {
  args: {
    radius: 20,
    length: 50,
    visible: false,
  },
};
