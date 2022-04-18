import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface BoxArgs extends DrawnCanvasProps {
  pos: Position;
  width: number;
  height: number;
}

