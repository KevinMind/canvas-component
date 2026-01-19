import { describe, it, expect } from 'vitest';
import { HitRegion, pointInPolygon, pointInAABB, calculateAABB, expandAABB, AABB } from './HitRegion';

describe('pointInPolygon', () => {
  const square = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  it('returns true for point inside polygon', () => {
    expect(pointInPolygon({ x: 50, y: 50 }, square)).toBe(true);
  });

  it('returns true for point at center', () => {
    expect(pointInPolygon({ x: 50, y: 50 }, square)).toBe(true);
  });

  it('returns false for point outside polygon', () => {
    expect(pointInPolygon({ x: 150, y: 50 }, square)).toBe(false);
    expect(pointInPolygon({ x: -10, y: 50 }, square)).toBe(false);
    expect(pointInPolygon({ x: 50, y: 150 }, square)).toBe(false);
    expect(pointInPolygon({ x: 50, y: -10 }, square)).toBe(false);
  });

  it('works with triangles', () => {
    const triangle = [
      { x: 50, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    expect(pointInPolygon({ x: 50, y: 50 }, triangle)).toBe(true);
    expect(pointInPolygon({ x: 10, y: 10 }, triangle)).toBe(false);
  });

  it('works with complex polygons', () => {
    const hexagon = Array.from({ length: 6 }, (_, i) => ({
      x: 50 + Math.cos((i / 6) * Math.PI * 2) * 50,
      y: 50 + Math.sin((i / 6) * Math.PI * 2) * 50,
    }));
    expect(pointInPolygon({ x: 50, y: 50 }, hexagon)).toBe(true);
    expect(pointInPolygon({ x: 200, y: 200 }, hexagon)).toBe(false);
  });
});

describe('pointInAABB', () => {
  const bounds: AABB = { minX: 0, minY: 0, maxX: 100, maxY: 100 };

  it('returns true for point inside bounds', () => {
    expect(pointInAABB({ x: 50, y: 50 }, bounds)).toBe(true);
  });

  it('returns true for point on edge', () => {
    expect(pointInAABB({ x: 0, y: 50 }, bounds)).toBe(true);
    expect(pointInAABB({ x: 100, y: 50 }, bounds)).toBe(true);
    expect(pointInAABB({ x: 50, y: 0 }, bounds)).toBe(true);
    expect(pointInAABB({ x: 50, y: 100 }, bounds)).toBe(true);
  });

  it('returns false for point outside bounds', () => {
    expect(pointInAABB({ x: -1, y: 50 }, bounds)).toBe(false);
    expect(pointInAABB({ x: 101, y: 50 }, bounds)).toBe(false);
    expect(pointInAABB({ x: 50, y: -1 }, bounds)).toBe(false);
    expect(pointInAABB({ x: 50, y: 101 }, bounds)).toBe(false);
  });
});

describe('calculateAABB', () => {
  it('calculates bounding box for square', () => {
    const points = [
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 90, y: 90 },
      { x: 10, y: 90 },
    ];
    expect(calculateAABB(points)).toEqual({
      minX: 10,
      minY: 10,
      maxX: 90,
      maxY: 90,
    });
  });

  it('calculates bounding box for irregular polygon', () => {
    const points = [
      { x: 25, y: 50 },
      { x: 75, y: 10 },
      { x: 100, y: 80 },
      { x: 50, y: 100 },
    ];
    expect(calculateAABB(points)).toEqual({
      minX: 25,
      minY: 10,
      maxX: 100,
      maxY: 100,
    });
  });

  it('returns zeros for empty array', () => {
    expect(calculateAABB([])).toEqual({
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
    });
  });
});

describe('expandAABB', () => {
  it('expands bounds by padding', () => {
    const bounds: AABB = { minX: 10, minY: 10, maxX: 90, maxY: 90 };
    expect(expandAABB(bounds, 5)).toEqual({
      minX: 5,
      minY: 5,
      maxX: 95,
      maxY: 95,
    });
  });

  it('handles negative padding (shrink)', () => {
    const bounds: AABB = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    expect(expandAABB(bounds, -10)).toEqual({
      minX: 10,
      minY: 10,
      maxX: 90,
      maxY: 90,
    });
  });
});

describe('HitRegion', () => {
  const squarePoints = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  it('creates region with auto-calculated bounds', () => {
    const region = new HitRegion({
      id: 'test',
      points: squarePoints,
    });

    expect(region.id).toBe('test');
    expect(region.points).toEqual(squarePoints);
    expect(region.bounds).toEqual({
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
    });
  });

  it('uses provided bounds if given', () => {
    const customBounds = { minX: -10, minY: -10, maxX: 110, maxY: 110 };
    const region = new HitRegion({
      id: 'test',
      points: squarePoints,
      bounds: customBounds,
    });

    expect(region.bounds).toEqual(customBounds);
  });

  describe('containsPoint', () => {
    const region = new HitRegion({
      id: 'test',
      points: squarePoints,
    });

    it('returns true for point inside region', () => {
      expect(region.containsPoint({ x: 50, y: 50 })).toBe(true);
    });

    it('returns false for point outside region', () => {
      expect(region.containsPoint({ x: 150, y: 50 })).toBe(false);
    });

    it('quickly rejects points outside AABB', () => {
      // This should fail the AABB check before running polygon test
      expect(region.containsPoint({ x: 200, y: 200 })).toBe(false);
    });
  });

  describe('getCenter', () => {
    it('returns center of bounding box', () => {
      const region = new HitRegion({
        id: 'test',
        points: squarePoints,
      });

      expect(region.getCenter()).toEqual({ x: 50, y: 50 });
    });

    it('works with offset region', () => {
      const offsetPoints = [
        { x: 50, y: 50 },
        { x: 150, y: 50 },
        { x: 150, y: 150 },
        { x: 50, y: 150 },
      ];
      const region = new HitRegion({
        id: 'test',
        points: offsetPoints,
      });

      expect(region.getCenter()).toEqual({ x: 100, y: 100 });
    });
  });
});
