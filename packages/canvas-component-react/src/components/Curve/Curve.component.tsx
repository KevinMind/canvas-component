import React from "react";

import { useCurve } from "./Curve.hooks";

export function Curve(props: Parameters<typeof useCurve>[0]) {
  useCurve(props);

  return null;
}
