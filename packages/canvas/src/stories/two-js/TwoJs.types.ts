import { ReactNode } from "react";
import Two from 'two.js';

export type TwoJsContextType = Two | undefined;

export interface TwoJsProps {
  canvasRef?: HTMLElement;
  children: ReactNode;
}

