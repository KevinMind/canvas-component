import React from "react";

import { useEllipse } from "./Ellipse.hooks";

export function Ellipse(props: Parameters<typeof useEllipse>[0]) {
  useEllipse(props);

  return null;
}
