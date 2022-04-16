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
  const [radius] = useAnimationFrame({
    from: 10,
    to: 100,
    duration: 5_000,
    infinite: true,
    auto: true,
    mode: 'pingpong'
  });

  const [x, y] = useMousePos();
  const canvas = useRenderFrameCanvas();
  const [two, setTwo] = useState<Two>(new Two());
  const circle = useRef<TwoCircle>();

  useEffect(() => {
    if (canvas) {
      console.log({
        width: canvas.width,
        height: canvas.height,
      });
      setTwo(new Two({
        domElement:canvas,
        type: Two.Types.canvas,
        width: canvas.width,
        height: canvas.height,
        overdraw: true,
        smoothing: true,
      }));
    }

  }, [canvas]);

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

  /**
   * When using two.js the native shapes need to have all properties doubled. It seems
   * when binding two.js to the shared canvas the coordinates and radius are being halved somehow..
   */
  useLine({start: {x: 0, y: 0}, end: {x: x * 2, y: y * 2}, rotation: 0});

  useCircle({pos: {x: x * 2, y: y * 2}, radius: 200, rotation: 0});

  return null;
}

export default {
  component: RenderTwoJS,
  decorators: [withTodoList, withMousePosition, withRenderFrameProvider],
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
} as ComponentMeta<typeof RenderTwoJS>;

export const Default: StoryObj = {};
