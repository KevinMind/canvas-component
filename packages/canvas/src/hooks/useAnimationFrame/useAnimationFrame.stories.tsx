import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import {
  useAnimationFrame,
} from "./useAnimationFrame.hooks";
import {UseAnimationFrameConfig} from './useAnimationFrame.types';

function TransitionValue(args: UseAnimationFrameConfig) {
  const [value, actions] = useAnimationFrame(args);

  return (
    <div>
      <div>
        <button onClick={() => actions.start()}>start</button>
        <button onClick={actions.stop}>stop</button>
        <button onClick={actions.reset}>reset</button>
      </div>
      <div>
        <h3>{Math.round(value)}</h3>
      </div>
    </div>
  );
}

export default {
  component: TransitionValue,
} as ComponentMeta<typeof TransitionValue>;

type TransitionValueStory = StoryObj<ComponentProps<typeof TransitionValue>>;

function expectCount(
  canvas: ReturnType<typeof within>,
  value: number,
  timeout?: number
) {
  return waitFor(() => expect(canvas.getByText(value)).toBeInTheDocument(), {
    timeout,
  });
}

export const Default: TransitionValueStory = {
  args: {
    duration: 10_000,
    from: 0,
    to: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectCount(canvas, 0);
  },
};

export const ClicksStart: TransitionValueStory = {
  args: {
    duration: 3_000,
    from: 0,
    to: 3,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("start"));

    await expectCount(canvas, 3, 3_000);
  },
};

export const RestartsTimer: TransitionValueStory = {
  args: {
    duration: 10_000,
    from: 0,
    to: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("start"));

    await expectCount(canvas, 5, 5_000);

    await userEvent.click(canvas.getByText("start"));

    await expectCount(canvas, 0);
    await userEvent.click(canvas.getByText("stop"));
  },
};

function RenderManyTimers(props: ComponentProps<typeof TransitionValue>) {
  return (
    <>
      <TransitionValue {...props} />
      <TransitionValue {...props} />
      <TransitionValue {...props} />
    </>
  );
}

export const ManyTimers: TransitionValueStory = {
  args: {
    from: 0,
    to: 3,
    duration: 3_000,
  },
  render: (args) => {
    return <RenderManyTimers {...args} />;
  },
};

export const Auto: TransitionValueStory = {
  args: {
    from: 0,
    to: 5,
    duration: 5_000,
    auto: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCount(canvas, 5, 5_000);

    await userEvent.click(canvas.getByText("stop"));
  },
};

export const Interval: TransitionValueStory = {
  args: {
    auto: true,
    from: 0,
    to: 2,
    duration: 2_000,
    interval: 2_000,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByRole("heading", { level: 3 }).innerHTML).not.toEqual(
        1
      );
    });
  },
};

export const Infinite: TransitionValueStory = {
  args: {
    from: 0,
    to: 5,
    duration: 5_000,
    infinite: true,
    auto: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCount(canvas, 5, 5_000);

    await expectCount(canvas, 2, 7_000);
  },
};

export const Backwards: TransitionValueStory = {
  args: {
    infinite: true,
    from: 0,
    to: 5,
    duration: 5_000,
    auto: true,
    mode: "backward",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCount(canvas, 2, 3_000);
  },
};

export const PingPong: TransitionValueStory = {
  args: {
    from: 0,
    to: 5,
    duration: 5_000,
    auto: true,
    mode: "pingpong",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCount(canvas, 2, 3_000);
  },
};
