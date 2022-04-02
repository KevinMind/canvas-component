import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { {{name}} } from "./{{name}}.component";
import { withCanvasProvider, withTodoList } from "../../.storybook/decorators";

export default {
  decorators: [withCanvasProvider, withTodoList],
  component: {{name}},
} as ComponentMeta<typeof {{name}}>;

type {{name}}Story = StoryObj<ComponentProps<typeof {{name}}>>;

export const Default: {{name}}Story = {
  args: {
    pos: {
      x: 0,
      y: 0,
    },
  },
};
