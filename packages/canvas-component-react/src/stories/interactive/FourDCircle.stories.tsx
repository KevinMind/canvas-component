import React, { useState, useEffect, useRef } from 'react';
import { Meta, StoryObj } from "@storybook/react";

import { TwoProvider, TwoCircle } from '../../two-js-react';
import { useMousePos, withMousePosition } from '../../../.storybook/decorators';

// ============================================
// FourDCircle - Trail of circles following mouse
// ============================================

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  timestamp: number;
  initialRadius: number; // Radius when this point was created
  // Random seeds for jitter animation
  jitterPhaseX: number;
  jitterPhaseY: number;
  jitterSpeedX: number;
  jitterSpeedY: number;
  // Random variation per particle
  sizeVariation: number; // 0.7-1.3 multiplier
  driftX: number; // slow drift direction
  driftY: number;
}

interface FourDCircleProps {
  radius: number;
  duration: number; // How long circles take to fully fade (ms)
  decay: number; // Decay curve exponent (1 = linear, <1 = slow start, >1 = fast start)
  minScale: number; // Minimum scale (0-1) - how small circles get before disappearing
  sampleRate: number; // Minimum ms between creating new circles
  jitter: number; // Jitter amount (0 = none, 1 = full jitter at 1/4 radius)
  jitterSpeed: number; // Jitter oscillation speed (oscillations per second)
  growSpeed: number; // How fast radius grows/shrinks (pixels per second)
}

let nextId = 0;

