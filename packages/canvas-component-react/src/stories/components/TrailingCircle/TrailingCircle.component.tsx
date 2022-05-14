import React from "react";
import { useSpring } from "use-spring";
import { drawEllipse, Position } from "@canvas-component/core";

import { useMousePos } from "../../../../.storybook/decorators";

import { useRenderFrame } from "../../../RenderFrame.hooks";

import { TrailingCircleProps } from "./TrailingCircle.types";

function useTrails(x: number, y: number, count: number): Position[] {
  let springs: Position[] = [];

  for (let idx = 0; idx < count; idx++) {
    const percentage = idx / count;
    const config: Parameters<typeof useSpring>[1] = {
      stiffness: 200 * percentage + 20,
      damping: 1,
      mass: 2,
      decimals: 20,
      teleport: false,
      initialSpeed: 100,
    };
    const [springX, isXMoving] = useSpring(x, {...config});
    const [springY, isYMoving] = useSpring(y, {...config});

    if (isXMoving && isYMoving) {
      springs.push({x: springX, y: springY});
    }
  }

  return springs;
}

export function TrailingCircle(props: TrailingCircleProps) {
  const [x, y] = useMousePos();
  const trails = useTrails(x, y, 20);

  useRenderFrame((ctx) => {
    drawEllipse(ctx, {...props, center: {x, y}});

    for(let x = 0; x < trails.length; x++) {
      const pos = trails[x];
      drawEllipse(ctx, {...props, center: pos, radius: props.radius - props.radius * x / trails.length});
    }
    
  });

  return null;
}
