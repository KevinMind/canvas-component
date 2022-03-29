import { DrawnCanvasProps, Position } from "../../Canvas.types";

export interface LineArgs extends DrawnCanvasProps {
  start: Position;
  end: Position;
}
