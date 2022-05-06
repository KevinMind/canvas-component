import { degreesToRadians, createDrawing } from '../../RenderFrame.utilities';

import { RectArgs } from './Rect.types'; 

export const drawRect = createDrawing<RectArgs>((ctx, {width, height, pos: {x, y}}) => {
  ctx.rect(x - width / 2, y - height / 2, width, height);
});
