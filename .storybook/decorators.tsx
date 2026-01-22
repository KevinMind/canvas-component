import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { StoryFn, StoryContext } from "@storybook/react";

import { TwoProvider, useTwoContext } from "../src/two-js-react";

/**
 * useAnimationFrameState - State-based animation hook for stories/visual testing
 *
 * This hook causes re-renders every frame and should ONLY be used in stories
 * for visual testing. For production use, use useAnimationValue which is zero-render.
 */
export type PlayModes = "forward" | "backward" | "pingpong" | "pingpong-backward";

interface AnimationConfig {
  from: number;
  to: number;
  duration?: number;
  easing?: (t: number) => number;
  mode?: PlayModes;
  infinite?: boolean;
  auto?: boolean;
}

const linearEasing = (t: number) => t;

export function useAnimationFrameState(config: AnimationConfig): [
  number,
  { start(mode?: PlayModes): void; stop(): void; reset(): void }
] {
  const {
    from,
    to,
    duration = Number.MAX_SAFE_INTEGER,
    easing = linearEasing,
    mode: initialMode = 'forward',
    infinite = false,
    auto = false,
  } = config;

  const [value, setValue] = useState(from);
  const mode = useRef<PlayModes>(initialMode);
  const rafId = useRef<number>();
  const startTime = useRef<number>(0);

  function stop() {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = undefined;
    }
  }

  function start(playMode?: PlayModes) {
    if (playMode) {
      mode.current = playMode;
    }

    startTime.current = performance.now();

    function tick(currentTime: number) {
      const elapsed = currentTime - startTime.current;
      let progress = Math.min(elapsed / duration, 1);

      if (mode.current.includes('backward')) {
        progress = 1 - progress;
      }

      const easedProgress = easing(progress);
      setValue(from + (to - from) * easedProgress);

      if (elapsed >= duration) {
        if (infinite) {
          switch (mode.current) {
            case 'forward':
            case 'backward':
              start(mode.current);
              return;
            case 'pingpong':
              start('pingpong-backward');
              return;
            case 'pingpong-backward':
              start('pingpong');
              return;
          }
        }
        return;
      }

      rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
  }

  function reset() {
    stop();
    setValue(from);
    mode.current = initialMode;
  }

  useEffect(() => {
    if (auto) {
      start();
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  return [value, { start, stop, reset }];
}

/**
 * Decorator that wraps story in TwoProvider
 */
export function withTwoProvider(Story: StoryFn, ctx: StoryContext) {
  const customParams = ctx.parameters?.canvasProvider ?? {};

  const { height } =
    window.parent.document
      .getElementById("storybook-preview-iframe")
      ?.getBoundingClientRect() ?? {};

  const args = {
    width: customParams.width ?? ctx.canvasElement?.offsetWidth ?? 800,
    height: customParams.height ?? height ?? 600,
  };

  return (
    <div style={{ border: "1px solid black", display: "inline-block" }}>
      <TwoProvider {...args}>
        <Story />
      </TwoProvider>
    </div>
  );
}

/**
 * Mouse position tracking
 */
type HandleMouseMove = (x: number, y: number, e: MouseEvent) => void;
type HandleMouseIdle = () => void;

interface UseMouseMoveArgs {
  onMove?: HandleMouseMove;
  onIdle?: HandleMouseIdle;
}

type MousePositionContextType = [number, number, {
  addMoveListener: (handler: HandleMouseMove) => void;
  removeMoveListener: (handler: HandleMouseMove) => void;
  addIdleListener: (handler: HandleMouseIdle) => void;
  removeIdleListener: (handler: HandleMouseIdle) => void;
}]

const MousePositionContext = createContext<MousePositionContextType>([0, 0, {
  addMoveListener: () => {},
  removeMoveListener: () => {},
  addIdleListener: () => {},
  removeIdleListener: () => {},
}]);

export function useMousePos({onIdle= () => {}, onMove = () => {}}: UseMouseMoveArgs = {}): MousePositionContextType {
  const ctx = useContext(MousePositionContext);
  const moveHandler = useRef<HandleMouseMove | null>(null);
  const idleHandler = useRef<HandleMouseIdle | null>(null);

  if (!ctx) {
    throw new Error('useMousePos() must be rendered in a story using the withMousePosition decorator');
  }

  useEffect(() => {
    if (!ctx) return;

    const [,, listeners] = ctx;

    if (onMove !== moveHandler.current) {
      listeners.addMoveListener(onMove);
      moveHandler.current = onMove;
    }

    if (onIdle !== idleHandler.current) {
      listeners.addIdleListener(onIdle);
      idleHandler.current = onIdle;
    }

    return () => {
      listeners.removeMoveListener(onMove);
      listeners.removeIdleListener(onIdle);
    }

  }, [ctx, onMove, onIdle]);

  return ctx;
}

export function withMousePosition(Story: StoryFn) {
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [idle, setIdle] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const moveListeners = useRef<Map<HandleMouseMove, true>>(new Map());
  const idleListeners = useRef<Map<HandleMouseIdle, true>>(new Map());
  const idleTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (idle) {
      for (let handle of idleListeners.current.keys()) {
        handle();
      }
    }
  }, [idle]);

  function setIdleTimeout() {
    idleTimeout.current = setTimeout(() => {
      setIdle(true);
    }, 60);
  }

  function clearIdle() {
    setIdle(false);
    if (idleTimeout.current) {
      clearTimeout(idleTimeout.current);
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function update(e: MouseEvent) {
      clearIdle();

      const rect = container!.getBoundingClientRect();

      const insideX = rect.x + rect.width > e.clientX && e.clientX > rect.x;
      const insideY = rect.y + rect.height > e.clientY && e.clientY > rect.y;

      if (insideX && insideY) {
        const x = Math.min(rect.width, Math.max(0, e.clientX - rect.x));
        const y = Math.min(rect.height, Math.max(0, e.clientY - rect.y));
        setPosition([x, y]);

        for (let handler of moveListeners.current.keys()) {
          handler(x, y, e);
        }
      }

      setIdleTimeout();
    }

    window.addEventListener('mousemove', update);

    return () => window.removeEventListener('mousemove', update);

  }, []);

  function addMoveListener(handler: HandleMouseMove) {
    if (!moveListeners.current.has(handler)) {
      moveListeners.current.set(handler, true);
    }
  }

  function removeMoveListener(handler: HandleMouseMove) {
    if (moveListeners.current.has(handler)) {
      moveListeners.current.delete(handler);
    }
  }

  function addIdleListener(handler: HandleMouseIdle) {
    if (!idleListeners.current.has(handler)) {
      idleListeners.current.set(handler, true);
    }
  }

  function removeIdleListener(handler: HandleMouseIdle) {
    if (idleListeners.current.has(handler)) {
      idleListeners.current.delete(handler);
    }
  }

  const [x, y] = position;

  return (
    <div ref={containerRef} style={{ display: 'inline-block' }}>
      <MousePositionContext.Provider value={[x, y, {addMoveListener, removeMoveListener, addIdleListener, removeIdleListener}]}>
        <Story />
      </MousePositionContext.Provider>
    </div>
  );
}
