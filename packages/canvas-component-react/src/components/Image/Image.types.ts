import { BaseArgs, ShapeArgs } from "../../RenderFrame.types";

interface BasicImage extends BaseArgs, ShapeArgs {
  image: CanvasImageSource;
  smooth?: boolean;
}

interface SimpleImage extends BasicImage {
  dWidth: number;
  dHeight: number;
}

interface ComplexImage extends SimpleImage {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
}

export type ImageProps =
  | BasicImage
  | SimpleImage
  | ComplexImage;


