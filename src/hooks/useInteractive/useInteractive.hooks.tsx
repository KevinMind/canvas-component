import { useEffect, useRef, useCallback, useContext, useMemo } from "react";
import { HitRegion, Position, InteractionEvent } from "../../engine";

import { TwoContext } from "../../two-js-react/TwoContext";
import { AccessibilityContext } from "../../accessibility/AccessibilityContext";
import { InteractiveConfig, InteractiveHandle } from "./useInteractive.types";

let idCounter = 0;

function generateId(): string {
  return `interactive-${++idCounter}`;
}

/**
 * useInteractive - Make a canvas shape interactive with click handlers and ARIA accessibility.
 *
 * This hook:
 * 1. Registers a hit region for click detection
 * 2. Creates an accessible DOM element for screen readers
 * 3. Handles keyboard navigation and focus
 *
 * @example
 * ```tsx
 * function InteractiveCircle({ x, y, radius, onClick }) {
 *   const hitPoints = useMemo(() => {
 *     // Approximate circle with polygon points
 *     return Array.from({ length: 16 }, (_, i) => ({
 *       x: x + Math.cos(i / 16 * Math.PI * 2) * radius,
 *       y: y + Math.sin(i / 16 * Math.PI * 2) * radius,
 *     }));
 *   }, [x, y, radius]);
 *
 *   useInteractive({
 *     points: hitPoints,
 *     onClick,
 *     ariaLabel: "Click me",
 *   });
 *
 *   return <TwoCircle x={x} y={y} radius={radius} />;
 * }
 * ```
 */
export function useInteractive(config: InteractiveConfig): InteractiveHandle {
  const twoContext = useContext(TwoContext);
  const accessibility = useContext(AccessibilityContext);

  const idRef = useRef<string>(config.id ?? generateId());
  const regionRef = useRef<HitRegion | null>(null);

  // Store callbacks in refs for stable references
  const callbacksRef = useRef({
    onClick: config.onClick,
    onPointerEnter: config.onPointerEnter,
    onPointerLeave: config.onPointerLeave,
    onPointerMove: config.onPointerMove,
    onPointerDown: config.onPointerDown,
    onPointerUp: config.onPointerUp,
  });

  // Update refs on each render (no re-render triggered)
  callbacksRef.current = {
    onClick: config.onClick,
    onPointerEnter: config.onPointerEnter,
    onPointerLeave: config.onPointerLeave,
    onPointerMove: config.onPointerMove,
    onPointerDown: config.onPointerDown,
    onPointerUp: config.onPointerUp,
  };

  // Create stable wrapper functions that read from refs
  const stableCallbacks = useMemo(
    () => ({
      click: (e: InteractionEvent) => callbacksRef.current.onClick?.(e),
      pointerenter: (e: InteractionEvent) => callbacksRef.current.onPointerEnter?.(e),
      pointerleave: (e: InteractionEvent) => callbacksRef.current.onPointerLeave?.(e),
      pointermove: (e: InteractionEvent) => callbacksRef.current.onPointerMove?.(e),
      pointerdown: (e: InteractionEvent) => callbacksRef.current.onPointerDown?.(e),
      pointerup: (e: InteractionEvent) => callbacksRef.current.onPointerUp?.(e),
    }),
    []
  );

  // Serialize points for dependency comparison
  const pointsKey = useMemo(
    () => config.points.map((p) => `${p.x},${p.y}`).join("|"),
    [config.points]
  );

  // Create or update the hit region
  useEffect(() => {
    const interaction = twoContext?.interaction;
    if (!interaction || config.points.length < 3) return;

    const region = new HitRegion({
      id: idRef.current,
      points: config.points,
    });

    regionRef.current = region;

    // Register with interaction manager using stable callbacks
    interaction.register(region, stableCallbacks);

    const currentId = idRef.current;
    return () => {
      interaction.unregister(currentId);
    };
  }, [twoContext, pointsKey, stableCallbacks]);

  // Store accessibility config in ref
  const accessibilityConfigRef = useRef({
    ariaLabel: config.ariaLabel,
    role: config.role,
    disabled: config.disabled,
    pressed: config.pressed,
    checked: config.checked,
    tabIndex: config.tabIndex,
    onFocus: config.onFocus,
    onBlur: config.onBlur,
  });

  accessibilityConfigRef.current = {
    ariaLabel: config.ariaLabel,
    role: config.role,
    disabled: config.disabled,
    pressed: config.pressed,
    checked: config.checked,
    tabIndex: config.tabIndex,
    onFocus: config.onFocus,
    onBlur: config.onBlur,
  };

  // Register with accessibility layer
  useEffect(() => {
    if (!accessibility || config.points.length < 3) return;

    const hasInteraction =
      config.onClick ||
      config.onPointerDown ||
      config.onPointerUp;

    const cfg = accessibilityConfigRef.current;

    if (!hasInteraction && !cfg.ariaLabel) return;

    accessibility.register({
      id: idRef.current,
      points: config.points,
      ariaLabel: cfg.ariaLabel,
      role: cfg.role ?? (config.onClick ? "button" : undefined),
      disabled: cfg.disabled,
      pressed: cfg.pressed,
      checked: cfg.checked,
      tabIndex: cfg.tabIndex ?? (hasInteraction ? 0 : undefined),
      onClick: (e: InteractionEvent) => callbacksRef.current.onClick?.(e),
      onFocus: () => accessibilityConfigRef.current.onFocus?.(),
      onBlur: () => accessibilityConfigRef.current.onBlur?.(),
    });

    return () => {
      accessibility.unregister(idRef.current);
    };
  }, [
    accessibility,
    pointsKey,
    config.ariaLabel,
    config.role,
    config.disabled,
    config.pressed,
    config.checked,
    config.tabIndex,
    // Note: We don't include callbacks here - they're accessed via refs
  ]);

  const focus = useCallback(() => {
    accessibility?.focus(idRef.current);
  }, [accessibility]);

  const updatePoints = useCallback(
    (points: Position[]) => {
      if (!twoContext?.interaction || points.length < 3) return;

      const region = new HitRegion({
        id: idRef.current,
        points,
      });

      regionRef.current = region;
      twoContext.interaction.updateRegion(region);
      accessibility?.updateBounds(idRef.current, points);
    },
    [twoContext, accessibility]
  );

  return {
    id: idRef.current,
    focus,
    updatePoints,
  };
}
