export function throwCanvasContext() {
  throw new Error(
    "this function must be called within a <RenderFrameProvider> component scope"
  );
}

