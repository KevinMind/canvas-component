import { DrawingArguments } from "./RenderFrame.types";

export function degreesToRadians(degrees: number) {
  if (degrees > 360 || degrees < 0) {
    throw new Error("invalid argument degrees. expecting number between 0-360");
  }
  return degrees * (Math.PI / 180);
}

export function throwCanvasContext() {
  throw new Error(
    "this function must be called within a <RenderFrameProvider> component scope"
  );
}

interface MakeDrawing<A> {
  (c: CanvasRenderingContext2D, args: A): void
}

export function createDrawing<A extends DrawingArguments>(makeDrawing: MakeDrawing<A>) {
  return (ctx: CanvasRenderingContext2D, args: A) => {
    ctx.beginPath();

    if (args.fillStyle) {
      ctx.fillStyle = args.fillStyle;
    }

    makeDrawing(ctx, args);

    ctx.stroke();

    if (args.fillStyle) {
      ctx.fill();
    }

  }
}
