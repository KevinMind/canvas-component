import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useMemo,
} from "react";
import Two from "two.js";

import { AccessibilityLayer } from "../accessibility";
import { HitRegion, InteractionManager } from "../engine";

export interface TwoContextValue {
  two: Two;
  width: number;
  height: number;
  interaction: InteractionManager | null;
}

export const TwoContext = createContext<TwoContextValue | null>(null);

export function useTwoContext(): TwoContextValue {
  const ctx = useContext(TwoContext);
  if (!ctx) {
    throw new Error("useTwoContext must be used within a TwoProvider");
  }
  return ctx;
}

export function useTwo(): Two {
  return useTwoContext().two;
}

export function useTwoInteraction(): InteractionManager | null {
  return useTwoContext().interaction;
}

export interface TwoProviderProps {
  children: ReactNode;
  width?: number;
  height?: number;
  /**
   * Two.js renderer type. Defaults to 'canvas' for best performance.
   * Use 'svg' for crispness at any scale, 'webgl' for GPU acceleration.
   */
  type?: "canvas" | "svg" | "webgl";
  /**
   * Whether to use automatic animation loop. Defaults to true.
   */
  autostart?: boolean;
  /**
   * Enable accessibility features (ARIA layer for screen readers).
   * Defaults to true.
   */
  accessible?: boolean;
}

/**
 * TwoProvider - A high-performance canvas provider powered by Two.js.
 *
 * Uses Two.js's scene graph for optimal performance - objects are created
 * once and only their properties are updated, avoiding full redraws.
 *
 * @example
 * ```tsx
 * <TwoProvider width={800} height={600}>
 *   <TwoCircle x={100} y={100} radius={50} fill="red" onClick={() => alert('clicked!')} />
 *   <TwoRect x={200} y={200} width={100} height={50} fill="blue" />
 * </TwoProvider>
 * ```
 */
export function TwoProvider({
  children,
  width = 800,
  height = 600,
  type = "canvas",
  autostart = true,
  accessible = true,
}: TwoProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [contextValue, setContextValue] = useState<TwoContextValue | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const twoType =
      type === "canvas"
        ? Two.Types.canvas
        : type === "svg"
        ? Two.Types.svg
        : Two.Types.webgl;

    const two = new Two({
      width,
      height,
      type: twoType,
      autostart,
    }).appendTo(containerRef.current);

    // Get the canvas/svg element for interaction
    const domElement = two.renderer.domElement as HTMLCanvasElement;
    canvasRef.current = domElement;

    // Create interaction manager for click handling (canvas only)
    let interaction: InteractionManager | null = null;
    if (type === "canvas" && domElement instanceof HTMLCanvasElement) {
      interaction = new InteractionManager(domElement);
    }

    setContextValue({ two, width, height, interaction });

    return () => {
      two.pause();
      two.clear();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      two.release(two as any);
      if (interaction) {
        interaction.destroy();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [width, height, type, autostart]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width,
        height,
        display: "inline-block",
      }}
    >
      {contextValue && (
        <TwoContext.Provider value={contextValue}>
          {accessible ? (
            <AccessibilityLayer canvasRef={canvasRef.current}>
              {children}
            </AccessibilityLayer>
          ) : (
            children
          )}
        </TwoContext.Provider>
      )}
    </div>
  );
}
