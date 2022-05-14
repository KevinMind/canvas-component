import React from "react";

import { usePath } from "./Path.hooks";

export function Path(props: Parameters<typeof usePath>[0]) {
  usePath(props);

  return null;
}
