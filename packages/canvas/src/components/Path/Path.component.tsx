import React from "react";

import { usePath } from "./Path.hooks";
import { PathProps } from "./Path.types";

export function Path(props: PathProps) {
  usePath(props);

  return null;
}
