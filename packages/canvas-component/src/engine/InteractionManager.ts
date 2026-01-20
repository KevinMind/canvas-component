import { Position } from "../createDrawing.types";
import { HitRegion } from "./HitRegion";

export type InteractionEventType =
  | "click"
  | "pointerdown"
  | "pointerup"
  | "pointermove"
  | "pointerenter"
  | "pointerleave";

export interface InteractionEvent {
  type: InteractionEventType;
  position: Position;
  target: HitRegion;
  originalEvent: MouseEvent | PointerEvent;
}

export type InteractionHandler = (event: InteractionEvent) => void;

interface RegisteredRegion {
  region: HitRegion;
  handlers: Map<InteractionEventType, InteractionHandler>;
}

/**
 * InteractionManager handles mouse/pointer events on the canvas
 * and dispatches them to registered hit regions.
 */
export class InteractionManager {
  private canvas: HTMLCanvasElement;
  private regions: Map<string, RegisteredRegion> = new Map();
  private hoveredRegion: HitRegion | null = null;
  private boundHandlers: Map<string, EventListener> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.attachListeners();
  }

  /**
   * Register a hit region with event handlers.
   */
  register(
    region: HitRegion,
    handlers: Partial<Record<InteractionEventType, InteractionHandler>>
  ): void {
    const handlerMap = new Map<InteractionEventType, InteractionHandler>();

    for (const [type, handler] of Object.entries(handlers)) {
      if (handler) {
        handlerMap.set(type as InteractionEventType, handler);
      }
    }

    this.regions.set(region.id, { region, handlers: handlerMap });
  }

  /**
   * Unregister a hit region.
   */
  unregister(regionId: string): void {
    this.regions.delete(regionId);

    if (this.hoveredRegion?.id === regionId) {
      this.hoveredRegion = null;
    }
  }

  /**
   * Update an existing region's geometry (e.g., when shape moves).
   */
  updateRegion(region: HitRegion): void {
    const existing = this.regions.get(region.id);
    if (existing) {
      existing.region = region;
    }
  }

  /**
   * Get the topmost region at a given point.
   * Iterates in reverse order (last registered = on top).
   */
  getRegionAtPoint(point: Position): HitRegion | null {
    const entries = Array.from(this.regions.values());

    // Check in reverse order (last added = topmost)
    for (let i = entries.length - 1; i >= 0; i--) {
      const { region } = entries[i];
      if (region.containsPoint(point)) {
        return region;
      }
    }

    return null;
  }

  /**
   * Get all regions at a given point (for overlapping shapes).
   */
  getAllRegionsAtPoint(point: Position): HitRegion[] {
    const hits: HitRegion[] = [];

    for (const { region } of this.regions.values()) {
      if (region.containsPoint(point)) {
        hits.push(region);
      }
    }

    return hits;
  }

  /**
   * Clean up event listeners.
   */
  destroy(): void {
    this.detachListeners();
    this.regions.clear();
    this.hoveredRegion = null;
  }

  private attachListeners(): void {
    const onClick = this.handleClick.bind(this) as EventListener;
    const onPointerDown = this.handlePointerDown.bind(this) as EventListener;
    const onPointerUp = this.handlePointerUp.bind(this) as EventListener;
    const onPointerMove = this.handlePointerMove.bind(this) as EventListener;

    this.canvas.addEventListener("click", onClick);
    this.canvas.addEventListener("pointerdown", onPointerDown);
    this.canvas.addEventListener("pointerup", onPointerUp);
    this.canvas.addEventListener("pointermove", onPointerMove);

    this.boundHandlers.set("click", onClick);
    this.boundHandlers.set("pointerdown", onPointerDown);
    this.boundHandlers.set("pointerup", onPointerUp);
    this.boundHandlers.set("pointermove", onPointerMove);
  }

  private detachListeners(): void {
    for (const [type, handler] of this.boundHandlers) {
      this.canvas.removeEventListener(type, handler);
    }
    this.boundHandlers.clear();
  }

  private getCanvasPosition(event: MouseEvent | PointerEvent): Position {
    const rect = this.canvas.getBoundingClientRect();
    // Don't scale by DPI - hit regions are in logical coordinates (CSS pixels)
    // not in the canvas's internal resolution
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private dispatchEvent(
    type: InteractionEventType,
    region: HitRegion,
    position: Position,
    originalEvent: MouseEvent | PointerEvent
  ): void {
    const registered = this.regions.get(region.id);
    if (!registered) return;

    const handler = registered.handlers.get(type);
    if (handler) {
      handler({
        type,
        position,
        target: region,
        originalEvent,
      });
    }
  }

  private handleClick(event: MouseEvent): void {
    const position = this.getCanvasPosition(event);
    const region = this.getRegionAtPoint(position);

    if (region) {
      this.dispatchEvent("click", region, position, event);
    }
  }

  private handlePointerDown(event: PointerEvent): void {
    const position = this.getCanvasPosition(event);
    const region = this.getRegionAtPoint(position);

    if (region) {
      this.dispatchEvent("pointerdown", region, position, event);
    }
  }

  private handlePointerUp(event: PointerEvent): void {
    const position = this.getCanvasPosition(event);
    const region = this.getRegionAtPoint(position);

    if (region) {
      this.dispatchEvent("pointerup", region, position, event);
    }
  }

  private handlePointerMove(event: PointerEvent): void {
    const position = this.getCanvasPosition(event);
    const region = this.getRegionAtPoint(position);

    // Handle enter/leave
    if (region !== this.hoveredRegion) {
      if (this.hoveredRegion) {
        this.dispatchEvent("pointerleave", this.hoveredRegion, position, event);
      }

      if (region) {
        this.dispatchEvent("pointerenter", region, position, event);
      }

      this.hoveredRegion = region;
    }

    // Always dispatch move to current region
    if (region) {
      this.dispatchEvent("pointermove", region, position, event);
    }
  }
}
