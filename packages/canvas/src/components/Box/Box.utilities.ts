import { BoxArgs } from './Box.types'; 

import { degreesToRadians } from '../../RenderFrame.utilities';

export function drawBox(ctx: CanvasRenderingContext2D, {width, height, pos: {x, y}, rotation}: BoxArgs) {
  if (rotation > 0) {
    ctx.translate(x, y);
    ctx.rotate(degreesToRadians(rotation));
    ctx.strokeRect( -(width / 2), -(height / 2), width, height);
  } else {
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
  }
  
}