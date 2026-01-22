import React, { useEffect, useRef, useCallback } from 'react';

interface FpsData {
  current: number;
  average: number;
  min: number;
  max: number;
  samples: number[];
}

export function FpsMonitor({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataRef = useRef<FpsData>({
    current: 0,
    average: 0,
    min: Infinity,
    max: 0,
    samples: [],
  });
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);

  const getColor = useCallback((value: number) => {
    if (value >= 55) return '#22c55e'; // green
    if (value >= 45) return '#eab308'; // yellow
    return '#ef4444'; // red
  }, []);

  const drawMonitor = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fps = dataRef.current;
    const width = 160;
    const height = 140;

    // Clear
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('FPS Monitor', 10, 18);

    // Stats
    ctx.font = '11px monospace';
    const stats = [
      { label: 'Current:', value: fps.current, y: 38 },
      { label: 'Average:', value: fps.average, y: 53 },
      { label: 'Min:', value: fps.min === Infinity ? 0 : fps.min, y: 68 },
      { label: 'Max:', value: fps.max, y: 83 },
    ];

    for (const stat of stats) {
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(stat.label, 10, stat.y);
      ctx.fillStyle = getColor(stat.value);
      ctx.font = 'bold 11px monospace';
      ctx.fillText(String(stat.value), 80, stat.y);
      ctx.font = '11px monospace';
    }

    // Graph
    const graphY = 95;
    const graphHeight = 35;
    const samples = fps.samples.slice(-50);

    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(10, graphY);
    ctx.lineTo(150, graphY);
    ctx.stroke();

    if (samples.length > 0) {
      const barWidth = 140 / 50;
      for (let i = 0; i < samples.length; i++) {
        const sample = samples[i];
        const barHeight = Math.min(graphHeight, (sample / 60) * graphHeight);
        ctx.fillStyle = getColor(sample);
        ctx.fillRect(
          10 + i * barWidth,
          graphY - barHeight,
          barWidth - 1,
          barHeight
        );
      }
    }

    // Target line
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.fillText('60fps target', 55, height - 3);
  }, [getColor]);

  useEffect(() => {
    let animationId: number;

    const measureFps = (currentTime: number) => {
      framesRef.current++;
      const elapsed = currentTime - lastTimeRef.current;

      // Update every 100ms
      if (elapsed >= 100) {
        const currentFps = Math.round((framesRef.current * 1000) / elapsed);
        framesRef.current = 0;
        lastTimeRef.current = currentTime;

        const data = dataRef.current;
        data.current = currentFps;

        // Keep last 100 samples
        data.samples.push(currentFps);
        if (data.samples.length > 100) {
          data.samples.shift();
        }

        data.average = Math.round(
          data.samples.reduce((a, b) => a + b, 0) / data.samples.length
        );
        data.min = Math.min(...data.samples);
        data.max = Math.max(...data.samples);

        // Expose for e2e tests
        (window as any).__STORYBOOK_FPS__ = { ...data };

        // Draw to canvas (no React re-render)
        drawMonitor();
      }

      animationId = requestAnimationFrame(measureFps);
    };

    animationId = requestAnimationFrame(measureFps);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [drawMonitor]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {children}
      <canvas
        ref={canvasRef}
        width={160}
        height={140}
        data-testid="fps-monitor"
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          borderRadius: 8,
          zIndex: 999999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}

export default FpsMonitor;
