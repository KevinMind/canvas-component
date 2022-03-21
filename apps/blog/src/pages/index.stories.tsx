import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { within, waitFor } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { graphql } from "msw";

import Index from "./index.page";

export default {
  parameters: {
    msw: {
      handlers: [
        graphql.query("IndexQuery", (_req, res, ctx) => {
          return res(
            ctx.data({
              posts: [{ id: "test" }],
            })
          );
        }),
      ],
    },
  },
  component: Index,
} as ComponentMeta<typeof Index>;

type IndexStory = StoryObj<ComponentProps<typeof Index>>;

export const Default: IndexStory = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        graphql.query("IndexQuery", (_req, res, ctx) => {
          return res(
            ctx.data({
              posts: [{ id: "test" }],
            })
          );
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByText("Hello blog")).toBeInTheDocument()
    );
  },
};

export const Loading: IndexStory = {
  args: {},
  parameters: {
    msw: {
      handlers: [
        graphql.query("IndexQuery", (_req, res, ctx) => {
          return res(ctx.delay("infinite"));
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByText("loading...")).toBeInTheDocument()
    );
  },
};
