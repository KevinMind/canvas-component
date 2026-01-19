import React, { useEffect, useRef, useMemo } from 'react';
import { ComponentMeta, StoryObj } from "@storybook/react";
import Two from 'two.js';
import { Circle as TwoCircle } from 'two.js/src/shapes/circle';

import { TwoProvider, useTwo } from '../../two-js-react';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

function randomColor(): string {
  const hue = Math.random() * 360;
  const saturation = 50 + Math.random() * 50;
  const lightness = 40 + Math.random() * 30;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function createBalls(count: number, width: number, height: number): Ball[] {
  const balls: Ball[] = [];
  for (let i = 0; i < count; i++) {
    const radius = 5 + Math.random() * 25;
    balls.push({
      x: radius + Math.random() * (width - radius * 2),
      y: radius + Math.random() * (height - radius * 2),
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      radius,
      color: randomColor(),
    });
  }
  return balls;
}

function updateBalls(balls: Ball[], width: number, height: number): void {
  for (const ball of balls) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off walls
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.vx *= -1;
    } else if (ball.x + ball.radius > width) {
      ball.x = width - ball.radius;
      ball.vx *= -1;
    }

    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.vy *= -1;
    } else if (ball.y + ball.radius > height) {
      ball.y = height - ball.radius;
      ball.vy *= -1;
    }
  }
}

// ============================================
// Two.js Direct Implementation
// ============================================

interface TwoJsStressTestProps {
  ballCount: number;
}

function TwoJsStressTest({ ballCount }: TwoJsStressTestProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const twoRef = useRef<Two | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const circlesRef = useRef<TwoCircle[]>([]);
  const fpsRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const fpsDisplayRef = useRef<HTMLDivElement>(null);
  const avgFpsDisplayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  const width = 800;
  const height = 600;

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Two.js
    const two = new Two({
      width,
      height,
      type: Two.Types.canvas,
    }).appendTo(containerRef.current);

    twoRef.current = two;

    // Create balls
    ballsRef.current = createBalls(ballCount, width, height);
    circlesRef.current = [];

    for (const ball of ballsRef.current) {
      const circle = two.makeCircle(ball.x, ball.y, ball.radius);
      circle.fill = ball.color;
      circle.noStroke();
      circlesRef.current.push(circle);
    }

    // Animation loop
    function animate() {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Calculate FPS
      const currentFps = 1000 / delta;
      fpsRef.current.push(currentFps);
      if (fpsRef.current.length > 60) {
        fpsRef.current.shift();
      }

      // Update FPS display every 10 frames (via DOM, not React state)
      if (fpsRef.current.length % 10 === 0) {
        const avg = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
        if (fpsDisplayRef.current) {
          fpsDisplayRef.current.textContent = `FPS: ${Math.round(currentFps)}`;
        }
        if (avgFpsDisplayRef.current) {
          avgFpsDisplayRef.current.textContent = `Avg FPS: ${Math.round(avg)}`;
        }
      }

      // Update ball positions
      updateBalls(ballsRef.current, width, height);

      // Update circle positions
      for (let i = 0; i < ballsRef.current.length; i++) {
        const ball = ballsRef.current[i];
        const circle = circlesRef.current[i];
        circle.position.set(ball.x, ball.y);
      }

      two.update();
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      two.clear();
      two.release(two);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [ballCount]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ border: '1px solid black' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', fontFamily: 'monospace' }}>
        <div>Two.js (Direct)</div>
        <div>Balls: {ballCount}</div>
        <div ref={fpsDisplayRef}>FPS: --</div>
        <div ref={avgFpsDisplayRef}>Avg FPS: --</div>
      </div>
    </div>
  );
}

// ============================================
// Two.js React Components Implementation
// (Uses our TwoProvider wrapper around Two.js)
// ============================================

interface TwoReactStressTestProps {
  ballCount: number;
}

function TwoReactBalls({ balls, width, height }: { balls: Ball[], width: number, height: number }) {
  const two = useTwo();
  const circlesRef = useRef<TwoCircle[]>([]);
  const initialized = useRef(false);

  // Create circles once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    circlesRef.current = balls.map((ball) => {
      const circle = two.makeCircle(ball.x, ball.y, ball.radius);
      circle.fill = ball.color;
      circle.noStroke();
      return circle;
    });

    return () => {
      circlesRef.current.forEach((c) => c.remove());
      circlesRef.current = [];
      initialized.current = false;
    };
  }, [two, balls]);

  // Update positions every frame via Two.js bind
  useEffect(() => {
    function update() {
      updateBalls(balls, width, height);
      for (let i = 0; i < balls.length && i < circlesRef.current.length; i++) {
        circlesRef.current[i].position.set(balls[i].x, balls[i].y);
      }
    }

    two.bind('update', update);
    return () => {
      two.unbind('update', update);
    };
  }, [two, balls, width, height]);

  return null;
}

