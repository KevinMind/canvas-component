import React, { useEffect, useRef } from 'react';
import { Meta, StoryObj } from "@storybook/react";

import { useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// MagnetDust - Iron filing-like lines following mouse
// Randomly angled lines with varying colors and thickness
// Faster movement = larger pieces
// ============================================

interface DustParticle {
  x: number;
  y: number;
  id: number;
  spawnTime: number;
  decayStartTime: number | null; // null = not decaying yet (mouse still near)
  angle: number;         // Random angle in radians
  length: number;        // Line length (based on velocity)
  thickness: number;     // Line boldness
  color: number[];       // RGB values [r, g, b]
  // Drift for organic dispersal
  driftX: number;
  driftY: number;
}

interface MagnetDustProps {
  maxLength: number;       // Maximum line length
  minLength: number;       // Minimum line length
  duration: number;        // How long particles take to fully fade (ms)
  decay: number;           // Decay curve exponent
  sampleRate: number;      // Minimum ms between creating new particles
  density: number;         // Multiplier for how many lines spawn (scaled by velocity)
  thicknessRange: [number, number]; // Min/max line thickness
  velocityScale: number;   // How much velocity affects size (0-1)
  sizeVariance: number;    // Randomness in sizes (0 = uniform, 1 = full range)
  spread: number;          // How much lines spread from cursor position
  drift: number;           // How much particles drift as they fade
}

// Color palette for the dust particles (RGB values for direct canvas use)
const DUST_COLORS = [
  [60, 60, 60],
  [80, 80, 80],
  [40, 40, 40],
  [100, 90, 80],
  [70, 75, 85],
  [50, 45, 40],
  [85, 85, 90],
  [75, 70, 65],
];

function MagnetDustDemo({
  maxLength,
  minLength,
  duration,
  decay,
  sampleRate,
  density,
  thicknessRange,
  velocityScale,
  sizeVariance,
  spread,
  drift,
}: MagnetDustProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const prevSpawnPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastSampleTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const nextIdRef = useRef(0);

  const [x, y] = useMousePos();

  // Track mouse position and calculate velocity
  useEffect(() => {
    if (x === 0 && y === 0) return;

    if (lastPosRef.current) {
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      velocityRef.current = velocityRef.current * 0.7 + distance * 0.3;
    }

    lastPosRef.current = { x, y };
  }, [x, y]);

  // Animation loop - direct canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      const now = performance.now();

      // Decay velocity
      velocityRef.current *= 0.95;

      const mouseX = lastPosRef.current?.x ?? 0;
      const mouseY = lastPosRef.current?.y ?? 0;
      const decayRadius = spread * 2;

      // Spawn particles
      if (lastPosRef.current && now - lastSampleTimeRef.current >= sampleRate) {
        lastSampleTimeRef.current = now;

        const velocityFactor = Math.min(1, velocityRef.current / 20);
        const baseLength = minLength + (maxLength - minLength) * velocityFactor * velocityScale;

        const baseSwarm = 2;
        const velocityBonus = Math.min(10, Math.round(Math.sqrt(velocityRef.current) * density));
        const linesPerSample = baseSwarm + velocityBonus;

        const prevX = prevSpawnPosRef.current?.x ?? lastPosRef.current.x;
        const prevY = prevSpawnPosRef.current?.y ?? lastPosRef.current.y;
        const dx = lastPosRef.current.x - prevX;
        const dy = lastPosRef.current.y - prevY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const stepSize = 8;
        const steps = Math.max(1, Math.ceil(dist / stepSize));

        for (let step = 0; step < steps; step++) {
          const t = steps === 1 ? 1 : step / (steps - 1);
          const interpX = prevX + dx * t;
          const interpY = prevY + dy * t;

          for (let i = 0; i < linesPerSample; i++) {
            const randomLength = minLength + Math.random() * (maxLength - minLength);
            const length = baseLength * (1 - sizeVariance) + randomLength * sizeVariance;

            const spreadX = (Math.random() - 0.5) * spread;
            const spreadY = (Math.random() - 0.5) * spread;

            particlesRef.current.push({
              x: interpX + spreadX,
              y: interpY + spreadY,
              id: nextIdRef.current++,
              spawnTime: now,
              decayStartTime: null,
              angle: Math.random() * Math.PI * 2,
              length,
              thickness: thicknessRange[0] + Math.random() * (thicknessRange[1] - thicknessRange[0]),
              color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
              driftX: (Math.random() - 0.5) * drift,
              driftY: (Math.random() - 0.5) * drift,
            });
          }
        }

        prevSpawnPosRef.current = { x: lastPosRef.current.x, y: lastPosRef.current.y };
      }

      // Update particles and render
      ctx.clearRect(0, 0, 500, 500);

      const particles = particlesRef.current;
      let writeIndex = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Check if should start decaying
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (p.decayStartTime === null && dist > decayRadius) {
          p.decayStartTime = now;
        }

        // Calculate opacity and check if dead
        let opacity = 0.8;
        let driftX = 0;
        let driftY = 0;

        if (p.decayStartTime !== null) {
          const decayAge = now - p.decayStartTime;
          if (decayAge >= duration) continue; // Dead, skip

          const agePerc = decayAge / duration;
          const linearPerc = 1 - agePerc;
          const curvedPerc = Math.pow(linearPerc, decay);
          opacity = curvedPerc * 0.8;

          driftX = p.driftX * agePerc;
          driftY = p.driftY * agePerc;
        }

        if (opacity < 0.01) continue;

        // Keep particle (compact array)
        particles[writeIndex++] = p;

        // Draw line
        const halfLen = p.length / 2;
        const cos = Math.cos(p.angle);
        const sin = Math.sin(p.angle);

        const centerX = p.x + driftX;
        const centerY = p.y + driftY;

        const x1 = centerX - cos * halfLen;
        const y1 = centerY - sin * halfLen;
        const x2 = centerX + cos * halfLen;
        const y2 = centerY + sin * halfLen;

        ctx.strokeStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${opacity})`;
        ctx.lineWidth = p.thickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Trim dead particles (no hard cap - canvas can handle it)
      particles.length = writeIndex;

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [duration, maxLength, minLength, sampleRate, density, thicknessRange, velocityScale, sizeVariance, spread, drift]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      style={{ background: 'white' }}
    />
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta<MagnetDustProps> = {
  title: 'Interactive/Magnet Dust',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    maxLength: {
      control: { type: 'range', min: 10, max: 100, step: 5 },
      description: 'Maximum line length',
    },
    minLength: {
      control: { type: 'range', min: 2, max: 30, step: 1 },
      description: 'Minimum line length',
    },
    duration: {
      control: { type: 'range', min: 500, max: 5000, step: 100 },
      description: 'How long particles take to fully fade (ms)',
    },
    decay: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
      description: 'Decay curve (1 = linear, <1 = slow then fast, >1 = fast then slow)',
    },
    sampleRate: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'Minimum ms between spawning batches (0 = every frame)',
    },
    density: {
      control: { type: 'range', min: 0.1, max: 5, step: 0.1 },
      description: 'Particle density multiplier (scales with movement speed)',
    },
    thicknessRange: {
      control: { type: 'object' },
      description: 'Min/max line thickness [min, max]',
    },
    velocityScale: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'How much velocity affects line size (0 = ignore velocity, 1 = velocity driven)',
    },
    sizeVariance: {
      control: { type: 'range', min: 0, max: 1, step: 0.1 },
      description: 'Randomness in sizes (0 = uniform based on velocity, 1 = fully random)',
    },
    spread: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'How much lines spread from cursor position',
    },
    drift: {
      control: { type: 'range', min: 0, max: 100, step: 5 },
      description: 'How much particles drift as they fade',
    },
  },
};

export default meta;

type MagnetDustStory = StoryObj<MagnetDustProps>;

export const Default: MagnetDustStory = {
  render: (args) => <MagnetDustDemo {...args} />,
  args: {
    maxLength: 20,
    minLength: 4,
    duration: 3500,
    decay: 1.8,
    sampleRate: 16,
    density: 1.0,
    thicknessRange: [0.5, 2],
    velocityScale: 0.7,
    sizeVariance: 0.6,
    spread: 12,
    drift: 8,
  },
};

export const Fine: MagnetDustStory = {
  render: (args) => <MagnetDustDemo {...args} />,
  args: {
    maxLength: 12,
    minLength: 3,
    duration: 3000,
    decay: 1.5,
    sampleRate: 16,
    density: 1.5,
    thicknessRange: [0.3, 1],
    velocityScale: 0.5,
    sizeVariance: 0.7,
    spread: 8,
    drift: 5,
  },
};

export const Bold: MagnetDustStory = {
  render: (args) => <MagnetDustDemo {...args} />,
  args: {
    maxLength: 30,
    minLength: 8,
    duration: 4000,
    decay: 2,
    sampleRate: 32,
    density: 0.8,
    thicknessRange: [1, 4],
    velocityScale: 0.8,
    sizeVariance: 0.5,
    spread: 20,
    drift: 15,
  },
};

export const Wispy: MagnetDustStory = {
  render: (args) => <MagnetDustDemo {...args} />,
  args: {
    maxLength: 25,
    minLength: 5,
    duration: 5000,
    decay: 2.5,
    sampleRate: 20,
    density: 0.6,
    thicknessRange: [0.2, 1.5],
    velocityScale: 0.9,
    sizeVariance: 0.8,
    spread: 25,
    drift: 30,
  },
};
