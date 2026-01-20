import React, { useEffect, useState } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import { useSpring } from "use-spring";

import { TwoProvider, TwoPath, TwoCircle } from '../../two-js-react';
import { useMousePos, withMousePosition } from '../../../.storybook/decorators';
import { Position } from '@canvas-component/core';

// ============================================
// ElasticRect - Faithful recreation of original
// ============================================

type ActiveZone = 'top' | 'right' | 'bottom' | 'left' | 'dead';

interface ElasticRectProps {
  center: Position;
  width: number;
  height: number;
  margin?: number;
}

// ============================================
// Hooks (exact copies from original)
// ============================================

function useRectPoints({ width, height, center }: ElasticRectProps) {
  const w2 = width / 2;
  const h2 = height / 2;

  const leftX = center.x - w2;
  const topY = center.y - h2;
  const rightX = center.x + w2;
  const bottomY = center.y + h2;

  const vertices = {
    topRight: { x: rightX, y: topY },
    bottomRight: { x: rightX, y: bottomY },
    bottomLeft: { x: leftX, y: bottomY },
    topLeft: { x: leftX, y: topY },
  };

  return {
    vertices,
    leftX,
    rightX,
    topY,
    bottomY,
  };
}

function useActiveZone(props: ElasticRectProps): ActiveZone {
  const [zone, setZone] = useState<ActiveZone>('dead');
  const { leftX, rightX, topY, bottomY, vertices } = useRectPoints(props);
  const [x, y] = useMousePos();

  // Point-in-polygon test (ray casting algorithm from original)
  function inside(point: Position, vs: Position[]): boolean {
    let isInside = false;

    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x;
      const yi = vs[i].y;
      const xj = vs[j].x;
      const yj = vs[j].y;

      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

      if (intersect) {
        isInside = !isInside;
      }
    }

    return isInside;
  }

  useEffect(() => {
    // Top zone
    if (
      (x > leftX && x < rightX && y < topY) ||
      inside({ x, y }, [props.center, vertices.topLeft, vertices.topRight])
    ) {
      setZone('top');
      return;
    }

    // Right zone
    if (
      (x > rightX && y < bottomY && y > topY) ||
      inside({ x, y }, [props.center, vertices.topRight, vertices.bottomRight])
    ) {
      setZone('right');
      return;
    }

    // Bottom zone
    if (
      (x > leftX && x < rightX && y > bottomY) ||
      inside({ x, y }, [props.center, vertices.bottomLeft, vertices.bottomRight])
    ) {
      setZone('bottom');
      return;
    }

    // Left zone
    if (
      (x < leftX && y > topY && y < bottomY) ||
      inside({ x, y }, [props.center, vertices.topLeft, vertices.bottomLeft])
    ) {
      setZone('left');
      return;
    }

    setZone('dead');
  }, [x, y, leftX, rightX, topY, bottomY, props.center, vertices]);

  return zone;
}

// Spring hook for a single vertex (exact config from original)
function useSide(point: Position, active: boolean): Position {
  const [x, y] = useMousePos();
  const mousePos = { x, y };

  const config: Parameters<typeof useSpring>[1] = {
    stiffness: 100,
    damping: 26,
    mass: 5,
    decimals: 2,
    teleport: false,
    initialSpeed: 0,
  };

  const cp = active ? mousePos : point;

  const [xSpring] = useSpring(cp.x, config);
  const [ySpring] = useSpring(cp.y, config);

  return { x: xSpring, y: ySpring };
}

// ============================================
// ElasticRect Component
// ============================================

function ElasticRectDemo(props: ElasticRectProps) {
  const { margin = 0 } = props;
  const [x, y] = useMousePos();
  const { vertices, leftX, rightX, topY, bottomY } = useRectPoints(props);

  const mousePos = { x, y };

  const isOutsideRect =
    mousePos.x < leftX - margin ||
    mousePos.x > rightX + margin ||
    mousePos.y > bottomY + margin ||
    mousePos.y < topY - margin;

  const activeZone = useActiveZone(props);
  const isActive = !isOutsideRect;

  // Each corner springs toward mouse when its corresponding zone is active
  // (exact mapping from original)
  const topLeft = useSide(vertices.topLeft, isActive && activeZone === 'left');
  const topRight = useSide(vertices.topRight, isActive && activeZone === 'top');
  const bottomRight = useSide(vertices.bottomRight, isActive && activeZone === 'right');
  const bottomLeft = useSide(vertices.bottomLeft, isActive && activeZone === 'bottom');

  const polygonVertices = [topLeft, topRight, bottomRight, bottomLeft];

  return (
    <TwoProvider width={500} height={500} type="canvas">
      <TwoPath vertices={polygonVertices} fill="#3498db" stroke="#2980b9" linewidth={2} />
    </TwoProvider>
  );
}

