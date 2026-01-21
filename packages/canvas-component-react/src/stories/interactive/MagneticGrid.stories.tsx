import React, { useEffect, useRef } from 'react';
import { Meta, StoryObj } from "@storybook/react";

import { useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// MagneticGrid - Grid lines that bend around the mouse
// Like iron filings reacting to a magnet
// ============================================

interface MagneticGridProps {
  rows: number;
  cols: number;
  segments: number;      // How many segments per line (more = smoother curves)
  strength: number;      // How much lines deflect
  radius: number;        // Radius of influence around mouse
  falloff: number;       // How quickly influence fades (1 = linear, 2 = quadratic)
  noise: number;         // Random jitter amount
  noiseScale: number;    // Scale of noise variation (smaller = more fine-grained)
  lineWidth: number;
  color: string;
}

// Simple seeded noise function for consistent randomness per point
function noise2D(x: number, y: number, scale: number): number {
  const nx = x * scale;
  const ny = y * scale;
  // Use sine waves at different frequencies for pseudo-noise
  return (
    Math.sin(nx * 1.2 + ny * 0.7) * 0.3 +
    Math.sin(nx * 2.5 - ny * 1.8) * 0.25 +
    Math.sin(nx * 0.6 + ny * 2.3) * 0.25 +
    Math.sin(nx * 3.1 + ny * 0.4) * 0.2
  );
}

function MagneticGridDemo({
  rows,
  cols,
  segments,
  strength,
  radius,
  falloff,
  noise: noiseAmount,
  noiseScale,
  lineWidth,
  color,
}: MagneticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouseX, mouseY] = useMousePos();

  const width = 500;
  const height = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';

      const rowSpacing = height / (rows + 1);
      const colSpacing = width / (cols + 1);

      // Calculate deflection for a point based on mouse distance + noise
      const getDeflection = (px: number, py: number, time: number): { dx: number; dy: number } => {
        // Base noise that's always present (adds texture to lines)
        const baseNoiseX = noise2D(px, py, noiseScale) * noiseAmount;
        const baseNoiseY = noise2D(px + 100, py + 100, noiseScale) * noiseAmount;

        // Animated noise component
        const animNoiseX = noise2D(px + time * 0.02, py, noiseScale * 0.5) * noiseAmount * 0.5;
        const animNoiseY = noise2D(px, py + time * 0.02, noiseScale * 0.5) * noiseAmount * 0.5;

        const dx = px - mouseX;
        const dy = py - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > radius || dist < 1) {
          return {
            dx: baseNoiseX + animNoiseX,
            dy: baseNoiseY + animNoiseY
          };
        }

        // Normalized direction away from mouse
        const nx = dx / dist;
        const ny = dy / dist;

        // Falloff: closer = more deflection
        const influence = Math.pow(1 - dist / radius, falloff);
        const deflectAmount = strength * influence;

        // Add extra noise near the mouse for more chaos
        const mouseNoise = influence * noiseAmount * 0.8;
        const extraNoiseX = noise2D(px * 2 + time * 0.05, py * 2, noiseScale * 2) * mouseNoise;
        const extraNoiseY = noise2D(px * 2, py * 2 + time * 0.05, noiseScale * 2) * mouseNoise;

        return {
          dx: nx * deflectAmount + baseNoiseX + animNoiseX + extraNoiseX,
          dy: ny * deflectAmount + baseNoiseY + animNoiseY + extraNoiseY,
        };
      };

      const time = performance.now() * 0.001;

      // Draw horizontal lines (rows)
      for (let row = 1; row <= rows; row++) {
        const baseY = row * rowSpacing;

        ctx.beginPath();
        for (let seg = 0; seg <= segments; seg++) {
          const t = seg / segments;
          const baseX = t * width;

          const { dx, dy } = getDeflection(baseX, baseY, time);
          const x = baseX + dx;
          const y = baseY + dy;

          if (seg === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines (cols)
      for (let col = 1; col <= cols; col++) {
        const baseX = col * colSpacing;

        ctx.beginPath();
        for (let seg = 0; seg <= segments; seg++) {
          const t = seg / segments;
          const baseY = t * height;

          const { dx, dy } = getDeflection(baseX, baseY, time);
          const x = baseX + dx;
          const y = baseY + dy;

          if (seg === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [mouseX, mouseY, rows, cols, segments, strength, radius, falloff, noiseAmount, noiseScale, lineWidth, color, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ background: 'white' }}
    />
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta<MagneticGridProps> = {
  title: 'Interactive/Magnetic Grid',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    rows: {
      control: { type: 'range', min: 3, max: 30, step: 1 },
      description: 'Number of horizontal lines',
    },
    cols: {
      control: { type: 'range', min: 3, max: 30, step: 1 },
      description: 'Number of vertical lines',
    },
    segments: {
      control: { type: 'range', min: 50, max: 300, step: 10 },
      description: 'Segments per line (smoothness) - higher = smoother curves',
    },
    strength: {
      control: { type: 'range', min: 10, max: 150, step: 5 },
      description: 'Deflection strength',
    },
    radius: {
      control: { type: 'range', min: 50, max: 300, step: 10 },
      description: 'Radius of mouse influence',
    },
    falloff: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.1 },
      description: 'Falloff curve (1=linear, 2=quadratic)',
    },
    noise: {
      control: { type: 'range', min: 0, max: 30, step: 1 },
      description: 'Random jitter amount - adds organic texture',
    },
    noiseScale: {
      control: { type: 'range', min: 0.001, max: 0.1, step: 0.005 },
      description: 'Noise frequency (smaller = more fine-grained)',
    },
    lineWidth: {
      control: { type: 'range', min: 0.5, max: 4, step: 0.5 },
      description: 'Line thickness',
    },
    color: {
      control: 'color',
      description: 'Line color',
    },
  },
};

export default meta;

type MagneticGridStory = StoryObj<MagneticGridProps>;

export const Default: MagneticGridStory = {
  render: (args) => <MagneticGridDemo {...args} />,
  args: {
    rows: 15,
    cols: 15,
    segments: 200,
    strength: 60,
    radius: 150,
    falloff: 2,
    noise: 8,
    noiseScale: 0.02,
    lineWidth: 1,
    color: '#333333',
  },
};

export const Subtle: MagneticGridStory = {
  render: (args) => <MagneticGridDemo {...args} />,
  args: {
    rows: 20,
    cols: 20,
    segments: 180,
    strength: 30,
    radius: 100,
    falloff: 1.5,
    noise: 4,
    noiseScale: 0.015,
    lineWidth: 0.5,
    color: '#666666',
  },
};

export const Strong: MagneticGridStory = {
  render: (args) => <MagneticGridDemo {...args} />,
  args: {
    rows: 12,
    cols: 12,
    segments: 220,
    strength: 100,
    radius: 200,
    falloff: 1.5,
    noise: 12,
    noiseScale: 0.025,
    lineWidth: 1.5,
    color: '#222222',
  },
};

export const Sparse: MagneticGridStory = {
  render: (args) => <MagneticGridDemo {...args} />,
  args: {
    rows: 8,
    cols: 8,
    segments: 250,
    strength: 80,
    radius: 180,
    falloff: 2.5,
    noise: 15,
    noiseScale: 0.03,
    lineWidth: 2,
    color: '#444444',
  },
};

export const Noisy: MagneticGridStory = {
  render: (args) => <MagneticGridDemo {...args} />,
  args: {
    rows: 15,
    cols: 15,
    segments: 280,
    strength: 50,
    radius: 180,
    falloff: 1.8,
    noise: 25,
    noiseScale: 0.04,
    lineWidth: 1,
    color: '#333333',
  },
};
