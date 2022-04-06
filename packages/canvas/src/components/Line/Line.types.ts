import { DrawnCanvasProps, Position } from "../Canvas/Canvas.types";

export interface LineArgs extends DrawnCanvasProps {
  start: Position;
  end: Position;
}
