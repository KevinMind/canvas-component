import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface CircleArgs extends DrawnCanvasProps {
  pos: Position;
  radius: number;
  radiusY?: number;
}
