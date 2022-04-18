import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface EllipseArgs extends DrawnCanvasProps {
  pos: Position;
  radius: number;
  radiusY?: number;
}
