import React, { useEffect, useRef, useState } from 'react';
import { ComponentMeta, StoryObj } from "@storybook/react";
import {Circle as TwoCircle} from 'two.js/src/shapes/circle';
import Two from 'two.js';

import { withTodoList, withRenderFrameProvider, withMousePosition, useMousePos } from '../../../.storybook/decorators';
import { useAnimationFrame } from '../../hooks/useAnimationFrame';
import { useCircle } from '../../components/Circle';

import { useRenderFrameCanvas, useRenderFrame } from '../../RenderFrame.hooks';
import { useLine } from '../../components/Line';

function useTwoJs() {
  const [canvas] = useRenderFrameCanvas();
  const [two, setTwo] = useState<Two>(new Two());

  useEffect(() => {
    if (canvas) {
      setTwo(new Two({
        domElement:canvas,
        type: Two.Types.canvas,
        overdraw: true,
        smoothing: true,
      }));
    }

  }, [canvas]);

  useRenderFrame(() => {
    two.update();
  })

  return two;
}

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
  const circle = useRef<TwoCircle>();
  const two = useTwoJs();

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
  });

  /**
   * Two.js uses a doubling factor in the canavas element. if you set Two({width: 500, height: 100, domElement: canvasEl})
   * 
   * it will set canvasEl.width to 1000px and height to 200px then set styles with the 500/100 dimensions.
   * I'm not totally sure why it does this, other canvas rendering engines do not.
   * we could implement a useScale hook or something like that to modify the dimensions of all drawn shapes to offset
   * but it might not be worth it. (see examples here https://benchmarks.slaylines.io/threejs.html)
   *
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

function RenderGroups() {
  const [isRectBack, setIsRectBack] = useState<boolean>(false);
  const two = useTwoJs();

  const [backgroundX] = useAnimationFrame({
    from: 50,
    to: two.width - 50,
    duration: 1_000,
    auto: true,
    infinite: true,
    mode: "pingpong",
  });

  const circle = useRef(two.makeCircle(0, 0, 50));
  const rect = useRef(two.makeRectangle(0, 0, 100, 100));

  useEffect(() => {
    circle.current.fill = '#FF8000';
    circle.current.stroke = 'orangered';

    rect.current.fill = 'rgba(0, 200, 255, 0.75)';
    rect.current.stroke = '#1C75BC';
  }, []);

  useEffect(() => {
    if (backgroundX === 50) {
      setIsRectBack(false);
    }

    if (backgroundX === two.width - 50) {
      setIsRectBack(true);
    }
  }, [backgroundX]);

  const background = two.makeGroup([]);
  const foreground = two.makeGroup([]);

  useRenderFrame(() => {
    if (isRectBack) {
      rect.current.addTo(background);
      circle.current.addTo(foreground);
    } else {
      circle.current.addTo(background);
      rect.current.addTo(foreground);
    }
    
    rect.current.position.set(two.width / 2 - 10, two.height / 2)
    circle.current.position.set(backgroundX, two.height / 2);
  })
  return null;
}

export const Groups: StoryObj = {
  render: () => <RenderGroups />,
}
