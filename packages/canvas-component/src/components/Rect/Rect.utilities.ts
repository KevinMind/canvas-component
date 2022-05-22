import { Position } from '../../createDrawing.types';
import { createDrawing } from '../../createDrawing.utilities';

import { RectArgs } from './Rect.types'; 

export const drawRect = createDrawing<RectArgs>((ctx, args) => {
  const start: Position = {
    x: args.center.x - args.width / 2,
    y: args.center.y - args.height / 2,
  };

  const x = start.x;
  const y = start.y;
  const w = args.width;
  const h = args.height;
  const r = Math.min(args.borderRadius || 0, Math.min(args.width, args.height) / 2);

  ctx.moveTo(start.x + r, start.y);

  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
});
