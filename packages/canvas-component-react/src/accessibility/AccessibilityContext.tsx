import React, {
  createContext,
  useCallback,
  useRef,
  useState,
  useMemo,
  ReactNode,
  CSSProperties,
} from "react";
import { Position, calculateAABB, InteractionEvent } from "@canvas-component/core";

export interface AccessibleElement {
  id: string;
  points: Position[];
  ariaLabel?: string;
  role?: string;
  disabled?: boolean;
  pressed?: boolean;
  checked?: boolean;
  tabIndex?: number;
  onClick?: (event: InteractionEvent) => void;
}

export interface AccessibilityContextValue {
  register: (element: AccessibleElement) => void;
  unregister: (id: string) => void;
  focus: (id: string) => void;
  updateBounds: (id: string, points: Position[]) => void;
}

export const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);

interface AccessibilityLayerProps {
  children: ReactNode;
  canvasRef: HTMLCanvasElement | null;
}

/**
 * AccessibilityLayer creates hidden DOM elements that overlay the canvas
 * to provide screen reader support and keyboard navigation.
 *
 * Each interactive shape gets a focusable element positioned over its bounds.
 * These elements are visually hidden but accessible to assistive technologies.
 */
// Helper to serialize points for comparison
function serializePoints(points: Position[]): string {
  return points.map(p => `${p.x},${p.y}`).join('|');
}

export function AccessibilityLayer({
  children,
  canvasRef,
}: AccessibilityLayerProps) {
  // Store elements in a ref to avoid triggering re-renders on every update
  const elementsRef = useRef<Map<string, AccessibleElement>>(new Map());
  // Use a version counter to trigger re-renders only when needed
  const [version, setVersion] = useState(0);
  const elementRefs = useRef<Map<string, HTMLElement>>(new Map());

  const register = useCallback((element: AccessibleElement) => {
    const existing = elementsRef.current.get(element.id);

    // Only update ref and trigger re-render if element is new or has meaningful changes
    if (existing) {
      const isSame =
        existing.ariaLabel === element.ariaLabel &&
        existing.role === element.role &&
        existing.disabled === element.disabled &&
        existing.pressed === element.pressed &&
        existing.checked === element.checked &&
        existing.tabIndex === element.tabIndex &&
        serializePoints(existing.points) === serializePoints(element.points);

      if (isSame) {
        // Only update the onClick ref without triggering re-render
        existing.onClick = element.onClick;
        return;
      }
    }

    // Element is new or changed, update ref and trigger re-render
    elementsRef.current.set(element.id, element);
    setVersion(v => v + 1);
  }, []);

  const unregister = useCallback((id: string) => {
    if (elementsRef.current.has(id)) {
      elementsRef.current.delete(id);
      elementRefs.current.delete(id);
      setVersion(v => v + 1);
    }
  }, []);

  const focus = useCallback((id: string) => {
    const el = elementRefs.current.get(id);
    if (el) {
      el.focus();
    }
  }, []);

  const updateBounds = useCallback((id: string, points: Position[]) => {
    const existing = elementsRef.current.get(id);
    if (!existing) return;

    // Only trigger re-render if points actually changed
    if (serializePoints(existing.points) === serializePoints(points)) {
      return;
    }

    elementsRef.current.set(id, { ...existing, points });
    setVersion(v => v + 1);
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<AccessibilityContextValue>(
    () => ({
      register,
      unregister,
      focus,
      updateBounds,
    }),
    [register, unregister, focus, updateBounds]
  );

  // Calculate position relative to canvas
  const getElementStyle = useCallback(
    (element: AccessibleElement): CSSProperties => {
      if (!canvasRef) {
        return { display: "none" };
      }

      const bounds = calculateAABB(element.points);
      const canvasRect = canvasRef.getBoundingClientRect();

      // Scale from canvas coordinates to viewport coordinates
      const scaleX = canvasRect.width / canvasRef.width;
      const scaleY = canvasRect.height / canvasRef.height;

      return {
        position: "absolute",
        left: bounds.minX * scaleX,
        top: bounds.minY * scaleY,
        width: (bounds.maxX - bounds.minX) * scaleX,
        height: (bounds.maxY - bounds.minY) * scaleY,
        // Visually hidden but accessible
        opacity: 0,
        pointerEvents: "none",
        // Make focusable elements visible when focused
        outline: "none",
      };
    },
    [canvasRef]
  );

  // Handle keyboard activation
  const handleKeyDown = useCallback(
    (element: AccessibleElement) => (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (element.onClick && !element.disabled) {
          // Create a synthetic interaction event
          const bounds = calculateAABB(element.points);
          const center: Position = {
            x: (bounds.minX + bounds.maxX) / 2,
            y: (bounds.minY + bounds.maxY) / 2,
          };

          element.onClick({
            type: "click",
            position: center,
            target: {
              id: element.id,
              points: element.points,
              bounds,
              containsPoint: () => true,
              getCenter: () => center,
            },
            originalEvent: event.nativeEvent as unknown as MouseEvent,
          });
        }
      }
    },
    []
  );

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      {canvasRef && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
          aria-hidden="false"
        >
          {Array.from(elementsRef.current.values()).map((element) => {
            const ElementTag = element.role === "link" ? "a" : "button";

            return (
              <ElementTag
                key={element.id}
                ref={(el: HTMLButtonElement | HTMLAnchorElement | null) => {
                  if (el) {
                    elementRefs.current.set(element.id, el);
                  }
                }}
                style={{
                  ...getElementStyle(element),
                  // pointerEvents: "none" lets mouse clicks pass through to canvas
                  // InteractionManager handles canvas hit detection
                  // These elements are for keyboard/screen reader access only
                  pointerEvents: "none",
                  background: "transparent",
                  border: "none",
                  cursor: "default",
                }}
                role={element.role || "button"}
                aria-label={element.ariaLabel}
                aria-disabled={element.disabled}
                aria-pressed={element.pressed}
                aria-checked={element.checked}
                tabIndex={element.disabled ? -1 : (element.tabIndex ?? 0)}
                onKeyDown={handleKeyDown(element)}
                onFocus={(e) => {
                  // Make visible when focused for keyboard users
                  e.currentTarget.style.outline = "2px solid #4A90D9";
                  e.currentTarget.style.outlineOffset = "2px";
                  e.currentTarget.style.opacity = "0.1";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                  e.currentTarget.style.opacity = "0";
                }}
              />
            );
          })}
        </div>
      )}
    </AccessibilityContext.Provider>
  );
}
