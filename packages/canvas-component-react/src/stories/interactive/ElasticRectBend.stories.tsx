import React, { useEffect, useRef } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import { useSpring } from 'use-spring';
import Two from 'two.js';

import { TwoProvider, TwoCircle, useTwo } from '../../two-js-react';
import { useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// ElasticRectBend - Rectangle with membrane-like edges
// Edges resist entry (bulge inward), then release when mouse enters
// ============================================

interface Position {
  x: number;
  y: number;
}

interface ElasticRectBendProps {
  center: Position;
  width: number;
  height: number;
  margin?: number;
  resistance?: number; // How much the membrane resists (0-1)
}

// Spring hook for membrane control point
// When mouse is outside near edge: bulge INWARD (resist entry)
// When mouse is inside or far away: return to rest
function useMembranePoint(
  restPoint: Position,
  pushPoint: Position, // Where to push toward when resisting (toward center)
  pressure: number,    // 0 = no pressure, 1 = max pressure
): Position {
  const config = {
    stiffness: 180,  // Stiffer for membrane feel
    damping: 12,     // Less damping for more wobble on release
    mass: 2,
    decimals: 2,
    teleport: false,
    initialSpeed: 0
  };

  // Interpolate between rest and push based on pressure
  const targetX = restPoint.x + (pushPoint.x - restPoint.x) * pressure;
  const targetY = restPoint.y + (pushPoint.y - restPoint.y) * pressure;

  const [xSpring] = useSpring(targetX, config);
  const [ySpring] = useSpring(targetY, config);

  return { x: xSpring, y: ySpring };
}

// Custom component that renders smooth quadratic-like bezier curves
// Uses 4 corner anchors with control handles that bend edges toward mouse
function QuadraticBezierRect({
  vertices,
  controlPoints,
  fill,
  stroke,
  linewidth,
}: {
  vertices: { topLeft: Position; topRight: Position; bottomRight: Position; bottomLeft: Position };
  controlPoints: { top: Position; right: Position; bottom: Position; left: Position };
  fill: string;
  stroke: string;
  linewidth: number;
}) {
  const two = useTwo();
  const pathRef = useRef<any>(null);

  useEffect(() => {
    // Create path with 4 corner anchors
    const path = two.makePath([
      new Two.Anchor(0, 0),
      new Two.Anchor(0, 0),
      new Two.Anchor(0, 0),
      new Two.Anchor(0, 0),
    ]);

    path.position.set(0, 0);
    (path as any).closed = true;
    // Enable manual bezier control
    (path as any).curved = true;
    (path as any).automatic = false;
    pathRef.current = path;

    return () => {
      path.remove();
    };
  }, [two]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const anchors = path.vertices;
    const { topLeft, topRight, bottomRight, bottomLeft } = vertices;
    const { top: cpTop, right: cpRight, bottom: cpBottom, left: cpLeft } = controlPoints;

    // Update corner positions
    anchors[0].set(topLeft.x, topLeft.y);
    anchors[1].set(topRight.x, topRight.y);
    anchors[2].set(bottomRight.x, bottomRight.y);
    anchors[3].set(bottomLeft.x, bottomLeft.y);

    // Set command type to curve for all anchors
    anchors[0].command = Two.Commands.curve;
    anchors[1].command = Two.Commands.curve;
    anchors[2].command = Two.Commands.curve;
    anchors[3].command = Two.Commands.curve;

    // For quadratic-like bezier: control handles point toward the edge control point
    // Controls are RELATIVE to anchor position

    // Top-Left corner (anchor 0):
    // - outgoing (right) goes toward top edge control point
    // - incoming (left) comes from left edge control point
    anchors[0].controls.right.set(
      (cpTop.x - topLeft.x) * 0.66,
      (cpTop.y - topLeft.y) * 0.66
    );
    anchors[0].controls.left.set(
      (cpLeft.x - topLeft.x) * 0.66,
      (cpLeft.y - topLeft.y) * 0.66
    );

    // Top-Right corner (anchor 1):
    // - outgoing (right) goes toward right edge control point
    // - incoming (left) comes from top edge control point
    anchors[1].controls.left.set(
      (cpTop.x - topRight.x) * 0.66,
      (cpTop.y - topRight.y) * 0.66
    );
    anchors[1].controls.right.set(
      (cpRight.x - topRight.x) * 0.66,
      (cpRight.y - topRight.y) * 0.66
    );

    // Bottom-Right corner (anchor 2):
    // - outgoing (right) goes toward bottom edge control point
    // - incoming (left) comes from right edge control point
    anchors[2].controls.left.set(
      (cpRight.x - bottomRight.x) * 0.66,
      (cpRight.y - bottomRight.y) * 0.66
    );
    anchors[2].controls.right.set(
      (cpBottom.x - bottomRight.x) * 0.66,
      (cpBottom.y - bottomRight.y) * 0.66
    );

    // Bottom-Left corner (anchor 3):
    // - outgoing (right) goes toward left edge control point
    // - incoming (left) comes from bottom edge control point
    anchors[3].controls.left.set(
      (cpBottom.x - bottomLeft.x) * 0.66,
      (cpBottom.y - bottomLeft.y) * 0.66
    );
    anchors[3].controls.right.set(
      (cpLeft.x - bottomLeft.x) * 0.66,
      (cpLeft.y - bottomLeft.y) * 0.66
    );

    path.fill = fill;
    path.stroke = stroke;
    path.linewidth = linewidth;
  }, [vertices, controlPoints, fill, stroke, linewidth]);

  return null;
}

