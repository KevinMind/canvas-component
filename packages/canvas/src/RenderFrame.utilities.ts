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
