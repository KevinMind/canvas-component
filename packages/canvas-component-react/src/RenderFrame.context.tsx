import { createContext } from "react";
import { Canvas } from "@canvas-component/core";

export const RenderFrameContext = createContext<Canvas | null>(null);
