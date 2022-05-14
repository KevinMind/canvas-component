import {
  BaseArgs,
  Position,
  FillArgs,
  StrokeArgs,
  ShapeArgs,
} from "../../RenderFrame.types";

export type SimpleSide = Position;
export type SideWithControlPoint = [Position, Position];

export type Side = SimpleSide | SideWithControlPoint;

interface BasePolygonArgs extends BaseArgs, ShapeArgs, FillArgs, StrokeArgs {}

export interface RegularPolygonArgs extends BasePolygonArgs {
  sides: number;
  sideLength: number;
  controlPoint?: Position;
}

export interface FreePolygonArgs extends BasePolygonArgs {
  sides: Side[];
}

export type PolygonArgs = RegularPolygonArgs | FreePolygonArgs;
