import React from "react";

import { useBox } from "./Box.hooks";
import { BoxArgs } from "./Box.types";

export function Box(props: BoxArgs) {
  useBox(props);

  return null;
}
