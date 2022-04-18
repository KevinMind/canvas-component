import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface RectArgs extends DrawnCanvasProps {
  pos: Position;
  width: number;
  height: number;
}

