import React from "react";

import { usePolygon } from "./Polygon.hooks";

export function Polygon(props: Parameters<typeof usePolygon>[0]) {
  usePolygon(props);

  return null;
}
