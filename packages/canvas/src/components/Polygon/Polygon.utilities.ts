import { PolygonArgs } from "./Polygon.types";

export function drawPolygon(ctx: CanvasRenderingContext2D, {pos: {x, y}, sides, size}: PolygonArgs) {
  const isCustomPolygon = Array.isArray(sides);
  const numSides = isCustomPolygon ? sides.length : sides;
  
  if (numSides < 3) {
    throw new Error('polygon must contain at least 3 sides');
  }

  ctx.beginPath();
  
  if (isCustomPolygon) {
    const [first, ...rest] = sides;

    ctx.lineTo(first.x, first.y);

    for (let pos of rest) {
      ctx.lineTo(pos.x, pos.y);
    }

    ctx.lineTo(first.x, first.y);
  } else {
    ctx.moveTo (x +  size * Math.cos(0), y +  size *  Math.sin(0));
    
    for (let i = 1; i <= sides; i += 1) {
      const offset = i * 2 * Math.PI / sides;
      const xTranslation = size * Math.cos(offset);
      const yTranslation = size * Math.sin(offset);
  
      ctx.lineTo (x + xTranslation, y + yTranslation);
    }
  }

  ctx.stroke();
}