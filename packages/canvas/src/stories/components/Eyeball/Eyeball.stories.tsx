import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { Eyeball } from "./Eyeball.component";
import { withMousePosition, withRenderFrameProvider } from "../../../../.storybook/decorators";

export default {
  decorators: [withMousePosition, withRenderFrameProvider],
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  component: Eyeball,
} as ComponentMeta<typeof Eyeball>;

type EyeballStory = StoryObj<ComponentProps<typeof Eyeball>>;

export const Default: EyeballStory = {};
