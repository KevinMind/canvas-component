import { useContext } from "react";
import { TwoJsContext } from "./TwoJs.context";

export function useTwoJs() {
  const context = useContext(TwoJsContext);

  if (!context) {
    throw new Error('use_Canvas() must be rendered within a <_Canvas> component');
  }
  
  return context;
}
