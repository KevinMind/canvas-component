import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface ArcToArgs extends DrawnCanvasProps {
  pos0: Position;
  pos1: Position;
  pos2: Position;
  radius: number;
}

