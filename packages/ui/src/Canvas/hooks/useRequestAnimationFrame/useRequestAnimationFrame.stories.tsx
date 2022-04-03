import React, { ComponentProps, useState } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { useRequestAnimationFrame } from "./useRequestAnimationFrame.hooks";

function TransitionValue({ callback }: { callback: (time: number) => void }) {
  const [value, setValue] = useState<any>();
  const actions = useRequestAnimationFrame((time) => {
    setValue(callback(time));
  });

  return (
    <div>
      <div>
        <button onClick={actions.start}>start</button>
        <button onClick={actions.stop}>stop</button>
      </div>
      <div>
        <h3>{value ? Math.round(Number(value)) : "click start"}</h3>
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
    callback: (curr) => curr,
  },
};
