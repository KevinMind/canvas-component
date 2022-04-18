import { DrawnCanvasProps, Position } from "../../RenderFrame.types";

export interface LineArgs extends DrawnCanvasProps {
  start: Position;
  cp1?: Position;
  cp2?: Position;
  end: Position;
}
