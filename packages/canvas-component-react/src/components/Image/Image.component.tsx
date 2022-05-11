import React from "react";

import { useImage } from "./Image.hooks";
import { ImageProps } from "./Image.types";

export function Image(props: ImageProps) {
  useImage(props);

  return null;
}
