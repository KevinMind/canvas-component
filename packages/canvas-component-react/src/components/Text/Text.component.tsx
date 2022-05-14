import React from "react";

import { useText } from "./Text.hooks";

export function Text(props: Parameters<typeof useText>[0]) {
  useText(props);

  return null;
}
