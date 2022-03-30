import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

import {
  useRequestAnimationFrame,
  RequestAnimationFrameCallback,
  RequestAnimationFrameConfig,
} from "./useRequestAnimationFrame.hooks";

function TransitionValue<T>({
  duration,
  callback,
  config,
}: {
  duration: number;
  callback: RequestAnimationFrameCallback<T>;
  config: RequestAnimationFrameConfig;
}) {
  const [value, actions] = useRequestAnimationFrame<T>(callback, config);

  return (
    <div>
      <div>
        <button onClick={() => actions.start({ duration })}>start</button>
        <button onClick={actions.stop}>stop</button>
        <button onClick={actions.reset}>reset</button>
      </div>
      <div>
        <h3>{value}</h3>
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

const useCounter: RequestAnimationFrameCallback<number> = (frame) => {
  return Math.round(frame / 1000);
};

export const Default: TransitionValueStory = {
  args: {
    duration: 10_000,
    callback: useCounter,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expectCount(canvas, 0);
  },
};

export const ClicksStart: TransitionValueStory = {
  args: {
    duration: 3_000,
    callback: useCounter,
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
    callback: useCounter,
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
    callback: useCounter,
    duration: 3000,
  },
  render: (args) => {
    return <RenderManyTimers {...args} />;
  },
};

export const Auto: TransitionValueStory = {
  args: {
    callback: useCounter,
    config: {
      duration: 5_000,
      auto: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCount(canvas, 5, 5_000);

    await userEvent.click(canvas.getByText("stop"));
  },
};

export const Interval: TransitionValueStory = {
  args: {
    callback: useCounter,
    config: {
      auto: true,
      duration: 2_000,
      interval: 2_000,
    },
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
    callback: useCounter,
    config: {
      duration: 5_000,
      infinite: true,
      auto: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectCount(canvas, 5, 5_000);

    await expectCount(canvas, 2, 7_000);
  },
};
