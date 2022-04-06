import React from "react";

import { useCircle } from "./Circle.hooks";
import { CircleArgs } from "./Circle.types";

export function Circle(props: CircleArgs) {
  useCircle(props);

  return null;
}
