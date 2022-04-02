import { DrawnCanvasProps, Position } from "../../Canvas.types";

export interface CircleArgs extends DrawnCanvasProps {
  pos: Position;
  radius: number;
  radiusY?: number;
}
