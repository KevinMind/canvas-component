import React, { ComponentProps, useEffect, useState } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withMousePosition, withRenderFrameProvider, useMousePos } from "../../../.storybook/decorators";
import { Ellipse } from "../Ellipse";
import { Position } from "../../RenderFrame.types";

import { Path } from "./Path.component";

function RenderPath() {
  const [penDown, setPendDown] = useState<boolean>(false);
  const [points, setPoints] = useState<Position[]>([]);
  const [drawings, setDrawings] = useState<(Position[])[]>([])

  const [x, y] = useMousePos();

  // @TODO: move mouseDown and mouseUp into useMousePos()
  useEffect(() => {
    function onMouseDown() {
      setPendDown(true);
    }

    function onMouseUp() {
      setPendDown(false);
    }

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    }
  }, []);

  useEffect(() => {
    if (penDown) {
      setPoints((curr) => [...curr, {x, y}]);
    }
  }, [penDown, x, y]);

  useEffect(() => {
    if (penDown) {
      console.log('start drawing', {x, y});
    } else {
      console.log('finish drawing', points);
      setDrawings((curr) => [...curr, points]);
      setPoints([]);
    }

  }, [penDown]);

  return (
    <>
      <Ellipse pos={{x, y}} radius={penDown ? 2 : 10} />
      {drawings.map((points) => (
        <Path points={points} />
      ))}
      <Path points={points} />
    </>
  )
}

export default {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  decorators: [withMousePosition, withRenderFrameProvider],
  component: RenderPath,
} as ComponentMeta<typeof RenderPath>;

type PathStory = StoryObj<ComponentProps<typeof RenderPath>>;

export const Default: PathStory = {};
