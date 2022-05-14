import React from "react";

import { useArcTo } from "./ArcTo.hooks";

export function ArcTo(props: Parameters<typeof useArcTo>[0]) {
  useArcTo(props);

  return null;
}