// ============================================
// Story with helper visualizations
// ============================================

interface ElasticRectWithHelpersProps extends ElasticRectProps {
  showHelpers: boolean;
}

function ElasticRectWithHelpersDemo(props: ElasticRectWithHelpersProps) {
  const { margin = 0, showHelpers } = props;
  const [x, y] = useMousePos();
  const { vertices, leftX, rightX, topY, bottomY } = useRectPoints(props);

  const mousePos = { x, y };

  const isOutsideRect =
    mousePos.x < leftX - margin ||
    mousePos.x > rightX + margin ||
    mousePos.y > bottomY + margin ||
    mousePos.y < topY - margin;

  const activeZone = useActiveZone(props);
  const isActive = !isOutsideRect;

  const topLeft = useSide(vertices.topLeft, isActive && activeZone === 'left');
  const topRight = useSide(vertices.topRight, isActive && activeZone === 'top');
  const bottomRight = useSide(vertices.bottomRight, isActive && activeZone === 'right');
  const bottomLeft = useSide(vertices.bottomLeft, isActive && activeZone === 'bottom');

  const polygonVertices = [topLeft, topRight, bottomRight, bottomLeft];
  const lineStroke = 'rgba(0, 0, 0, 0.1)';

  return (
    <TwoProvider width={500} height={500} type="canvas">
      {showHelpers && (
        <>
          {/* Zone triangles */}
          <TwoPath
            vertices={[props.center, vertices.topLeft, vertices.topRight]}
            stroke={lineStroke}
            fill={activeZone === 'top' ? lineStroke : 'transparent'}
          />
          <TwoPath
            vertices={[props.center, vertices.topRight, vertices.bottomRight]}
            stroke={lineStroke}
            fill={activeZone === 'right' ? lineStroke : 'transparent'}
          />
          <TwoPath
            vertices={[props.center, vertices.bottomLeft, vertices.bottomRight]}
            stroke={lineStroke}
            fill={activeZone === 'bottom' ? lineStroke : 'transparent'}
          />
          <TwoPath
            vertices={[props.center, vertices.topLeft, vertices.bottomLeft]}
            stroke={lineStroke}
            fill={activeZone === 'left' ? lineStroke : 'transparent'}
          />

          {/* Margin boundary */}
          <TwoPath
            vertices={[
              { x: leftX - margin, y: topY - margin },
              { x: rightX + margin, y: topY - margin },
              { x: rightX + margin, y: bottomY + margin },
              { x: leftX - margin, y: bottomY + margin },
            ]}
            stroke={lineStroke}
            fill="transparent"
          />

          {/* Mouse position indicator */}
          <TwoCircle x={x} y={y} radius={3} fill="#e74c3c" />
        </>
      )}

      {/* Main elastic rectangle */}
      <TwoPath vertices={polygonVertices} fill="#3498db" stroke="#2980b9" linewidth={2} />
    </TwoProvider>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta = {
  title: 'Interactive/Elastic Rect',
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

type ElasticRectStory = StoryObj<ElasticRectWithHelpersProps>;

export const Default: ElasticRectStory = {
  render: (args) => <ElasticRectWithHelpersDemo {...args} />,
  args: {
    width: 250,
    height: 150,
    center: {
      x: 250,
      y: 250,
    },
    margin: 50,
    showHelpers: false,
  },
};

export const WithHelpers: ElasticRectStory = {
  render: (args) => <ElasticRectWithHelpersDemo {...args} />,
  args: {
    width: 250,
    height: 150,
    center: {
      x: 250,
      y: 250,
    },
    margin: 50,
    showHelpers: true,
  },
};