function FourDCircleDemo({ radius: maxRadius, duration, decay, minScale, sampleRate, jitter, jitterSpeed, growSpeed }: FourDCircleProps) {
  // Store trail positions with timestamps
  const [trails, setTrails] = useState<TrailPoint[]>([]);
  // Current animated radius (grows when moving, shrinks when stopped)
  const [currentRadius, setCurrentRadius] = useState(0);
  // Force re-render for animation
  const [, setTick] = useState(0);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastSampleTimeRef = useRef<number>(0);
  const lastMoveTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const currentRadiusRef = useRef(0); // Ref for use in animation loop

  // Get current mouse position
  const [x, y] = useMousePos();

  // Track mouse position changes
  useEffect(() => {
    if (x === 0 && y === 0) return;

    const posChanged = !lastPosRef.current ||
      lastPosRef.current.x !== x ||
      lastPosRef.current.y !== y;

    if (posChanged) {
      lastMoveTimeRef.current = performance.now();
      lastPosRef.current = { x, y };
    }
  }, [x, y]);

  // Continuous animation loop for radius animation, fading, AND circle spawning
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastFrameTimeRef.current) / 1000; // seconds
      lastFrameTimeRef.current = now;

      // Determine if moving (moved within last 100ms)
      const isMoving = now - lastMoveTimeRef.current < 100;

      // Animate radius: grow when moving, shrink when stopped
      const radiusChange = growSpeed * deltaTime;
      if (isMoving) {
        currentRadiusRef.current = Math.min(maxRadius, currentRadiusRef.current + radiusChange);
      } else {
        currentRadiusRef.current = Math.max(0, currentRadiusRef.current - radiusChange);
      }
      setCurrentRadius(currentRadiusRef.current);

      // Spawn new circles while moving (in animation loop for smooth continuous spawning)
      if (isMoving && currentRadiusRef.current > 1 && lastPosRef.current) {
        if (now - lastSampleTimeRef.current >= sampleRate) {
          lastSampleTimeRef.current = now;

          const newPoint: TrailPoint = {
            x: lastPosRef.current.x,
            y: lastPosRef.current.y,
            id: nextId++,
            timestamp: now,
            initialRadius: currentRadiusRef.current,
            jitterPhaseX: Math.random() * Math.PI * 2,
            jitterPhaseY: Math.random() * Math.PI * 2,
            jitterSpeedX: 0.5 + Math.random() * 1.0,
            jitterSpeedY: 0.5 + Math.random() * 1.0,
            sizeVariation: 0.7 + Math.random() * 0.6,
            driftX: (Math.random() - 0.5) * 30,
            driftY: (Math.random() - 0.5) * 30,
          };

          setTrails(prev => [newPoint, ...prev]);
        }
      }

      // Remove fully faded circles
      setTrails(prev => {
        const filtered = prev.filter(point => {
          const age = now - point.timestamp;
          return age < duration;
        });
        return filtered;
      });

      // Force re-render
      setTick(t => t + 1);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [duration, maxRadius, growSpeed, sampleRate]);

  const now = performance.now();

  return (
    <TwoProvider width={500} height={500} type="canvas">
      {/* Main circle at mouse position - size based on current animated radius */}
      {currentRadius > 1 && (
        <TwoCircle
          x={x}
          y={y}
          radius={currentRadius}
          fill="rgba(40, 40, 40, 1)"
          stroke="transparent"
          linewidth={0}
          opacity={0.5}
        />
      )}

      {/* Trail circles - smoky, fading based on time */}
      {trails.map((point) => {
        const age = now - point.timestamp;
        const agePerc = age / duration; // 0 to 1 as it ages
        // Linear percentage: 1.0 for brand new, approaches 0 as it ages
        const linearPerc = Math.max(0, 1 - agePerc);
        // Apply decay curve (exponent controls the shape)
        const curvedPerc = Math.pow(linearPerc, decay);
        // Map from [0,1] to [minScale,1] for the scale range
        const scale = minScale + curvedPerc * (1 - minScale);
        // Trail radius: starts from initialRadius, apply size variation for organic look
        const trailRadius = scale * point.initialRadius * point.sizeVariation;
        // Opacity: fades as it ages
        const opacity = curvedPerc * 0.6; // max 60% opacity for smoky look

        if (trailRadius <= 1) return null;

        // Calculate jitter offset (1/4 of current radius, scaled by jitter amount)
        const jitterRadius = (trailRadius / 4) * jitter;
        const timeInSeconds = now / 1000;
        const jitterX = Math.sin(timeInSeconds * jitterSpeed * point.jitterSpeedX + point.jitterPhaseX) * jitterRadius;
        const jitterY = Math.sin(timeInSeconds * jitterSpeed * point.jitterSpeedY + point.jitterPhaseY) * jitterRadius;

        // Add drift over time (smoke rises/disperses)
        const driftX = point.driftX * agePerc;
        const driftY = point.driftY * agePerc;

        return (
          <TwoCircle
            key={point.id}
            x={point.x + jitterX + driftX}
            y={point.y + jitterY + driftY}
            radius={trailRadius}
            fill="rgba(40, 40, 40, 1)"
            stroke="transparent"
            linewidth={0}
            opacity={opacity}
          />
        );
      })}
    </TwoProvider>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta<FourDCircleProps> = {
  title: 'Interactive/Four D Circle',
  decorators: [withMousePosition],
  parameters: {
    layout: 'centered',
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  argTypes: {
    radius: {
      control: { type: 'range', min: 5, max: 100, step: 1 },
      description: 'Maximum radius of the circles',
    },
    duration: {
      control: { type: 'range', min: 500, max: 5000, step: 100 },
      description: 'How long circles take to fully fade (ms)',
    },
    decay: {
      control: { type: 'range', min: 0.1, max: 3, step: 0.1 },
      description: 'Decay curve (1 = linear, <1 = slow then fast, >1 = fast then slow)',
    },
    minScale: {
      control: { type: 'range', min: 0, max: 0.9, step: 0.05 },
      description: 'Minimum circle size as fraction of max (0 = shrink to nothing, 0.5 = shrink to half)',
    },
    sampleRate: {
      control: { type: 'range', min: 0, max: 200, step: 10 },
      description: 'Minimum ms between creating new circles (0 = every frame)',
    },
    jitter: {
      control: { type: 'range', min: 0, max: 2, step: 0.1 },
      description: 'Jitter amount (0 = none, 1 = wobble within 1/4 radius)',
    },
    jitterSpeed: {
      control: { type: 'range', min: 0.5, max: 20, step: 0.5 },
      description: 'Jitter oscillation speed (oscillations per second)',
    },
    growSpeed: {
      control: { type: 'range', min: 10, max: 500, step: 10 },
      description: 'How fast radius grows/shrinks (pixels per second)',
    },
  },
};

export default meta;

type FourDCircleStory = StoryObj<FourDCircleProps>;

export const Default: FourDCircleStory = {
  render: (args) => <FourDCircleDemo {...args} />,
  args: {
    radius: 16,
    duration: 3200,
    decay: 2.3,
    minScale: 0.3,
    sampleRate: 0,
    jitter: 0.2,
    jitterSpeed: 20,
    growSpeed: 10,
  },
};
