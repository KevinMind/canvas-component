import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractionManager, InteractionEvent } from './InteractionManager';
import { HitRegion } from './HitRegion';

// Polyfill PointerEvent for jsdom
class MockPointerEvent extends MouseEvent {
  readonly pointerId: number;
  readonly width: number;
  readonly height: number;
  readonly pressure: number;
  readonly tangentialPressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly twist: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;

  constructor(type: string, params: PointerEventInit = {}) {
    super(type, params);
    this.pointerId = params.pointerId ?? 0;
    this.width = params.width ?? 1;
    this.height = params.height ?? 1;
    this.pressure = params.pressure ?? 0;
    this.tangentialPressure = params.tangentialPressure ?? 0;
    this.tiltX = params.tiltX ?? 0;
    this.tiltY = params.tiltY ?? 0;
    this.twist = params.twist ?? 0;
    this.pointerType = params.pointerType ?? '';
    this.isPrimary = params.isPrimary ?? false;
  }

  getCoalescedEvents(): PointerEvent[] {
    return [];
  }

  getPredictedEvents(): PointerEvent[] {
    return [];
  }
}

// Add to global if not present
if (typeof PointerEvent === 'undefined') {
  (global as any).PointerEvent = MockPointerEvent;
}

// Mock canvas element
function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;

  // Mock getBoundingClientRect
  canvas.getBoundingClientRect = vi.fn(() => ({
    left: 0,
    top: 0,
    width: 400,
    height: 300,
    right: 400,
    bottom: 300,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }));

  return canvas;
}

// Create mock mouse event
function createMouseEvent(type: string, clientX: number, clientY: number): MouseEvent {
  return new MouseEvent(type, {
    clientX,
    clientY,
    bubbles: true,
  });
}

// Create mock pointer event
function createPointerEvent(type: string, clientX: number, clientY: number): PointerEvent {
  return new PointerEvent(type, {
    clientX,
    clientY,
    bubbles: true,
  });
}

