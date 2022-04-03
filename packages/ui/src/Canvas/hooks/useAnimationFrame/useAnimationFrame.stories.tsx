import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import {
  useAnimationFrame,
  UseAnimationFrameArgs,
  Easing as EasingType,
} from "./useAnimationFrame.hooks";
import { Circle } from "../../components/Circle";
import { CanvasProvider } from "../../Canvas.provider";

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

function RenderEasing({ easing }: { easing: EasingType }) {
  const [x] = useAnimationFrame({
    easing,
    auto: true,
    mode: "pingpong",
    duration: 3_000,
    from: 125,
    to: 375,
  });
  return (
    <CanvasProvider width={500} height={250} style={{ border: "1px solid" }}>
      <Circle pos={{ x, y: 125 }} radius={125} rotation={0} />
    </CanvasProvider>
  );
}

type EasingStory = StoryObj<ComponentProps<typeof RenderEasing>>;

export const Easing: EasingStory = {
  args: {
    easing: "linear",
  },
  argTypes: {
    easing: {
      description: "overwritten description",
      table: {
        type: {
          summary: "something short",
          detail: "something really really long",
        },
      },
      options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
      control: { type: "radio" },
    },
  },
  render: (args) => <RenderEasing {...args} />,
};
