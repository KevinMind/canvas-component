import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import { userEvent, waitFor, within } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

import {
  useRequestAnimationFrame,
  RequestAnimationFrameCallback,
} from "./useRequestAnimationFrame.hooks";

function TransitionValue<T>({
  duration,
  callback,
}: {
  duration: number;
  callback: RequestAnimationFrameCallback<T>;
}) {
  const [value, actions] = useRequestAnimationFrame<T>(callback);

  return (
    <div>
      <div>
        <button onClick={() => actions.start(duration)}>start</button>
        <button onClick={actions.stop}>stop</button>
        <button onClick={actions.reset}>reset</button>
      </div>
      <div>
        <p>{value}</p>
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

const useCounter: RequestAnimationFrameCallback<number> = (frame, duration) => {
  if (frame > duration) {
    return duration;
  }
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
    duration: 10_000,
    callback: useCounter,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText("start"));

    await expectCount(canvas, 10, 10_000);
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

    await userEvent.click(canvas.getByText("stop"));

    await userEvent.click(canvas.getByText("start"));
    await userEvent.click(canvas.getByText("stop"));
    await expectCount(canvas, 0);
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
