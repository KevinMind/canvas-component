import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { within } from "@storybook/testing-library";
import { expect, jest } from "@storybook/jest";

import Index from "./index.page";

export default {
  component: Index,
} as ComponentMeta<typeof Index>;

type IndexStory = StoryObj<ComponentProps<typeof Index>>;

export const Default: IndexStory = {
    args: {},
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByRole("h1")).toBeInTheDocument();
    }
};

