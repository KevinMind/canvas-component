import React from "react";

import { useLine } from "./Line.hooks";

export function Line(props: Parameters<typeof useLine>[0]) {
  useLine(props);

  return null;
}
