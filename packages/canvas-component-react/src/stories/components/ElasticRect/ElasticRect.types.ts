import { Position } from "../../../RenderFrame.types";

export type ActiveZone = 'top' | 'right' | 'bottom' | 'left' | 'dead';

export interface ElasticRectProps {
  center: Position;
  width: number;
  height: number;
  margin?: number;
}

