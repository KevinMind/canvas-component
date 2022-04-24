import { createDrawing } from "../../RenderFrame.utilities";

import { ImageProps } from "./Image.types";

export const drawImage = createDrawing<ImageProps>((ctx, args) => {  
  ctx.imageSmoothingEnabled = args.smooth ?? false;
  if ('sx' in args) {
    // complex image
    ctx.drawImage(args.image, args.sx, args.sy, args.sWidth, args.sHeight, args.dx, args.dy, args.dWidth, args.dHeight);
  } else if ('dWidth' in args) {
    // simple image
    ctx.drawImage(args.image, args.dx, args.dy, args.dWidth, args.dHeight);
  } else {
    // basic image
    ctx.drawImage(args.image, args.dx, args.dy);
  }
})