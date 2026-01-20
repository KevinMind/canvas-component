import React, { useMemo } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import bezierEasing from "bezier-easing";

import { TwoProvider, TwoLine, TwoCircle } from '../../two-js-react';
import { useAnimationFrameState, useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// DrawGrid - Faithful recreation of original
// ============================================

// Original bezier easing curve
const drawEasing = bezierEasing(0.64, 0.13, 0.64, 0.98);

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// ============================================
// Row Component - Animated horizontal line
// ============================================

interface RowProps {
  width: number;
  y: number;
  reverse?: boolean;
  maxDuration: number;
}

function Row({ width, y, reverse = false, maxDuration }: RowProps) {
  // Random duration between maxDuration/e and maxDuration (same as original)
  const duration = useMemo(() => {
    return randomNumber(maxDuration / Math.E, maxDuration);
  }, [maxDuration]);

  const [percentage] = useAnimationFrameState({
    from: 0,
    to: 100,
    duration,
    auto: true,
    easing: drawEasing,
  });

  const x = (width * percentage) / 100;

  if (reverse) {
    const reverseX = width - x;
    return <TwoLine x1={reverseX} y1={y} x2={width} y2={y} stroke="black" linewidth={1} />;
  }

  return <TwoLine x1={0} y1={y} x2={x} y2={y} stroke="black" linewidth={1} />;
}

// ============================================
// Col Component - Animated vertical line
// ============================================

interface ColProps {
  height: number;
  x: number;
  reverse?: boolean;
  maxDuration: number;
}

function Col({ height, x, reverse = false, maxDuration }: ColProps) {
  // Random duration between maxDuration/2 and maxDuration (same as original)
  const duration = useMemo(() => {
    return randomNumber(maxDuration / 2, maxDuration);
  }, [maxDuration]);

  const [percentage] = useAnimationFrameState({
    from: 0,
    to: 100,
    duration,
    auto: true,
    easing: drawEasing,
  });

  const y = (height * percentage) / 100;

  if (reverse) {
    const reverseY = height - y;
    return <TwoLine x1={x} y1={reverseY} x2={x} y2={height} stroke="black" linewidth={1} />;
  }

  return <TwoLine x1={x} y1={0} x2={x} y2={y} stroke="black" linewidth={1} />;
}

// ============================================
// DrawGrid Component
// ============================================

interface DrawGridProps {
  rows: number;
  cols: number;
  children?: React.ReactNode;
}

function DrawGridComponent({ rows, cols, children }: DrawGridProps) {
  const width = 500;
  const height = 500;

  // Calculate spacing (same logic as original)
  const rowSpacing = useMemo(() => {
    if (!rows) return height / cols;
    return height / rows;
  }, [rows, cols, height]);

  const colSpacing = useMemo(() => {
    if (!cols) return width / rows;
    return width / cols;
  }, [rows, cols, width]);

  const numRows = useMemo(() => {
    if (!rows) return Math.round(height / colSpacing);
    return rows;
  }, [rows, height, colSpacing]);

  const numCols = useMemo(() => {
    if (!cols) return Math.round(width / rowSpacing);
    return cols;
  }, [cols, width, rowSpacing]);

  const maxDuration = 6000;

  return (
    <TwoProvider width={width} height={height} type="canvas">
      {/* Rows - alternating direction */}
      {Array.from({ length: numRows }, (_, idx) => (
        <Row
          key={`row-${idx}`}
          y={idx * rowSpacing}
          width={width}
          maxDuration={maxDuration}
          reverse={idx % 2 === 0}
        />
      ))}

      {/* Columns - alternating direction (opposite pattern) */}
      {Array.from({ length: numCols }, (_, idx) => (
        <Col
          key={`col-${idx}`}
          x={idx * colSpacing}
          height={height}
          maxDuration={maxDuration}
          reverse={idx % 2 !== 0}
        />
      ))}

      {children}
    </TwoProvider>
  );
}

// ============================================
// Mouse Following Circle (for WithMouse variant)
// ============================================

function MouseCircle() {
  const [x, y] = useMousePos();

  return (
    <TwoCircle
      x={x}
      y={y}
      radius={50}
      fill="rgba(255, 255, 255, 0.6)"
      stroke="white"
    />
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta = {
  title: 'Animation/Draw Grid',
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
};

export default meta;

type DrawGridStory = StoryObj<DrawGridProps>;

export const Default: DrawGridStory = {
  render: (args) => <DrawGridComponent {...args} />,
  args: {
    rows: 10,
    cols: 0,
  },
};

export const WithMouse: DrawGridStory = {
  decorators: [withMousePosition],
  render: (args) => (
    <DrawGridComponent {...args}>
      <MouseCircle />
    </DrawGridComponent>
  ),
  args: {
    rows: 10,
    cols: 0,
  },
};
