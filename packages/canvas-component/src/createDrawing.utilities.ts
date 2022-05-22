import { BaseArgs, DrawingArguments } from "./createDrawing.types";

export function degreesToRadians(degrees: number) {
  if (degrees > 360 || degrees < 0) {
    throw new Error("invalid argument degrees. expecting number between 0-360");
  }
  return degrees * (Math.PI / 180);
}

// @TODO: fix hack making rotation required in the makeDrawing function because we set a default value.
interface MakeDrawing<A extends BaseArgs, R = void> {
  (c: CanvasRenderingContext2D, args: A & { rotation: number }): R;
}
export function createDrawing<A extends DrawingArguments, R = void>(
  makeDrawing: MakeDrawing<A, R>
) {
  return (ctx: CanvasRenderingContext2D, args: A) => {
    ctx.restore();
    ctx.beginPath();

    const rotation = args.rotation || 0;

    if (!!args.center && rotation > 0) {
      const { x, y } = args.center;
      ctx.translate(x, y);
      ctx.rotate(degreesToRadians(rotation));
      ctx.translate(-x, -y);
    }

    if (args.shadowColor) {
      ctx.shadowColor = args.shadowColor;

      if (args.shadowBlur) {
        ctx.shadowBlur = args.shadowBlur;
      }

      if (args.shadowOffsetX) {
        ctx.shadowOffsetX = args.shadowOffsetX;
      }

      if (args.shadowOffsetY) {
        ctx.shadowOffsetY = args.shadowOffsetY;
      }
    }

    if (args.lineDash) {
      ctx.setLineDash(args.lineDash);
    }

    if (args.lineDashOffset) {
      ctx.lineDashOffset = args.lineDashOffset;
    }

    if (args.lineCap) {
      ctx.lineCap = args.lineCap;
    }

    if (args.filter) {
      ctx.filter = args.filter;
    }

    if (args.strokeStyle) {
      ctx.strokeStyle = args.strokeStyle;
    }
    if (args.lineWidth) {
      ctx.lineWidth = args.lineWidth;
    }

    const result = makeDrawing(ctx, { ...args, rotation });

    ctx.stroke();

    if (args.fillStyle) {
      ctx.fillStyle = args.fillStyle;
      ctx.fill();
    }

    return result;
  };
}
