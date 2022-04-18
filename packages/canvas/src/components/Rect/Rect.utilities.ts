import { degreesToRadians, createDrawing } from '../../RenderFrame.utilities';

import { RectArgs } from './Rect.types'; 

export const drawRect = createDrawing<RectArgs>((ctx, {width, height, pos: {x, y}, rotation}) => {
  if (rotation > 0) {
    ctx.translate(x, y);
    ctx.rotate(degreesToRadians(rotation));
    ctx.rect(-(width / 2), -(height / 2), width, height);
  } else {
    ctx.rect(x - width / 2, y - height / 2, width, height);
  }
});
