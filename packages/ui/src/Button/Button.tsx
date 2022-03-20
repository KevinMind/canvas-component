import React, { PropsWithChildren, ButtonHTMLAttributes } from "react";

export function Button({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<{}>>) {
  return (
    <button {...props} style={{ padding: "20px 10px" }}>
      {children}
    </button>
  );
}
