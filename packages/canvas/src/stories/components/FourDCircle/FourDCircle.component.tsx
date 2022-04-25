import React, { useRef, useState, useEffect } from "react";

import { useMousePos } from "../../../../.storybook/decorators";
import { drawEllipse } from "../../../components/Ellipse";
import { useRenderFrame } from "../../../RenderFrame.hooks";
import { Position } from "../../../RenderFrame.types";

import { FourDCircleProps } from "./FourDCircle.types";

export function FourDCircle(props: FourDCircleProps) {
  const [moving, setMoving] = useState<boolean>(false);
  const radius = useRef<number>(props.radius);
  const trails = useRef<Position[]>([]);

  function handleMove(x: number, y: number) {
    if (!moving) {
      setMoving(true);
    }
    if (trails.current.length > 25) {
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
    if (moving) {
      radius.current = props.radius;
      return;
    }

    function reduce(): void {
      if (radius.current === 0) {
        return;
      }
      radius.current--;
      requestAnimationFrame(reduce);
    }

    reduce();
  }, [moving]);


  useRenderFrame((ctx) => {
    drawEllipse(ctx, {...props, pos: {x, y}});

    for (let x = 0; x < trails.current.length; x++) {
      const pos = trails.current[x];
      drawEllipse(ctx, {...props, pos, radius: radius.current});
    }
  });

  return null;
}
