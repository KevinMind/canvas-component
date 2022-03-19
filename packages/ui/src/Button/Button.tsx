import React, { PropsWithChildren, ButtonHTMLAttributes } from "react";

export function Button({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<{}>>) {
  return <button {...props}>{children}</button>;
}
