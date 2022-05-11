import { useState } from "react";

import { defaultIncrement } from "./DrawGrid.utilities";

export function useCount() {
  const [count, setCount] = useState<number>(0);

  function increment(amount = defaultIncrement) {
    setCount((c) => c + amount);
  }

  return [count, increment];
}
