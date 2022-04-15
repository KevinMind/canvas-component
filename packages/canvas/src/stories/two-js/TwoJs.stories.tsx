import React, { useEffect, useRef, useState } from 'react';
import { ComponentMeta, StoryObj } from "@storybook/react";
import {Circle as TwoCircle} from 'two.js/src/shapes/circle';
import Two from 'two.js';

import { withTodoList, withRenderFrameProvider, withMousePosition, useMousePos } from '../../../.storybook/decorators';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useCircle } from '../../components/Circle';

import { useRenderFrameCanvas, useRenderFrame } from '../../RenderFrame.hooks';
import { useLine } from '../../components/Line';

function RenderTwoJS() {
  const canvas = useRenderFrameCanvas();
  const [two, setTwo] = useState<Two>(new Two());

  useEffect(() => {
    if (canvas) {
      setTwo(new Two({autostart: true, domElement: canvas, type: Two.Types.canvas}));
    }

  }, [canvas]);

  const circle = useRef<TwoCircle>();

  const [x, y] = useMousePos();

  // useCircle({radius: 500, pos: {x, y}, rotation: 0})

  const [radius] = useAnimationFrame({
    from: 100,
    to: 200,
    duration: 3_000,
    infinite: true,
    auto: true,
    mode: "pingpong",
  });

  const [red] = useAnimationFrame({
    from: 0,
    to: 255,
    duration: 1_200,
    infinite: true,
    auto: true,
    mode: "pingpong",
  });

  const [green] = useAnimationFrame({
    from: 0,
    to: 255,
    duration: 1_200,
    infinite: true,
    auto: true,
    mode: "pingpong-backward",
  });

  useRenderFrame(() => {
    if (circle.current) circle.current.remove();
    
    circle.current = two.makeCircle(x, y, radius);

    circle.current.fill = `rgb(${red}, ${green}, 255)`;
    two.update();
  });

  useLine({start: {x: 0, y: 0}, end: {x, y}, rotation: 0});

  useCircle({pos: {x, y}, radius: radius + 10, rotation: 0});

  return null;
}

export default {
  component: RenderTwoJS,
  decorators: [withRenderFrameProvider, withMousePosition, withTodoList],
} as ComponentMeta<typeof RenderTwoJS>;

export const Default: StoryObj = {};
