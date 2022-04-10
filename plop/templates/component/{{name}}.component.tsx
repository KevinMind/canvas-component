import React from "react";

import { useCount } from "./{{name}}.hooks";
import { {{name}}Props } from "./{{name}}.types";

export function {{name}}(props: {{name}}Props) {
  const [count] = useCount();
  return (
    <div>
      Hello {props.label} ({count})
    </div>
  )
}
