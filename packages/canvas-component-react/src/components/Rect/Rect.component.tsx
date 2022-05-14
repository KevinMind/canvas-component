import React from "react";

import { useRect } from "./Rect.hooks";

export function Rect(props: Parameters<typeof useRect>[0]) {
  useRect(props);

  return null;
}
