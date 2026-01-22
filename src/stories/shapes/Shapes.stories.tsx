import React from 'react';
import { ComponentMeta, StoryObj } from "@storybook/react";

import {
  TwoProvider,
  TwoCircle,
  TwoEllipse,
  TwoRect,
  TwoLine,
  TwoPolygon,
  TwoPath,
} from '../../two-js-react';

// ============================================
// Basic Shapes Showcase
// ============================================

function BasicShapesDemo() {
  return (
    <TwoProvider width={800} height={500}>
      {/* Circles */}
      <TwoCircle x={80} y={80} radius={50} fill="#e74c3c" />
      <TwoCircle x={200} y={80} radius={40} fill="#3498db" stroke="#2980b9" linewidth={3} />
      <TwoCircle x={320} y={80} radius={30} stroke="#27ae60" linewidth={4} />

      {/* Rectangles */}
      <TwoRect x={80} y={200} width={100} height={60} fill="#9b59b6" />
      <TwoRect x={200} y={200} width={80} height={80} fill="#f39c12" stroke="#e67e22" linewidth={3} />
      <TwoRect x={320} y={200} width={120} height={40} stroke="#1abc9c" linewidth={3} />

      {/* Ellipses */}
      <TwoEllipse x={500} y={80} width={120} height={60} fill="#e91e63" />
      <TwoEllipse x={650} y={80} width={80} height={100} fill="#00bcd4" opacity={0.7} />

      {/* Lines */}
      <TwoLine x1={450} y1={160} x2={550} y2={240} stroke="#333" linewidth={2} />
      <TwoLine x1={550} y1={160} x2={650} y2={240} stroke="#e74c3c" linewidth={4} />
      <TwoLine x1={650} y1={160} x2={750} y2={240} stroke="#3498db" linewidth={6} />

      {/* Regular Polygons */}
      <TwoPolygon x={80} y={380} radius={50} sides={3} fill="#ff5722" />
      <TwoPolygon x={200} y={380} radius={45} sides={5} fill="#4caf50" />
      <TwoPolygon x={320} y={380} radius={40} sides={6} fill="#2196f3" />
      <TwoPolygon x={440} y={380} radius={35} sides={8} fill="#9c27b0" />

      {/* Custom Path (Star) */}
      <TwoPath
        vertices={[
          { x: 600, y: 330 },
          { x: 620, y: 370 },
          { x: 665, y: 370 },
          { x: 630, y: 400 },
          { x: 645, y: 445 },
          { x: 600, y: 415 },
          { x: 555, y: 445 },
          { x: 570, y: 400 },
          { x: 535, y: 370 },
          { x: 580, y: 370 },
        ]}
        fill="#ffc107"
        stroke="#ff9800"
        linewidth={2}
      />
    </TwoProvider>
  );
}

// ============================================
// Animated Shapes
// ============================================

function AnimatedShapesDemo() {
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    let rafId: number;
    const animate = () => {
      setTime(t => t + 0.02);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const sin = Math.sin(time);
  const cos = Math.cos(time);

  return (
    <TwoProvider width={600} height={400}>
      {/* Bouncing circle */}
      <TwoCircle
        x={100 + sin * 50}
        y={200 + cos * 80}
        radius={30 + sin * 10}
        fill={`hsl(${(time * 50) % 360}, 70%, 50%)`}
      />

      {/* Rotating rectangle */}
      <TwoRect
        x={300}
        y={200}
        width={80}
        height={80}
        fill="#3498db"
        rotation={time}
      />

      {/* Pulsing polygon */}
      <TwoPolygon
        x={500}
        y={200}
        radius={40 + sin * 20}
        sides={6}
        fill="#e74c3c"
        rotation={-time * 0.5}
      />

      {/* Orbiting circles */}
      {[0, 1, 2, 3, 4, 5].map(i => {
        const angle = time + (i * Math.PI * 2) / 6;
        return (
          <TwoCircle
            key={i}
            x={300 + Math.cos(angle) * 120}
            y={200 + Math.sin(angle) * 120}
            radius={15}
            fill={`hsl(${i * 60}, 70%, 50%)`}
          />
        );
      })}
    </TwoProvider>
  );
}

// ============================================
// Layered Composition
// ============================================

function LayeredCompositionDemo() {
  return (
    <TwoProvider width={500} height={400}>
      {/* Background layer */}
      <TwoRect x={250} y={200} width={400} height={300} fill="#ecf0f1" />

      {/* Middle layer - large shapes */}
      <TwoCircle x={150} y={150} radius={80} fill="#3498db" opacity={0.5} />
      <TwoCircle x={350} y={150} radius={80} fill="#e74c3c" opacity={0.5} />
      <TwoCircle x={250} y={280} radius={80} fill="#27ae60" opacity={0.5} />

      {/* Overlapping creates color mixing effect */}
      <TwoRect x={250} y={200} width={150} height={150} fill="#f39c12" opacity={0.4} />

      {/* Foreground - small accent shapes */}
      <TwoCircle x={250} y={200} radius={30} fill="white" />
      <TwoCircle x={250} y={200} radius={20} fill="#333" />
    </TwoProvider>
  );
}

// ============================================
// Grid Pattern
// ============================================

function GridPatternDemo() {
  const cols = 10;
  const rows = 8;
  const cellSize = 50;

  return (
    <TwoProvider width={cols * cellSize + 50} height={rows * cellSize + 50}>
      {Array.from({ length: cols * rows }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * cellSize + 50;
        const y = row * cellSize + 50;
        const hue = ((col + row) * 20) % 360;

        return (
          <TwoRect
            key={i}
            x={x}
            y={y}
            width={cellSize - 5}
            height={cellSize - 5}
            fill={`hsl(${hue}, 60%, 50%)`}
          />
        );
      })}
    </TwoProvider>
  );
}

// ============================================
// Stories
// ============================================

export default {
  title: 'Shapes/Basic',
} as ComponentMeta<any>;

export const AllShapes: StoryObj = {
  render: () => <BasicShapesDemo />,
};

export const Animated: StoryObj = {
  render: () => <AnimatedShapesDemo />,
};

export const LayeredComposition: StoryObj = {
  render: () => <LayeredCompositionDemo />,
};

export const GridPattern: StoryObj = {
  render: () => <GridPatternDemo />,
};
