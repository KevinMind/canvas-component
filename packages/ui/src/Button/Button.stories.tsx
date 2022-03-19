import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
// import { within, userEvent } from '@storybook/testing-library';
import { Button } from "./Button";

export default {
  component: Button,
} as ComponentMeta<typeof Button>;

export const Default: StoryObj<ComponentProps<typeof Button>> = {
  args: {
    onClick: () => console.log("clicked"),
    children: "Click Me!",
  },
};
