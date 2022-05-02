import React from "react";

import { useLine } from "./Line.hooks";
import { LineArgs } from "./Line.types";

export function Line(props: LineArgs) {
  useLine(props);

  return null;
}
