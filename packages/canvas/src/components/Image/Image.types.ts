import { BaseArgs } from "../../RenderFrame.types";

interface BasicImage extends BaseArgs {
  image: CanvasImageSource;
  smooth?: boolean;
  dx: number;
  dy: number;
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


