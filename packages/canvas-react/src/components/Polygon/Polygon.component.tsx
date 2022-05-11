import React from "react";

import { usePolygon } from "./Polygon.hooks";
import { PolygonArgs } from "./Polygon.types";

export function Polygon(props: PolygonArgs) {
  usePolygon(props);

  return null;
}
