import React, { useEffect, useRef } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import { useSpring } from 'use-spring';
import Two from 'two.js';

import { TwoProvider, TwoCircle, TwoRect, TwoLine, useTwo } from '../../two-js-react';
import { useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// ElasticRectBend - Rectangle with membrane-like edges
// Edges resist entry (bulge inward) when mouse approaches from outside
// Edges expand outward when mouse approaches from inside
// Tension releases and wobbles back when mouse crosses the edge
// ============================================

interface Position {
  x: number;
  y: number;
}

interface ElasticRectBendProps {
  center: Position;
  width: number;
  height: number;
  margin?: number;      // Detection zone outside the rectangle
  innerMargin?: number; // Buffer zone inside - tension releases when mouse passes this
  resistance?: number;  // How much the membrane bends (0-1)
  stiffness?: number;   // Spring tension - higher = snappier return
  damping?: number;     // How quickly wobble dies - lower = more bouncy
  mass?: number;        // Inertia - higher = more wobble/momentum
  showDebug?: boolean;  // Show detection zones and quadrants
}

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

// Spring hook for membrane control point
// Pressure > 0: bulge INWARD (mouse outside, approaching edge)
// Pressure < 0: bulge OUTWARD (mouse inside, approaching edge)
// Pressure = 0: return to rest
function useMembranePoint(
  restPoint: Position,
  inwardPoint: Position,  // Where to push when resisting entry (toward center)
  outwardPoint: Position, // Where to push when resisting exit (away from center)
  pressure: number,       // -1 to 1: negative = outward, positive = inward
  springConfig: SpringConfig,
): Position {
  const config = {
    stiffness: springConfig.stiffness,
    damping: springConfig.damping,
    mass: springConfig.mass,
    decimals: 2,
    teleport: false,
    initialSpeed: 0
  };

  // Interpolate based on signed pressure
  let targetX: number;
  let targetY: number;

  if (pressure > 0) {
    // Positive pressure = push inward
    targetX = restPoint.x + (inwardPoint.x - restPoint.x) * pressure;
    targetY = restPoint.y + (inwardPoint.y - restPoint.y) * pressure;
  } else if (pressure < 0) {
    // Negative pressure = push outward (use absolute value)
    const absPressure = Math.abs(pressure);
    targetX = restPoint.x + (outwardPoint.x - restPoint.x) * absPressure;
    targetY = restPoint.y + (outwardPoint.y - restPoint.y) * absPressure;
  } else {
    // No pressure = rest position
    targetX = restPoint.x;
    targetY = restPoint.y;
  }

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

function ElasticRectBendDemo({
  center,
  width,
  height,
  margin = 50,
  innerMargin = 70,
  resistance = 0.4,
  stiffness = 180,
  damping = 12,
  mass = 2,
  showDebug = false,
}: ElasticRectBendProps) {
  const [mouseX, mouseY] = useMousePos();

  // Spring configuration for membrane behavior
  const springConfig: SpringConfig = { stiffness, damping, mass };

  // Calculate corner positions
  const halfW = width / 2;
  const halfH = height / 2;

  // Outer rectangle (visible boundary)
  const vertices = {
    topLeft: { x: center.x - halfW, y: center.y - halfH },
    topRight: { x: center.x + halfW, y: center.y - halfH },
    bottomRight: { x: center.x + halfW, y: center.y + halfH },
    bottomLeft: { x: center.x - halfW, y: center.y + halfH },
  };

  // Inner rectangle (tension release zone - smaller)
  const innerVertices = {
    topLeft: { x: center.x - halfW + innerMargin, y: center.y - halfH + innerMargin },
    topRight: { x: center.x + halfW - innerMargin, y: center.y - halfH + innerMargin },
    bottomRight: { x: center.x + halfW - innerMargin, y: center.y + halfH - innerMargin },
    bottomLeft: { x: center.x - halfW + innerMargin, y: center.y + halfH - innerMargin },
  };

  // Outer detection zone (larger than visible rect)
  const outerVertices = {
    topLeft: { x: center.x - halfW - margin, y: center.y - halfH - margin },
    topRight: { x: center.x + halfW + margin, y: center.y - halfH - margin },
    bottomRight: { x: center.x + halfW + margin, y: center.y + halfH + margin },
    bottomLeft: { x: center.x - halfW - margin, y: center.y + halfH + margin },
  };

  // Edge midpoints (rest positions)
  const edgeMidpoints = {
    top: { x: center.x, y: center.y - halfH },
    right: { x: center.x + halfW, y: center.y },
    bottom: { x: center.x, y: center.y + halfH },
    left: { x: center.x - halfW, y: center.y },
  };

  // Inward push points (where edges bend toward when mouse is outside - toward center)
  const inwardPoints = {
    top: { x: center.x, y: center.y - halfH + halfH * resistance },
    right: { x: center.x + halfW - halfW * resistance, y: center.y },
    bottom: { x: center.x, y: center.y + halfH - halfH * resistance },
    left: { x: center.x - halfW + halfW * resistance, y: center.y },
  };

  // Outward push points (where edges bend toward when mouse is inside - away from center)
  const outwardPoints = {
    top: { x: center.x, y: center.y - halfH - halfH * resistance },
    right: { x: center.x + halfW + halfW * resistance, y: center.y },
    bottom: { x: center.x, y: center.y + halfH + halfH * resistance },
    left: { x: center.x - halfW - halfW * resistance, y: center.y },
  };

  // Calculate signed pressure for each edge
  // Positive = mouse outside outer edge, approaching (push inward)
  // Negative = mouse between outer and inner edge (push outward)
  // Zero = mouse inside inner rectangle (tension released) or far away
  function getEdgePressure(edge: 'top' | 'right' | 'bottom' | 'left'): number {
    const outer = vertices;
    const inner = innerVertices;

    // Check if mouse is fully inside the inner rectangle (tension released)
    const insideInner = mouseX > inner.topLeft.x && mouseX < inner.topRight.x &&
                        mouseY > inner.topLeft.y && mouseY < inner.bottomLeft.y;
    if (insideInner) return 0;

    // Check if mouse is within the horizontal/vertical bounds for this edge
    const inHorizontalBounds = mouseX > outer.topLeft.x && mouseX < outer.topRight.x;
    const inVerticalBounds = mouseY > outer.topLeft.y && mouseY < outer.bottomLeft.y;

    switch (edge) {
      case 'top': {
        if (!inHorizontalBounds) return 0;

        // Mouse is above the outer top edge (outside) - push inward
        if (mouseY < outer.topLeft.y) {
          const dist = outer.topLeft.y - mouseY;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin); // Positive = inward pressure
          }
        }
        // Mouse is between outer and inner top edge (buffer zone) - push outward
        else if (mouseY >= outer.topLeft.y && mouseY < inner.topLeft.y) {
          const bufferSize = inner.topLeft.y - outer.topLeft.y;
          const dist = mouseY - outer.topLeft.y;
          return -(1 - (dist / bufferSize)); // Negative = outward pressure
        }
        return 0;
      }
      case 'bottom': {
        if (!inHorizontalBounds) return 0;

        // Mouse is below the outer bottom edge (outside) - push inward
        if (mouseY > outer.bottomLeft.y) {
          const dist = mouseY - outer.bottomLeft.y;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin); // Positive = inward pressure
          }
        }
        // Mouse is between outer and inner bottom edge (buffer zone) - push outward
        else if (mouseY <= outer.bottomLeft.y && mouseY > inner.bottomLeft.y) {
          const bufferSize = outer.bottomLeft.y - inner.bottomLeft.y;
          const dist = outer.bottomLeft.y - mouseY;
          return -(1 - (dist / bufferSize)); // Negative = outward pressure
        }
        return 0;
      }
      case 'left': {
        if (!inVerticalBounds) return 0;

        // Mouse is to the left of outer left edge (outside) - push inward
        if (mouseX < outer.topLeft.x) {
          const dist = outer.topLeft.x - mouseX;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin); // Positive = inward pressure
          }
        }
        // Mouse is between outer and inner left edge (buffer zone) - push outward
        else if (mouseX >= outer.topLeft.x && mouseX < inner.topLeft.x) {
          const bufferSize = inner.topLeft.x - outer.topLeft.x;
          const dist = mouseX - outer.topLeft.x;
          return -(1 - (dist / bufferSize)); // Negative = outward pressure
        }
        return 0;
      }
      case 'right': {
        if (!inVerticalBounds) return 0;

        // Mouse is to the right of outer right edge (outside) - push inward
        if (mouseX > outer.topRight.x) {
          const dist = mouseX - outer.topRight.x;
          if (dist > 0 && dist < margin) {
            return 1 - (dist / margin); // Positive = inward pressure
          }
        }
        // Mouse is between outer and inner right edge (buffer zone) - push outward
        else if (mouseX <= outer.topRight.x && mouseX > inner.topRight.x) {
          const bufferSize = outer.topRight.x - inner.topRight.x;
          const dist = outer.topRight.x - mouseX;
          return -(1 - (dist / bufferSize)); // Negative = outward pressure
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
    top: useMembranePoint(edgeMidpoints.top, inwardPoints.top, outwardPoints.top, pressure.top, springConfig),
    right: useMembranePoint(edgeMidpoints.right, inwardPoints.right, outwardPoints.right, pressure.right, springConfig),
    bottom: useMembranePoint(edgeMidpoints.bottom, inwardPoints.bottom, outwardPoints.bottom, pressure.bottom, springConfig),
    left: useMembranePoint(edgeMidpoints.left, inwardPoints.left, outwardPoints.left, pressure.left, springConfig),
  };

  // Calculate inner rectangle dimensions for TwoRect (which uses center + width/height)
  const innerWidth = width - innerMargin * 2;
  const innerHeight = height - innerMargin * 2;
  const outerWidth = width + margin * 2;
  const outerHeight = height + margin * 2;

  return (
    <TwoProvider width={500} height={500} type="canvas">
      {/* Debug: Outer detection zone (where inward pressure starts) */}
      {showDebug && (
        <TwoRect
          x={center.x}
          y={center.y}
          width={outerWidth}
          height={outerHeight}
          fill="transparent"
          stroke="rgba(255, 100, 100, 0.5)"
          linewidth={2}
        />
      )}

      {/* Debug: Inner release zone (where tension releases) */}
      {showDebug && innerWidth > 0 && innerHeight > 0 && (
        <TwoRect
          x={center.x}
          y={center.y}
          width={innerWidth}
          height={innerHeight}
          fill="rgba(100, 255, 100, 0.1)"
          stroke="rgba(100, 255, 100, 0.5)"
          linewidth={2}
        />
      )}

      {/* Debug: Quadrant dividers */}
      {showDebug && (
        <>
          {/* Vertical center line */}
          <TwoLine
            x1={center.x}
            y1={outerVertices.topLeft.y}
            x2={center.x}
            y2={outerVertices.bottomLeft.y}
            stroke="rgba(255, 255, 255, 0.2)"
            linewidth={1}
          />
          {/* Horizontal center line */}
          <TwoLine
            x1={outerVertices.topLeft.x}
            y1={center.y}
            x2={outerVertices.topRight.x}
            y2={center.y}
            stroke="rgba(255, 255, 255, 0.2)"
            linewidth={1}
          />
        </>
      )}

      {/* Main elastic rect with quadratic bezier curves */}
      <QuadraticBezierRect
        vertices={vertices}
        controlPoints={controlPoints}
        fill="rgba(60, 60, 60, 0.8)"
        stroke="rgba(40, 40, 40, 1)"
        linewidth={2}
      />

      {/* Debug: show control points */}
      {showDebug && (
        <>
          <TwoCircle x={controlPoints.top.x} y={controlPoints.top.y} radius={4} fill="rgba(255, 100, 100, 0.8)" />
          <TwoCircle x={controlPoints.right.x} y={controlPoints.right.y} radius={4} fill="rgba(100, 255, 100, 0.8)" />
          <TwoCircle x={controlPoints.bottom.x} y={controlPoints.bottom.y} radius={4} fill="rgba(100, 100, 255, 0.8)" />
          <TwoCircle x={controlPoints.left.x} y={controlPoints.left.y} radius={4} fill="rgba(255, 255, 100, 0.8)" />
        </>
      )}

      {/* Debug: Corner markers */}
      {showDebug && (
        <>
          <TwoCircle x={vertices.topLeft.x} y={vertices.topLeft.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
          <TwoCircle x={vertices.topRight.x} y={vertices.topRight.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
          <TwoCircle x={vertices.bottomRight.x} y={vertices.bottomRight.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
          <TwoCircle x={vertices.bottomLeft.x} y={vertices.bottomLeft.y} radius={3} fill="rgba(255, 255, 255, 0.5)" />
        </>
      )}
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
      description: 'Detection zone outside the rectangle',
    },
    innerMargin: {
      control: { type: 'range', min: 10, max: 95, step: 5 },
      description: 'Buffer zone inside - larger = smaller inner release zone',
    },
    resistance: {
      control: { type: 'range', min: 0.1, max: 0.8, step: 0.05 },
      description: 'How much the membrane bends (0-1)',
    },
    stiffness: {
      control: { type: 'range', min: 20, max: 500, step: 10 },
      description: 'Spring tension - higher = snappier return to rest',
    },
    damping: {
      control: { type: 'range', min: 1, max: 40, step: 1 },
      description: 'Wobble decay - lower = more bouncy, higher = less oscillation',
    },
    mass: {
      control: { type: 'range', min: 0.5, max: 10, step: 0.5 },
      description: 'Inertia/momentum - higher = more wobble and overshoot',
    },
    showDebug: {
      control: 'boolean',
      description: 'Show detection zones: red = outer (inward pressure), green = inner (release zone)',
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
    innerMargin: 70,
    resistance: 0.4,
    stiffness: 180,
    damping: 12,
    mass: 2,
    showDebug: false,
  },
};

export const Bouncy: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 70,
    innerMargin: 80,
    resistance: 0.5,
    stiffness: 200,
    damping: 6,   // Low damping = lots of bounce
    mass: 3,      // Higher mass = more wobble
  },
};

export const Snappy: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 50,
    innerMargin: 60,
    resistance: 0.3,
    stiffness: 400, // High stiffness = fast return
    damping: 25,    // Higher damping = less wobble
    mass: 1,        // Low mass = responsive
  },
};

export const Sluggish: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 80,
    innerMargin: 85,
    resistance: 0.6,
    stiffness: 60,  // Low stiffness = slow return
    damping: 8,     // Medium damping
    mass: 5,        // High mass = heavy, lots of momentum
  },
};

export const DebugView: ElasticRectBendStory = {
  render: (args) => <ElasticRectBendDemo {...args} />,
  args: {
    center: { x: 250, y: 250 },
    width: 200,
    height: 200,
    margin: 60,
    innerMargin: 70,
    resistance: 0.4,
    stiffness: 180,
    damping: 12,
    mass: 2,
    showDebug: true, // Debug visualization enabled
  },
};
