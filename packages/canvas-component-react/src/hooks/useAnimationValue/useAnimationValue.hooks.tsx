import { useRef, useEffect } from 'react';

import {
  AnimationValue,
  AnimationValueConfig,
  AnimationValueHandle,
} from '../../animation/AnimationValue';

/**
 * useAnimationValue - Zero re-render animation hook
 *
 * Unlike useAnimationFrame which triggers React state updates every frame,
 * useAnimationValue stores animation values in refs and never causes re-renders.
 *
 * Access the current value via handle.getValue() inside draw functions.
 *
 * @example
 * ```tsx
 * function AnimatedCircle() {
 *   const radius = useAnimationValue({
 *     from: 10, to: 100, duration: 1000, auto: true, infinite: true
 *   });
 *
 *   useRenderFrame(
 *     (propsRef) => (ctx) => drawRect(ctx, {
 *       center: {x: 100, y: 100},
 *       width: radius.getValue(),
 *       height: radius.getValue(),
 *     }),
 *     null
 *   );
 *   return null;
 * }
 * ```
 */
export function useAnimationValue(config: AnimationValueConfig): AnimationValueHandle {
  const animationRef = useRef<AnimationValue | null>(null);

  // Create animation instance once
  if (animationRef.current === null) {
    animationRef.current = new AnimationValue(config);
  }

  // Update config when it changes (without recreating)
  const configRef = useRef(config);
  useEffect(() => {
    if (animationRef.current && configRef.current !== config) {
      animationRef.current.updateConfig(config);
      configRef.current = config;
    }
  }, [config]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      animationRef.current?.destroy();
    };
  }, []);

  // Return stable handle (created once)
  const handleRef = useRef<AnimationValueHandle | null>(null);
  if (handleRef.current === null) {
    handleRef.current = animationRef.current.getHandle();
  }

  return handleRef.current;
}
