import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface PolygonArgs extends DrawnCanvasProps {
  pos: Position;
  sides: number | Position[];
  size: number;
}

