import React from "react";

import { useCurve } from "./Curve.hooks";
import { CurveProps } from "./Curve.types";

export function Curve(props: CurveProps) {
  useCurve(props);

  return null;
}
