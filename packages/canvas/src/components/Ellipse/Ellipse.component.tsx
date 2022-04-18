import React from "react";

import { useEllipse } from "./Ellipse.hooks";
import { EllipseArgs } from "./Ellipse.types";

export function Ellipse(props: EllipseArgs) {
  useEllipse(props);

  return null;
}
