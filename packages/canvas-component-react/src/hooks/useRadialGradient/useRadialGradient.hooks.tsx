import { CreateRadialGradientArgs } from "@canvas-component/core";
import { useCanvas } from "../../RenderFrame.hooks";

export function useRadialGradient(args: CreateRadialGradientArgs): CanvasGradient | undefined {
  const context = useCanvas();

  if (!context) return;

  return context.createRadialGradient(args);
}