function TwoReactStressTest({ ballCount }: TwoReactStressTestProps) {
  const width = 800;
  const height = 600;
  const ballsRef = useRef<Ball[]>([]);
  const fpsRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const fpsDisplayRef = useRef<HTMLDivElement>(null);
  const avgFpsDisplayRef = useRef<HTMLDivElement>(null);

  // Create balls once
  const balls = useMemo(() => {
    ballsRef.current = createBalls(ballCount, width, height);
    return ballsRef.current;
  }, [ballCount]);

  // FPS tracking via RAF
  useEffect(() => {
    let rafId: number;

    function trackFps() {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const currentFps = 1000 / delta;
      fpsRef.current.push(currentFps);
      if (fpsRef.current.length > 60) {
        fpsRef.current.shift();
      }

      if (fpsRef.current.length % 10 === 0) {
        const avg = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
        if (fpsDisplayRef.current) {
          fpsDisplayRef.current.textContent = `FPS: ${Math.round(currentFps)}`;
        }
        if (avgFpsDisplayRef.current) {
          avgFpsDisplayRef.current.textContent = `Avg FPS: ${Math.round(avg)}`;
        }
      }

      rafId = requestAnimationFrame(trackFps);
    }

    rafId = requestAnimationFrame(trackFps);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <TwoProvider width={width} height={height} type="canvas">
        <TwoReactBalls balls={balls} width={width} height={height} />
      </TwoProvider>
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', borderRadius: '5px', fontFamily: 'monospace' }}>
        <div>Two.js React</div>
        <div>Balls: {ballCount}</div>
        <div ref={fpsDisplayRef}>FPS: --</div>
        <div ref={avgFpsDisplayRef}>Avg FPS: --</div>
      </div>
    </div>
  );
}

// ============================================
// Side-by-Side Comparison
// ============================================

interface SideBySideProps {
  ballCount: number;
}

function SideBySideComparison({ ballCount }: SideBySideProps) {
  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div>
        <h3 style={{ margin: '0 0 10px 0' }}>Two.js (Direct)</h3>
        <TwoJsStressTest ballCount={ballCount} />
      </div>
      <div>
        <h3 style={{ margin: '0 0 10px 0' }}>Two.js React</h3>
        <TwoReactStressTest ballCount={ballCount} />
      </div>
    </div>
  );
}

// ============================================
// Stories
// ============================================

export default {
  title: 'Stress Test/Bouncing Balls',
  argTypes: {
    ballCount: {
      control: { type: 'range', min: 10, max: 5000, step: 10 },
      defaultValue: 100,
    },
  },
} as ComponentMeta<any>;

// Two.js Direct stories
export const TwoJsDirect: StoryObj<TwoJsStressTestProps> = {
  args: {
    ballCount: 500,
  },
  render: (args) => <TwoJsStressTest {...args} />,
};

export const TwoJsDirect1000: StoryObj<TwoJsStressTestProps> = {
  args: {
    ballCount: 1000,
  },
  render: (args) => <TwoJsStressTest {...args} />,
};

export const TwoJsDirect2000: StoryObj<TwoJsStressTestProps> = {
  args: {
    ballCount: 2000,
  },
  render: (args) => <TwoJsStressTest {...args} />,
};

export const TwoJsDirect3750: StoryObj<TwoJsStressTestProps> = {
  args: {
    ballCount: 3750,
  },
  render: (args) => <TwoJsStressTest {...args} />,
};

// Two.js React Components stories
export const TwoReact: StoryObj<TwoReactStressTestProps> = {
  args: {
    ballCount: 500,
  },
  render: (args) => <TwoReactStressTest {...args} />,
};

export const TwoReact1000: StoryObj<TwoReactStressTestProps> = {
  args: {
    ballCount: 1000,
  },
  render: (args) => <TwoReactStressTest {...args} />,
};

export const TwoReact2000: StoryObj<TwoReactStressTestProps> = {
  args: {
    ballCount: 2000,
  },
  render: (args) => <TwoReactStressTest {...args} />,
};

export const TwoReact3750: StoryObj<TwoReactStressTestProps> = {
  args: {
    ballCount: 3750,
  },
  render: (args) => <TwoReactStressTest {...args} />,
};

// Comparison story
export const Comparison: StoryObj<SideBySideProps> = {
  args: {
    ballCount: 1000,
  },
  render: (args) => <SideBySideComparison {...args} />,
};
