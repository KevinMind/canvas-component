import React, { useState, useCallback } from 'react';
import { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { within, userEvent, expect } from "@storybook/test";

import {
  TwoProvider,
  InteractiveTwoCircle,
  InteractiveTwoRect,
  InteractiveTwoRegularPolygon,
  TwoCircle,
} from '../../two-js-react';
import { InteractionEvent } from '@canvas-component/core';

// ============================================
// Interactive Buttons Demo with Actions
// ============================================

interface ButtonsDemoProps {
  onCircleClick?: (event: InteractionEvent) => void;
  onRectClick?: (event: InteractionEvent) => void;
  onHexagonClick?: (event: InteractionEvent) => void;
  onTriangleClick?: (event: InteractionEvent) => void;
  onPentagonClick?: (event: InteractionEvent) => void;
}

function InteractiveButtonsDemo({
  onCircleClick,
  onRectClick,
  onHexagonClick,
  onTriangleClick,
  onPentagonClick,
}: ButtonsDemoProps) {
  const [clickedShape, setClickedShape] = useState<string | null>(null);
  const [hoverShape, setHoverShape] = useState<string | null>(null);

  const handleCircleClick = useCallback((event: InteractionEvent) => {
    setClickedShape('circle');
    onCircleClick?.(event);
  }, [onCircleClick]);

  const handleRectClick = useCallback((event: InteractionEvent) => {
    setClickedShape('rect');
    onRectClick?.(event);
  }, [onRectClick]);

  const handleHexagonClick = useCallback((event: InteractionEvent) => {
    setClickedShape('hexagon');
    onHexagonClick?.(event);
  }, [onHexagonClick]);

  const handleTriangleClick = useCallback((event: InteractionEvent) => {
    setClickedShape('triangle');
    onTriangleClick?.(event);
  }, [onTriangleClick]);

  const handlePentagonClick = useCallback((event: InteractionEvent) => {
    setClickedShape('pentagon');
    onPentagonClick?.(event);
  }, [onPentagonClick]);

  const handleCircleEnter = useCallback(() => setHoverShape('circle'), []);
  const handleRectEnter = useCallback(() => setHoverShape('rect'), []);
  const handleHexagonEnter = useCallback(() => setHoverShape('hexagon'), []);
  const handleTriangleEnter = useCallback(() => setHoverShape('triangle'), []);
  const handlePentagonEnter = useCallback(() => setHoverShape('pentagon'), []);
  const handleLeave = useCallback(() => setHoverShape(null), []);

  return (
    <div>
      <TwoProvider width={600} height={400} type="canvas">
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

        <InteractiveTwoRegularPolygon
          x={100}
          y={280}
          radius={50}
          sides={3}
          fill={hoverShape === 'triangle' ? '#55efc4' : '#00b894'}
          onClick={handleTriangleClick}
          onPointerEnter={handleTriangleEnter}
          onPointerLeave={handleLeave}
          ariaLabel="Green triangle button"
        />

        <InteractiveTwoRegularPolygon
          x={450}
          y={280}
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
        <div>Hover: <strong data-testid="hover-state">{hoverShape || 'none'}</strong></div>
        <div>Last clicked: <strong data-testid="click-state">{clickedShape || 'none'}</strong></div>
        <div style={{ marginTop: '10px', color: '#666' }}>
          Click shapes or use Tab + Enter/Space for keyboard navigation.
        </div>
      </div>
    </div>
  );
}

// ============================================
// Keyboard Navigation Demo
// ============================================

function KeyboardNavigationDemo() {
  const [focusedShape, setFocusedShape] = useState<string | null>(null);
  const [activatedShape, setActivatedShape] = useState<string | null>(null);
  const [activationCount, setActivationCount] = useState(0);

  const handleClick = useCallback((shape: string) => (event: InteractionEvent) => {
    setActivatedShape(shape);
    setActivationCount(c => c + 1);
    action(`${shape}-activated`)(event);
  }, []);

  const handleFocus = useCallback((shape: string) => () => {
    setFocusedShape(shape);
    action(`${shape}-focused`)();
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedShape(null);
    action('shape-blurred')();
  }, []);

  // Helper to get fill color based on focus state (same as hover would look)
  const getFill = useCallback((shape: string, baseColor: string, focusColor: string) => {
    return focusedShape === shape ? focusColor : baseColor;
  }, [focusedShape]);

  return (
    <div>
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontFamily: 'system-ui'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Keyboard Navigation Test</h3>
        <p style={{ margin: '0 0 10px 0', color: '#666' }}>
          Use <kbd style={{ padding: '2px 6px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>Tab</kbd> to navigate between shapes,
          then <kbd style={{ padding: '2px 6px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>Enter</kbd> or
          <kbd style={{ padding: '2px 6px', backgroundColor: '#e9ecef', borderRadius: '3px' }}>Space</kbd> to activate.
        </p>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
          <div>Focused: <strong data-testid="focused-shape">{focusedShape || 'none'}</strong></div>
          <div>Last activated: <strong data-testid="activated-shape">{activatedShape || 'none'}</strong></div>
          <div>Activation count: <strong data-testid="activation-count">{activationCount}</strong></div>
        </div>
      </div>

      <TwoProvider width={600} height={200} type="canvas">
        <InteractiveTwoCircle
          x={60}
          y={100}
          radius={40}
          fill={getFill('circle', '#e74c3c', '#ff6b6b')}
          onClick={handleClick('circle')}
          onFocus={handleFocus('circle')}
          onBlur={handleBlur}
          ariaLabel="Circle - press Enter to activate"
        />

        <InteractiveTwoRect
          x={180}
          y={100}
          width={80}
          height={80}
          fill={getFill('rect', '#3498db', '#74b9ff')}
          onClick={handleClick('rect')}
          onFocus={handleFocus('rect')}
          onBlur={handleBlur}
          ariaLabel="Rectangle - press Enter to activate"
        />

        <InteractiveTwoRegularPolygon
          x={300}
          y={100}
          radius={40}
          sides={6}
          fill={getFill('hexagon', '#9b59b6', '#a29bfe')}
          onClick={handleClick('hexagon')}
          onFocus={handleFocus('hexagon')}
          onBlur={handleBlur}
          ariaLabel="Hexagon - press Enter to activate"
        />

        <InteractiveTwoRegularPolygon
          x={420}
          y={100}
          radius={40}
          sides={3}
          fill={getFill('triangle', '#00b894', '#55efc4')}
          onClick={handleClick('triangle')}
          onFocus={handleFocus('triangle')}
          onBlur={handleBlur}
          ariaLabel="Triangle - press Enter to activate"
        />

        <InteractiveTwoRegularPolygon
          x={540}
          y={100}
          radius={40}
          sides={5}
          fill={getFill('pentagon', '#e84393', '#fd79a8')}
          onClick={handleClick('pentagon')}
          onFocus={handleFocus('pentagon')}
          onBlur={handleBlur}
          ariaLabel="Pentagon - press Enter to activate"
        />
      </TwoProvider>
    </div>
  );
}

// ============================================
// Counter Demo
// ============================================

interface CounterDemoProps {
  onIncrement?: () => void;
  onDecrement?: () => void;
}

function CounterDemo({ onIncrement, onDecrement }: CounterDemoProps) {
  const [count, setCount] = useState(0);

  const handleDecrement = useCallback(() => {
    setCount(c => c - 1);
    onDecrement?.();
  }, [onDecrement]);

  const handleIncrement = useCallback(() => {
    setCount(c => c + 1);
    onIncrement?.();
  }, [onIncrement]);

  return (
    <div>
      <TwoProvider width={400} height={200} type="canvas">
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
        <TwoCircle x={80} y={100} radius={15} fill="white" />

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
        <TwoCircle x={320} y={100} radius={15} fill="white" />
      </TwoProvider>

      <div style={{
        textAlign: 'center',
        fontSize: '48px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginTop: '20px'
      }}>
        <span data-testid="counter-value">{count}</span>
      </div>
    </div>
  );
}

// ============================================
// Stories
// ============================================

const meta: Meta = {
  title: 'Interactive/Click Handlers',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

// Buttons story with actions
export const Buttons: StoryObj<ButtonsDemoProps> = {
  render: (args) => <InteractiveButtonsDemo {...args} />,
  args: {
    onCircleClick: action('circle-clicked'),
    onRectClick: action('rect-clicked'),
    onHexagonClick: action('hexagon-clicked'),
    onTriangleClick: action('triangle-clicked'),
    onPentagonClick: action('pentagon-clicked'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for canvas to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find the canvas element and click on the circle position
    const canvasEl = canvasElement.querySelector('canvas');
    if (!canvasEl) throw new Error('Canvas not found');

    const rect = canvasEl.getBoundingClientRect();

    // Click on circle (at position 100, 100 in canvas coordinates)
    await userEvent.pointer({
      target: canvasEl,
      coords: { x: rect.left + 100, y: rect.top + 100 },
      keys: '[MouseLeft]',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the click was registered
    const clickState = canvas.getByTestId('click-state');
    await expect(clickState.textContent).toBe('circle');
  },
};

// Keyboard navigation story with interaction test
export const KeyboardNavigation: StoryObj = {
  render: () => <KeyboardNavigationDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for canvas to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find the first focusable button (accessibility layer button)
    const buttons = canvasElement.querySelectorAll('button[aria-label]');
    if (buttons.length === 0) throw new Error('No accessible buttons found');

    // Focus the first button
    (buttons[0] as HTMLButtonElement).focus();

    // Press Enter to activate
    await userEvent.keyboard('{Enter}');
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify activation
    const activatedShape = canvas.getByTestId('activated-shape');
    await expect(activatedShape.textContent).toBe('circle');

    // Tab to next button
    await userEvent.tab();
    await new Promise(resolve => setTimeout(resolve, 50));

    // Press Space to activate
    await userEvent.keyboard(' ');
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify second activation
    await expect(activatedShape.textContent).toBe('rect');

    // Check activation count
    const activationCount = canvas.getByTestId('activation-count');
    await expect(activationCount.textContent).toBe('2');
  },
};

// Counter story with actions and interaction test
export const Counter: StoryObj<CounterDemoProps> = {
  render: (args) => <CounterDemo {...args} />,
  args: {
    onIncrement: action('increment'),
    onDecrement: action('decrement'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for canvas to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find the increment button (green, at x=320)
    const canvasEl = canvasElement.querySelector('canvas');
    if (!canvasEl) throw new Error('Canvas not found');

    const rect = canvasEl.getBoundingClientRect();

    // Click increment button
    await userEvent.pointer({
      target: canvasEl,
      coords: { x: rect.left + 320, y: rect.top + 100 },
      keys: '[MouseLeft]',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify counter increased
    const counterValue = canvas.getByTestId('counter-value');
    await expect(counterValue.textContent).toBe('1');

    // Click increment again
    await userEvent.pointer({
      target: canvasEl,
      coords: { x: rect.left + 320, y: rect.top + 100 },
      keys: '[MouseLeft]',
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await expect(counterValue.textContent).toBe('2');

    // Click decrement button (red, at x=80)
    await userEvent.pointer({
      target: canvasEl,
      coords: { x: rect.left + 80, y: rect.top + 100 },
      keys: '[MouseLeft]',
    });

    await new Promise(resolve => setTimeout(resolve, 100));
    await expect(counterValue.textContent).toBe('1');
  },
};
