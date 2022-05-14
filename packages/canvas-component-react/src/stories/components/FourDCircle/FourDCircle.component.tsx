import React, { useRef, useState, useEffect } from "react";
import { drawEllipse, Position } from "@canvas-component/core";

import { useMousePos } from "../../../../.storybook/decorators";
import { useRenderFrame } from "../../../RenderFrame.hooks";

import { FourDCircleProps } from "./FourDCircle.types";

export function FourDCircle({
  radius: maxRadius,
  length,
  ...props
}: FourDCircleProps) {
  const [moving, setMoving] = useState<boolean>(false);
  const radius = useRef<number>(maxRadius);
  const trails = useRef<Position[]>([]);

  function handleMove(x: number, y: number) {
    if (!moving) {
      setMoving(true);
    }
    if (trails.current.length > length) {
      trails.current.pop();
    }
    trails.current.unshift({x, y});
  }

  function handleIdle() {
    setMoving(false);
  }

  const [x, y] = useMousePos({
    onMove: handleMove,
    onIdle: handleIdle,
  });

  useEffect(() => {
    function increase(): void {
      if (radius.current < maxRadius) {
        radius.current++;
        requestAnimationFrame(increase);
      }
      return;
    }
    if (moving) {
      return increase();
    }

    function reduce(): void {
      if (radius.current === 0) {
        trails.current = [];
        return;
      }
      radius.current--;
      requestAnimationFrame(reduce);
    }

    reduce();
  }, [moving]);


  useRenderFrame((ctx) => {
    drawEllipse(ctx, {...props, center: {x, y}, radius: maxRadius});

    for (let x = 0; x < trails.current.length; x++) {
      const pos = trails.current[x];
      const perc = (trails.current.length - x) / trails.current.length;

      drawEllipse(ctx, {...props, center: pos, radius: perc * radius.current});
    }
  });

  return null;
}
