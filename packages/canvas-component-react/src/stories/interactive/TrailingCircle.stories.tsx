import React from 'react';
import { Meta, StoryObj } from "@storybook/react";
import { useSpring } from "use-spring";

import { TwoProvider, TwoCircle } from '../../two-js-react';
import { useMousePos, withMousePosition } from '../../../.storybook/decorators';
import { Position } from '@canvas-component/core';

// ============================================
// TrailingCircle - Faithful recreation of original
// ============================================

interface TrailingCircleProps {
  radius: number;
  fill: string;
}

/**
 * Hook that creates spring-based trails following a position.
 * Each trail has different spring characteristics based on its index,
 * creating a "comet tail" effect where later trails lag more.
 */
function useTrails(x: number, y: number, count: number): Position[] {
  const springs: Position[] = [];

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [springX, isXMoving] = useSpring(x, config);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [springY, isYMoving] = useSpring(y, config);

    // Only add to trails if currently moving (same as original)
    if (isXMoving && isYMoving) {
      springs.push({ x: springX, y: springY });
    }
  }

  return springs;
}

function TrailingCircleDemo({ radius, fill }: TrailingCircleProps) {
  const [x, y] = useMousePos();
  const trails = useTrails(x, y, 20);

  return (
    <TwoProvider width={500} height={500} type="canvas">
      {/* Main circle at mouse position */}
      <TwoCircle x={x} y={y} radius={radius} fill={fill} />

      {/* Trail circles with decreasing radius (exact original formula) */}
      {trails.map((pos, idx) => {
        const trailRadius = radius - (radius * idx) / trails.length;
        return (
          <TwoCircle
            key={idx}
            x={pos.x}
            y={pos.y}
            radius={trailRadius}
            fill={fill}
          />
        );
      })}
    </TwoProvider>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta = {
  title: 'Interactive/Trailing Circle',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
};

export default meta;

export const Default: StoryObj<TrailingCircleProps> = {
  render: (args) => <TrailingCircleDemo {...args} />,
  args: {
    radius: 20,
    fill: 'red',
  },
};
