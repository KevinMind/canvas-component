import { TextArgs } from "./Text.types";
import { createDrawing } from "../../createDrawing.utilities";

export const drawText = createDrawing<TextArgs>((ctx, args) => {
  if (!args.fillStyle && !args.strokeStyle) {
    throw new Error("must provide either fillStyle or strokeStyle");
  }
  if (args.fillStyle && args.strokeStyle) {
    throw new Error("cannot provide both fillStyle and strokeStyle");
  }

  if (args.font) {
    ctx.font = args.font;
  }

  if (args.textAlign) {
    ctx.textAlign = args.textAlign;
  }

  if (args.textBaseline) {
    ctx.textBaseline = args.textBaseline;
  }

  if (args.fillStyle) {
    ctx.fillStyle = args.fillStyle;
    ctx.fillText(args.text, args.center.x, args.center.y, args.maxWidth);
  }
  if (args.strokeStyle) {
    ctx.strokeStyle = args.strokeStyle;
    ctx.strokeText(args.text, args.center.x, args.center.y, args.maxWidth);
  }
});
