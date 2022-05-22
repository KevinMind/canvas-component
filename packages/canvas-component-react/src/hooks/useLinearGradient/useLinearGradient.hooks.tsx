import { CreateLinearGradientArgs } from "@canvas-component/core";
import { useCanvas } from "../../RenderFrame.hooks";

export function useLinearGradient(args: CreateLinearGradientArgs): CanvasGradient | undefined {
  const context = useCanvas();

  if (!context) return;

  return context.createLinearGradient(args);
}