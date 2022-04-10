import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { {{name}} } from "./{{name}}.component";

export default {
  component: {{name}},
} as ComponentMeta<typeof {{name}}>;

type {{name}}Story = StoryObj<ComponentProps<typeof {{name}}>>;

export const Default: {{name}}Story = {
  args: {
    label: "Word",
  },
};
