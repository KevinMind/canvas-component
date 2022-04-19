import React from "react";

import { useRect } from "../../components/Rect/Rect.hooks";

import { FilterProps } from "./Filter.types";

export function Filter(props: FilterProps) {
  useRect(props);

  return null;
}
