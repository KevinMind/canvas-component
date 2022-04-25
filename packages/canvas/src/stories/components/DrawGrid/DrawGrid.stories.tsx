import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { DrawGrid } from "./DrawGrid.component";
import { withMousePosition, useMousePos, withRenderFrameProvider, withTodoList } from "../../../../.storybook/decorators";
import { Ellipse } from "../../../components/Ellipse";

export default {
  decorators: [withRenderFrameProvider, withTodoList],
  component: DrawGrid,
} as ComponentMeta<typeof DrawGrid>;

type DrawGridStory = StoryObj<ComponentProps<typeof DrawGrid>>;

export const Default: DrawGridStory = {
  args: {
    rows: 10,
    cols: 0,
  },
};

function RenderWithMouse() {
  const [x, y] = useMousePos();

  return (
    <Ellipse pos={{x, y}} rotation={0} fillStyle="rgba(255, 255, 255, 0.6)" strokeStyle="white" radius={50} />
  )
}

export const WithMouse: DrawGridStory = {
  decorators: [withMousePosition],
  args: {
    rows: 10,
    cols: 0,
  },
  render: (args) => {
    return (
      <>
        <DrawGrid {...args} />
        <RenderWithMouse />
      </>
    )
  }
};
