import React from "react";

import { useRect } from "../../components/Rect/Rect.hooks";

import { ShadowProps } from "./Shadow.types";

export function Shadow(props: ShadowProps) {
  useRect(props);

  return null;
}
