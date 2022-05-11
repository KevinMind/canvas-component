import React, {
  PropsWithChildren,
  CanvasHTMLAttributes,
  useRef,
  useEffect,
} from "react";

import { _usePrivateRenderFrameContext } from "../../RenderFrame.hooks";

export function Canvas({ children, ...props }: PropsWithChildren<CanvasHTMLAttributes<{}>>) {
  const ref = useRef(null);
  const {_addCanvas} = _usePrivateRenderFrameContext();

  useEffect(() => {
    if (ref.current) {
      _addCanvas(ref.current);
    }
  }, [ref.current]);

  return (
    <canvas {...props} ref={ref}>
      {children}
    </canvas>
  );
}