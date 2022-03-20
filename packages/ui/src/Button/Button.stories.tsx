import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { within, userEvent } from "@storybook/testing-library";
import { expect, jest } from "@storybook/jest";

import { Button } from "./Button";

export default {
  component: Button,
} as ComponentMeta<typeof Button>;

type ButtonStory = StoryObj<ComponentProps<typeof Button>>;

export const Default: ButtonStory = {
  args: {
    onClick: () => console.log("clicked"),
    children: "Click Me!",
  },
};

const spy = jest.fn();

export const Clicked: ButtonStory = {
  ...Default,
  args: {
    ...Default.args,
    onClick: spy,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button"));

    await expect(spy).toHaveBeenCalled();
  },
};
