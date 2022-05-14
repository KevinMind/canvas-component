import React from "react";

import { useImage } from "./Image.hooks";

export function Image(props: Parameters<typeof useImage>[0]) {
  useImage(props);

  return null;
}
