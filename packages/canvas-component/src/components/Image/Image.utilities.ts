import { createDrawing } from "../../createDrawing.utilities";

import { ImageArgs } from "./Image.types";

export const drawImage = createDrawing<ImageArgs>((ctx, args) => {
  ctx.imageSmoothingEnabled = args.smooth ?? false;

  const imageWidth =
    typeof args.image.width === "number"
      ? args.image.width
      : args.image.width.animVal.value;
  const imageHeight =
    typeof args.image.height === "number"
      ? args.image.height
      : args.image.height.animVal.value;

  const centerX = args.center.x - imageWidth / 2;
  const centerY = args.center.y - imageHeight / 2;

  if ("sx" in args) {
    // complex image
    ctx.drawImage(
      args.image,
      args.sx,
      args.sy,
      args.sWidth,
      args.sHeight,
      centerX,
      centerY,
      args.dWidth,
      args.dHeight
    );
  } else if ("dWidth" in args) {
    // simple image
    ctx.drawImage(args.image, centerX, centerY, args.dWidth, args.dHeight);
  } else {
    // basic image
    ctx.drawImage(args.image, centerX, centerY);
  }
});
