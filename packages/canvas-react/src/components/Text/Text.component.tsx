import React from "react";

import { useText } from "./Text.hooks";
import { TextProps } from "./Text.types";

export function Text(props: TextProps) {
  useText(props);

  return null;
}