function ElasticRectBendDemo({ center, width, height, margin = 50, resistance = 0.4 }: ElasticRectBendProps) {
  const [mouseX, mouseY] = useMousePos();

  // Calculate corner positions
  const halfW = width / 2;
  const halfH = height / 2;

  const vertices = {
    topLeft: { x: center.x - halfW, y: center.y - halfH },
    topRight: { x: center.x + halfW, y: center.y - halfH },
    bottomRight: { x: center.x + halfW, y: center.y + halfH },
    bottomLeft: { x: center.x - halfW, y: center.y + halfH },
  };

  // Edge midpoints (rest positions)
  const edgeMidpoints = {
    top: { x: center.x, y: center.y - halfH },
    right: { x: center.x + halfW, y: center.y },
    bottom: { x: center.x, y: center.y + halfH },
    left: { x: center.x - halfW, y: center.y },
  };

  // Push points (where edges bend toward when resisting - toward center)
  const pushPoints = {
    top: { x: center.x, y: center.y - halfH + halfH * resistance },
    right: { x: center.x + halfW - halfW * resistance, y: center.y },
    bottom: { x: center.x, y: center.y + halfH - halfH * resistance },
    left: { x: center.x - halfW + halfW * resistance, y: center.y },
  };

  // Check if mouse is inside the rectangle
  const isInsideRect = mouseX > vertices.topLeft.x && mouseX < vertices.topRight.x &&
                       mouseY > vertices.topLeft.y && mouseY < vertices.bottomLeft.y;

  // Calculate pressure for each edge (0 = no pressure, 1 = max pressure)
  // Pressure only applies when mouse is OUTSIDE but within margin
  function getEdgePressure(edge: 'top' | 'right' | 'bottom' | 'left'): number {
    if (isInsideRect) return 0; // Inside = no pressure, membrane released

    const { topLeft, topRight, bottomLeft } = vertices;

    switch (edge) {
      case 'top': {
        // Mouse is above the top edge
        if (mouseY < topLeft.y && mouseX > topLeft.x - margin && mouseX < topRight.x + margin) {
          const dist = topLeft.y - mouseY;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin); // Closer = more pressure
          }
        }
        return 0;
      }
      case 'bottom': {
        // Mouse is below the bottom edge
        if (mouseY > bottomLeft.y && mouseX > topLeft.x - margin && mouseX < topRight.x + margin) {
          const dist = mouseY - bottomLeft.y;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin);
          }
        }
        return 0;
      }
      case 'left': {
        // Mouse is to the left of the left edge
        if (mouseX < topLeft.x && mouseY > topLeft.y - margin && mouseY < bottomLeft.y + margin) {
          const dist = topLeft.x - mouseX;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin);
          }
        }
        return 0;
      }
      case 'right': {
        // Mouse is to the right of the right edge
        if (mouseX > topRight.x && mouseY > topLeft.y - margin && mouseY < bottomLeft.y + margin) {
          const dist = mouseX - topRight.x;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin);
          }
        }
        return 0;
      }
    }
  }

  // Get pressure for each edge
  const pressure = {
    top: getEdgePressure('top'),
    right: getEdgePressure('right'),
    bottom: getEdgePressure('bottom'),
    left: getEdgePressure('left'),
  };

  // Animated control points with membrane behavior
  const controlPoints = {
    top: useMembranePoint(edgeMidpoints.top, pushPoints.top, pressure.top),
    right: useMembranePoint(edgeMidpoints.right, pushPoints.right, pressure.right),
    bottom: useMembranePoint(edgeMidpoints.bottom, pushPoints.bottom, pressure.bottom),
    left: useMembranePoint(edgeMidpoints.left, pushPoints.left, pressure.left),
  };

  return (
    <TwoProvider width={500} height={500} type="canvas">
      {/* Main elastic rect with quadratic bezier curves */}
      <QuadraticBezierRect
        vertices={vertices}
        controlPoints={controlPoints}
        fill="rgba(60, 60, 60, 0.8)"
        stroke="rgba(40, 40, 40, 1)"
        linewidth={2}
      />

      {/* Debug: show control points */}
      <TwoCircle x={controlPoints.top.x} y={controlPoints.top.y} radius={4} fill="rgba(255, 100, 100, 0.6)" />
      <TwoCircle x={controlPoints.right.x} y={controlPoints.right.y} radius={4} fill="rgba(100, 255, 100, 0.6)" />
      <TwoCircle x={controlPoints.bottom.x} y={controlPoints.bottom.y} radius={4} fill="rgba(100, 100, 255, 0.6)" />
      <TwoCircle x={controlPoints.left.x} y={controlPoints.left.y} radius={4} fill="rgba(255, 255, 100, 0.6)" />

      {/* Corner markers */}
      <TwoCircle x={vertices.topLeft.x} y={vertices.topLeft.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
      <TwoCircle x={vertices.topRight.x} y={vertices.topRight.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
      <TwoCircle x={vertices.bottomRight.x} y={vertices.bottomRight.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
      <TwoCircle x={vertices.bottomLeft.x} y={vertices.bottomLeft.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
    </TwoProvider>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta<ElasticRectBendProps> = {
  title: 'Interactive/Elastic Rect Bend',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 50, max: 400, step: 10 },
      description: 'Width of the rectangle',
    },
    height: {
      control: { type: 'range', min: 50, max: 400, step: 10 },
      description: 'Height of the rectangle',
    },
    margin: {
      control: { type: 'range', min: 10, max: 150, step: 5 },
      description: 'Detection margin around edges',
    },
    resistance: {
      control: { type: 'range', min: 0.1, max: 0.8, step: 0.05 },
      description: 'How much the membrane resists entry (0-1)',
    },
  },
};

export default meta;

type ElasticRectBendStory = StoryObj<ElasticRectBendProps>;

export const Default: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 60,
    resistance: 0.4,
  },
};

export const HighResistance: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 80,
    resistance: 0.7,
  },
};

export const LowResistance: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 40,
    resistance: 0.2,
  },
};
