import { CreateConicGradientArgs } from "@canvas-component/core";
import { useCanvas } from "../../RenderFrame.hooks";

export function useConicGradient(args: CreateConicGradientArgs): CanvasGradient | undefined {
  const context = useCanvas();

  if (!context) return;

  return context.createConicGradient(args);
}
