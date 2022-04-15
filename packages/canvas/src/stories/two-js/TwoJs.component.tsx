import React, { useEffect, useState } from "react";
import { StoryContext, StoryFn } from "@storybook/react";
import Two from 'two.js';

import { useCanvasContext } from "../../components/Canvas/Canvas.hooks";
import { TwoJsContext } from "./TwoJs.context";

export function withTwoJsProvider(Story: StoryFn, ctx: StoryContext) {
  const canvasContext = useCanvasContext();
  const [two, setTwo] = useState<Two>(new Two());

  useEffect(() => {
    console.log(canvasContext);
    if (canvasContext.canvas) {
      setTwo(new Two({autostart: true, domElement: canvasContext.canvas, type: Two.Types.canvas}));
    }

  }, [canvasContext.canvas]);

  useEffect(() => {
    if (two) {
      console.log(two);
      two.appendTo(ctx.canvasElement);
    }
  }, [two]);

  return (
    <TwoJsContext.Provider value={two}>
      <Story />
    </TwoJsContext.Provider>
  );
}
