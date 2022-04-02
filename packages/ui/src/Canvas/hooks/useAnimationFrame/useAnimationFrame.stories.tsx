import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import {
  useAnimationFrame,
  UseAnimationFrameArgs,
} from "./useAnimationFrame.hooks";

function TransitionValue(args: UseAnimationFrameArgs) {
  const [value, actions] = useAnimationFrame(args);

  return (
    <div>
      <div>
        <button onClick={() => actions.start({ duration: args.duration })}>
          start
        </button>
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

export const Default: TransitionValueStory = {
  args: {
    duration: 3_000,
    from: 0,
    to: 10,
    infinite: true,
    auto: true,
  },
};
