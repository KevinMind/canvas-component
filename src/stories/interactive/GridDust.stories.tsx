import React, { useEffect, useRef, useMemo } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import bezierEasing from "bezier-easing";

import { TwoProvider, TwoLine } from '../../two-js-react';
import { useAnimationFrameState, useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// GridDust - DrawGrid with MagnetDust overlay
// ============================================

// Original bezier easing curve for grid
const drawEasing = bezierEasing(0.64, 0.13, 0.64, 0.98);

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// ============================================
// Grid Row/Col Components
// ============================================

interface RowProps {
  width: number;
  y: number;
  reverse?: boolean;
  maxDuration: number;
}

function Row({ width, y, reverse = false, maxDuration }: RowProps) {
  const duration = useMemo(() => randomNumber(maxDuration / Math.E, maxDuration), [maxDuration]);

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

interface ColProps {
  height: number;
  x: number;
  reverse?: boolean;
  maxDuration: number;
}

function Col({ height, x, reverse = false, maxDuration }: ColProps) {
  const duration = useMemo(() => randomNumber(maxDuration / 2, maxDuration), [maxDuration]);

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
// MagnetDust Particle System (direct canvas)
// ============================================

interface DustParticle {
  x: number;
  y: number;
  spawnTime: number;
  decayStartTime: number | null;
  angle: number;
  length: number;
  thickness: number;
  color: number[];
  driftX: number;
  driftY: number;
}

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

interface MagnetDustOverlayProps {
  maxLength: number;
  minLength: number;
  duration: number;
  decay: number;
  sampleRate: number;
  density: number;
  thicknessRange: [number, number];
  velocityScale: number;
  sizeVariance: number;
  spread: number;
  drift: number;
}

function MagnetDustOverlay({
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
}: MagnetDustOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const prevSpawnPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastSampleTimeRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const nextIdRef = useRef(0);

  const [x, y] = useMousePos();

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      const now = performance.now();

      velocityRef.current *= 0.95;

      const mouseX = lastPosRef.current?.x ?? 0;
      const mouseY = lastPosRef.current?.y ?? 0;
      const decayRadius = spread * 2;

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

      ctx.clearRect(0, 0, 500, 500);

      const particles = particlesRef.current;
      let writeIndex = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (p.decayStartTime === null && dist > decayRadius) {
          p.decayStartTime = now;
        }

        let opacity = 0.8;
        let driftX = 0;
        let driftY = 0;

        if (p.decayStartTime !== null) {
          const decayAge = now - p.decayStartTime;
          if (decayAge >= duration) continue;

          const agePerc = decayAge / duration;
          const linearPerc = 1 - agePerc;
          const curvedPerc = Math.pow(linearPerc, decay);
          opacity = curvedPerc * 0.8;

          driftX = p.driftX * agePerc;
          driftY = p.driftY * agePerc;
        }

        if (opacity < 0.01) continue;

        particles[writeIndex++] = p;

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
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ============================================
// Combined GridDust Component
// ============================================

interface GridDustProps {
  rows: number;
  cols: number;
  // Dust settings
  maxLength: number;
  minLength: number;
  duration: number;
  decay: number;
  sampleRate: number;
  density: number;
  thicknessRange: [number, number];
  velocityScale: number;
  sizeVariance: number;
  spread: number;
  drift: number;
}

function GridDustDemo({
  rows,
  cols,
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
}: GridDustProps) {
  const width = 500;
  const height = 500;

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
    <div style={{ position: 'relative', width, height }}>
      <TwoProvider width={width} height={height} type="canvas">
        {Array.from({ length: numRows }, (_, idx) => (
          <Row
            key={`row-${idx}`}
            y={idx * rowSpacing}
            width={width}
            maxDuration={maxDuration}
            reverse={idx % 2 === 0}
          />
        ))}
        {Array.from({ length: numCols }, (_, idx) => (
          <Col
            key={`col-${idx}`}
            x={idx * colSpacing}
            height={height}
            maxDuration={maxDuration}
            reverse={idx % 2 !== 0}
          />
        ))}
      </TwoProvider>
      <MagnetDustOverlay
        maxLength={maxLength}
        minLength={minLength}
        duration={duration}
        decay={decay}
        sampleRate={sampleRate}
        density={density}
        thicknessRange={thicknessRange}
        velocityScale={velocityScale}
        sizeVariance={sizeVariance}
        spread={spread}
        drift={drift}
      />
    </div>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta<GridDustProps> = {
  title: 'Interactive/Grid Dust',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    rows: { control: { type: 'range', min: 5, max: 30, step: 1 } },
    cols: { control: { type: 'range', min: 0, max: 30, step: 1 } },
    maxLength: { control: { type: 'range', min: 10, max: 100, step: 5 } },
    minLength: { control: { type: 'range', min: 2, max: 30, step: 1 } },
    duration: { control: { type: 'range', min: 500, max: 5000, step: 100 } },
    decay: { control: { type: 'range', min: 0.1, max: 3, step: 0.1 } },
    sampleRate: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    density: { control: { type: 'range', min: 0.1, max: 5, step: 0.1 } },
    thicknessRange: { control: { type: 'object' } },
    velocityScale: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    sizeVariance: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
    spread: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    drift: { control: { type: 'range', min: 0, max: 100, step: 5 } },
  },
};

export default meta;

type GridDustStory = StoryObj<GridDustProps>;

export const Default: GridDustStory = {
  render: (args) => <GridDustDemo {...args} />,
  args: {
    rows: 12,
    cols: 0,
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

export const Dense: GridDustStory = {
  render: (args) => <GridDustDemo {...args} />,
  args: {
    rows: 20,
    cols: 0,
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

export const Sparse: GridDustStory = {
  render: (args) => <GridDustDemo {...args} />,
  args: {
    rows: 8,
    cols: 0,
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
