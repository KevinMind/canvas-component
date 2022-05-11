import React from "react";

import { useRect } from "./Rect.hooks";
import { RectArgs } from "./Rect.types";

export function Rect(props: RectArgs) {
  useRect(props);

  return null;
}
