import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface LineArgs extends DrawnCanvasProps {
  start: Position;
  end: Position;
}
