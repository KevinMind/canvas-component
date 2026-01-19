import React, { useState, useCallback, useMemo } from 'react';
import { ComponentMeta, StoryObj } from "@storybook/react";

import {
  TwoProvider,
  InteractiveTwoCircle,
  InteractiveTwoRect,
  InteractiveTwoPolygon,
  InteractiveTwoRegularPolygon,
  TwoCircle,
} from '../../two-js-react';
import { InteractionEvent } from '@canvas-component/core';

// ============================================
// Interactive Buttons Demo
// ============================================

function InteractiveButtonsDemo() {
  const [clickedShape, setClickedShape] = useState<string | null>(null);
  const [hoverShape, setHoverShape] = useState<string | null>(null);

  // Create stable callback references for each shape
  // These use refs internally via useCallback to avoid creating new functions on render
  const handleCircleClick = useCallback((event: InteractionEvent) => {
    setClickedShape('circle');
    console.log('Clicked circle at', event.position);
  }, []);

  const handleRectClick = useCallback((event: InteractionEvent) => {
    setClickedShape('rect');
    console.log('Clicked rect at', event.position);
  }, []);

  const handleHexagonClick = useCallback((event: InteractionEvent) => {
    setClickedShape('hexagon');
    console.log('Clicked hexagon at', event.position);
  }, []);

  const handleTriangleClick = useCallback((event: InteractionEvent) => {
    setClickedShape('triangle');
    console.log('Clicked triangle at', event.position);
  }, []);

  const handleStarClick = useCallback((event: InteractionEvent) => {
    setClickedShape('star');
    console.log('Clicked star at', event.position);
  }, []);

  const handlePentagonClick = useCallback((event: InteractionEvent) => {
    setClickedShape('pentagon');
    console.log('Clicked pentagon at', event.position);
  }, []);

  const handleCircleEnter = useCallback(() => setHoverShape('circle'), []);
  const handleRectEnter = useCallback(() => setHoverShape('rect'), []);
  const handleHexagonEnter = useCallback(() => setHoverShape('hexagon'), []);
  const handleTriangleEnter = useCallback(() => setHoverShape('triangle'), []);
  const handleStarEnter = useCallback(() => setHoverShape('star'), []);
  const handlePentagonEnter = useCallback(() => setHoverShape('pentagon'), []);

  const handleLeave = useCallback(() => {
    setHoverShape(null);
  }, []);

  return (
    <div>
      <TwoProvider width={600} height={400} type="canvas">
        {/* Circle button */}
        <InteractiveTwoCircle
          x={100}
          y={100}
          radius={50}
          fill={hoverShape === 'circle' ? '#ff6b6b' : '#e74c3c'}
          onClick={handleCircleClick}
          onPointerEnter={handleCircleEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Red circle button"
        />

        {/* Rectangle button */}
        <InteractiveTwoRect
          x={250}
          y={100}
          width={100}
          height={60}
          fill={hoverShape === 'rect' ? '#74b9ff' : '#3498db'}
          onClick={handleRectClick}
          onPointerEnter={handleRectEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Blue rectangle button"
        />

        {/* Hexagon button */}
        <InteractiveTwoRegularPolygon
          x={450}
          y={100}
          radius={50}
          sides={6}
          fill={hoverShape === 'hexagon' ? '#a29bfe' : '#9b59b6'}
          onClick={handleHexagonClick}
          onPointerEnter={handleHexagonEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Purple hexagon button"
        />

        {/* Triangle button */}
        <InteractiveTwoRegularPolygon
          x={100}
          y={250}
          radius={50}
          sides={3}
          fill={hoverShape === 'triangle' ? '#55efc4' : '#00b894'}
          onClick={handleTriangleClick}
          onPointerEnter={handleTriangleEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Green triangle button"
        />

        {/* Custom polygon button (star-like) */}
        <InteractiveTwoPolygon
          vertices={[
            { x: 250, y: 200 },
            { x: 280, y: 240 },
            { x: 330, y: 240 },
            { x: 290, y: 270 },
            { x: 310, y: 320 },
            { x: 250, y: 290 },
            { x: 190, y: 320 },
            { x: 210, y: 270 },
            { x: 170, y: 240 },
            { x: 220, y: 240 },
          ]}
          fill={hoverShape === 'star' ? '#fdcb6e' : '#f39c12'}
          onClick={handleStarClick}
          onPointerEnter={handleStarEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Orange star button"
        />

        {/* Pentagon */}
        <InteractiveTwoRegularPolygon
          x={450}
          y={270}
          radius={50}
          sides={5}
          fill={hoverShape === 'pentagon' ? '#fd79a8' : '#e84393'}
          onClick={handlePentagonClick}
          onPointerEnter={handlePentagonEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Pink pentagon button"
        />
      </TwoProvider>

      <div style={{ marginTop: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
        <div>Hover: <strong>{hoverShape || 'none'}</strong></div>
        <div>Last clicked: <strong>{clickedShape || 'none'}</strong></div>
        <div style={{ marginTop: '10px', color: '#666' }}>
          Try clicking the shapes! They have hover effects and are keyboard accessible.
        </div>
      </div>
    </div>
  );
}

// ============================================
// Counter Demo
// ============================================

function CounterDemo() {
  const [count, setCount] = useState(0);

  const handleDecrement = useCallback(() => setCount(c => c - 1), []);
  const handleIncrement = useCallback(() => setCount(c => c + 1), []);

  return (
    <div>
      <TwoProvider width={400} height={200} type="canvas">
        {/* Decrement button */}
        <InteractiveTwoCircle
          x={80}
          y={100}
          radius={40}
          fill="#e74c3c"
          stroke="#c0392b"
          linewidth={3}
          onClick={handleDecrement}
          ariaLabel="Decrease counter"
        />

        {/* Minus sign */}
        <TwoCircle x={80} y={100} radius={15} fill="white" />

        {/* Increment button */}
        <InteractiveTwoCircle
          x={320}
          y={100}
          radius={40}
          fill="#27ae60"
          stroke="#1e8449"
          linewidth={3}
          onClick={handleIncrement}
          ariaLabel="Increase counter"
        />

        {/* Plus sign approximation */}
        <TwoCircle x={320} y={100} radius={15} fill="white" />
      </TwoProvider>

      <div style={{
        textAlign: 'center',
        fontSize: '48px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginTop: '20px'
      }}>
        {count}
      </div>
    </div>
  );
}

// ============================================
// Toggle Buttons Demo
// ============================================

function ToggleButtonsDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Create stable toggle handlers for each button
  const toggleA = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has('A')) next.delete('A');
      else next.add('A');
      return next;
    });
  }, []);

  const toggleB = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has('B')) next.delete('B');
      else next.add('B');
      return next;
    });
  }, []);

  const toggleC = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has('C')) next.delete('C');
      else next.add('C');
      return next;
    });
  }, []);

  const toggleD = useCallback(() => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has('D')) next.delete('D');
      else next.add('D');
      return next;
    });
  }, []);

  const isSelected = (name: string) => selected.has(name);

  return (
    <div>
      <TwoProvider width={500} height={150} type="canvas">
        <InteractiveTwoRect
          x={70}
          y={75}
          width={100}
          height={100}
          fill={isSelected('A') ? '#3498db' : '#bdc3c7'}
          stroke={isSelected('A') ? '#2980b9' : '#95a5a6'}
          linewidth={3}
          onClick={toggleA}
          ariaLabel="Toggle option A"
          role="checkbox"
        />

        <InteractiveTwoRect
          x={190}
          y={75}
          width={100}
          height={100}
          fill={isSelected('B') ? '#3498db' : '#bdc3c7'}
          stroke={isSelected('B') ? '#2980b9' : '#95a5a6'}
          linewidth={3}
          onClick={toggleB}
          ariaLabel="Toggle option B"
          role="checkbox"
        />

        <InteractiveTwoRect
          x={310}
          y={75}
          width={100}
          height={100}
          fill={isSelected('C') ? '#3498db' : '#bdc3c7'}
          stroke={isSelected('C') ? '#2980b9' : '#95a5a6'}
          linewidth={3}
          onClick={toggleC}
          ariaLabel="Toggle option C"
          role="checkbox"
        />

        <InteractiveTwoRect
          x={430}
          y={75}
          width={100}
          height={100}
          fill={isSelected('D') ? '#3498db' : '#bdc3c7'}
          stroke={isSelected('D') ? '#2980b9' : '#95a5a6'}
          linewidth={3}
          onClick={toggleD}
          ariaLabel="Toggle option D"
          role="checkbox"
        />
      </TwoProvider>

      <div style={{ marginTop: '20px', fontFamily: 'monospace' }}>
        Selected: {Array.from(selected).join(', ') || 'none'}
      </div>
    </div>
  );
}

// ============================================
// Stories
// ============================================

export default {
  title: 'Interactive/Click Handlers',
} as ComponentMeta<any>;

export const Buttons: StoryObj = {
  render: () => <InteractiveButtonsDemo />,
};

export const Counter: StoryObj = {
  render: () => <CounterDemo />,
};

export const ToggleButtons: StoryObj = {
  render: () => <ToggleButtonsDemo />,
};