describe('InteractionManager', () => {
  let canvas: HTMLCanvasElement;
  let manager: InteractionManager;

  beforeEach(() => {
    canvas = createMockCanvas();
    document.body.appendChild(canvas);
    manager = new InteractionManager(canvas);
  });

  afterEach(() => {
    manager.destroy();
    canvas.remove();
  });

  describe('register and unregister', () => {
    it('registers a hit region', () => {
      const region = new HitRegion({
        id: 'test-region',
        points: [
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 150, y: 150 },
          { x: 50, y: 150 },
        ],
      });

      const onClick = vi.fn();
      manager.register(region, { click: onClick });

      // Simulate click inside region
      canvas.dispatchEvent(createMouseEvent('click', 100, 100));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('unregisters a hit region', () => {
      const region = new HitRegion({
        id: 'test-region',
        points: [
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 150, y: 150 },
          { x: 50, y: 150 },
        ],
      });

      const onClick = vi.fn();
      manager.register(region, { click: onClick });
      manager.unregister('test-region');

      // Simulate click - should not fire
      canvas.dispatchEvent(createMouseEvent('click', 100, 100));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('click events', () => {
    it('fires click handler when clicking inside region', () => {
      const region = new HitRegion({
        id: 'clickable',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onClick = vi.fn();
      manager.register(region, { click: onClick });

      canvas.dispatchEvent(createMouseEvent('click', 50, 50));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: region,
        })
      );
    });

    it('does not fire click handler when clicking outside region', () => {
      const region = new HitRegion({
        id: 'clickable',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onClick = vi.fn();
      manager.register(region, { click: onClick });

      canvas.dispatchEvent(createMouseEvent('click', 200, 200));

      expect(onClick).not.toHaveBeenCalled();
    });

    it('provides correct position in event', () => {
      const region = new HitRegion({
        id: 'clickable',
        points: [
          { x: 0, y: 0 },
          { x: 200, y: 0 },
          { x: 200, y: 200 },
          { x: 0, y: 200 },
        ],
      });

      let receivedEvent: InteractionEvent | null = null;
      manager.register(region, {
        click: (event) => {
          receivedEvent = event;
        },
      });

      canvas.dispatchEvent(createMouseEvent('click', 75, 125));

      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent!.position).toEqual({ x: 75, y: 125 });
    });
  });

  describe('pointer events', () => {
    it('fires pointerdown handler', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onPointerDown = vi.fn();
      manager.register(region, { pointerdown: onPointerDown });

      canvas.dispatchEvent(createPointerEvent('pointerdown', 50, 50));

      expect(onPointerDown).toHaveBeenCalledTimes(1);
    });

    it('fires pointerup handler', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onPointerUp = vi.fn();
      manager.register(region, { pointerup: onPointerUp });

      canvas.dispatchEvent(createPointerEvent('pointerup', 50, 50));

      expect(onPointerUp).toHaveBeenCalledTimes(1);
    });

    it('fires pointermove handler', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onPointerMove = vi.fn();
      manager.register(region, { pointermove: onPointerMove });

      canvas.dispatchEvent(createPointerEvent('pointermove', 50, 50));

      expect(onPointerMove).toHaveBeenCalledTimes(1);
    });
  });

  describe('pointer enter/leave', () => {
    it('fires pointerenter when entering region', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 150, y: 150 },
          { x: 50, y: 150 },
        ],
      });

      const onEnter = vi.fn();
      manager.register(region, { pointerenter: onEnter });

      // Move outside first
      canvas.dispatchEvent(createPointerEvent('pointermove', 10, 10));
      expect(onEnter).not.toHaveBeenCalled();

      // Move inside
      canvas.dispatchEvent(createPointerEvent('pointermove', 100, 100));
      expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it('fires pointerleave when leaving region', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 150, y: 150 },
          { x: 50, y: 150 },
        ],
      });

      const onLeave = vi.fn();
      manager.register(region, { pointerleave: onLeave });

      // Move inside first
      canvas.dispatchEvent(createPointerEvent('pointermove', 100, 100));
      expect(onLeave).not.toHaveBeenCalled();

      // Move outside
      canvas.dispatchEvent(createPointerEvent('pointermove', 10, 10));
      expect(onLeave).toHaveBeenCalledTimes(1);
    });

    it('does not fire duplicate enter events', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onEnter = vi.fn();
      manager.register(region, { pointerenter: onEnter });

      // Move inside multiple times
      canvas.dispatchEvent(createPointerEvent('pointermove', 25, 25));
      canvas.dispatchEvent(createPointerEvent('pointermove', 50, 50));
      canvas.dispatchEvent(createPointerEvent('pointermove', 75, 75));

      expect(onEnter).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRegionAtPoint', () => {
    it('returns null when no region at point', () => {
      expect(manager.getRegionAtPoint({ x: 100, y: 100 })).toBeNull();
    });

    it('returns region when point is inside', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      manager.register(region, {});

      expect(manager.getRegionAtPoint({ x: 50, y: 50 })).toBe(region);
    });

    it('returns topmost region when overlapping', () => {
      const bottomRegion = new HitRegion({
        id: 'bottom',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const topRegion = new HitRegion({
        id: 'top',
        points: [
          { x: 25, y: 25 },
          { x: 75, y: 25 },
          { x: 75, y: 75 },
          { x: 25, y: 75 },
        ],
      });

      manager.register(bottomRegion, {});
      manager.register(topRegion, {});

      // Point inside both - should return top (last registered)
      expect(manager.getRegionAtPoint({ x: 50, y: 50 })).toBe(topRegion);

      // Point inside only bottom
      expect(manager.getRegionAtPoint({ x: 10, y: 10 })).toBe(bottomRegion);
    });
  });

  describe('getAllRegionsAtPoint', () => {
    it('returns empty array when no regions at point', () => {
      expect(manager.getAllRegionsAtPoint({ x: 100, y: 100 })).toEqual([]);
    });

    it('returns all overlapping regions', () => {
      const region1 = new HitRegion({
        id: 'region1',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const region2 = new HitRegion({
        id: 'region2',
        points: [
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 150, y: 150 },
          { x: 50, y: 150 },
        ],
      });

      manager.register(region1, {});
      manager.register(region2, {});

      const hits = manager.getAllRegionsAtPoint({ x: 75, y: 75 });
      expect(hits).toHaveLength(2);
      expect(hits).toContain(region1);
      expect(hits).toContain(region2);
    });
  });

  describe('updateRegion', () => {
    it('updates region geometry', () => {
      const originalRegion = new HitRegion({
        id: 'movable',
        points: [
          { x: 0, y: 0 },
          { x: 50, y: 0 },
          { x: 50, y: 50 },
          { x: 0, y: 50 },
        ],
      });

      const onClick = vi.fn();
      manager.register(originalRegion, { click: onClick });

      // Click at new position - should not fire
      canvas.dispatchEvent(createMouseEvent('click', 150, 150));
      expect(onClick).not.toHaveBeenCalled();

      // Update region to new position
      const movedRegion = new HitRegion({
        id: 'movable',
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 200, y: 200 },
          { x: 100, y: 200 },
        ],
      });
      manager.updateRegion(movedRegion);

      // Click at new position - should fire now
      canvas.dispatchEvent(createMouseEvent('click', 150, 150));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    it('removes all event listeners', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      const onClick = vi.fn();
      manager.register(region, { click: onClick });

      manager.destroy();

      // Should not fire after destroy
      canvas.dispatchEvent(createMouseEvent('click', 50, 50));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('clears all registered regions', () => {
      const region = new HitRegion({
        id: 'test',
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      });

      manager.register(region, {});
      manager.destroy();

      expect(manager.getRegionAtPoint({ x: 50, y: 50 })).toBeNull();
    });
  });
});
