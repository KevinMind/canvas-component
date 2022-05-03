import { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider } from "../../../.storybook/decorators";

import { Filter } from "./Filter.component";

export default {
  decorators: [withRenderFrameProvider],
  component: Filter,
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  args: {
    pos: {
      x: 250,
      y: 250,
    },
    width: 250,
    height: 250,
    fillStyle: 'green',
  },
} as ComponentMeta<typeof Filter>;

type FilterStory = StoryObj<ComponentProps<typeof Filter>>;

/**
 * url()
A CSS url(). Takes an IRI pointing to an SVG filter element, which may be embedded in an external XML file.
https://developer.mozilla.org/en-US/docs/Web/SVG/Applying_SVG_effects_to_HTML_content
*/

export const Url: FilterStory = {
  args: {
    filter: '',
  },
};

/**
blur()
A CSS <length>. Applies a Gaussian blur to the drawing. It defines the value of the standard deviation to the Gaussian function, i.e., how many pixels on the screen blend into each other; thus, a larger value will create more blur. A value of 0 leaves the input unchanged.
*/

export const Blur: FilterStory = {
  args: {
    filter: 'blur(4px)',
  },
};

/**
brightness()
A CSS <percentage>. Applies a linear multiplier to the drawing, making it appear brighter or darker. A value under 100% darkens the image, while a value over 100% brightens it. A value of 0% will create an image that is completely black, while a value of 100% leaves the input unchanged.
*/

export const Brightness: FilterStory = {
  args: {
    filter: 'brightness(40%)',
  },
};

/**
contrast()
A CSS <percentage>. Adjusts the contrast of the drawing. A value of 0% will create a drawing that is completely black. A value of 100% leaves the drawing unchanged.
*/

export const Contrast: FilterStory = {
  args: {
    filter: 'contrast(40%)',
  },
};

/**
drop-shadow()
Applies a drop shadow effect to the drawing. A drop shadow is effectively a blurred, offset version of the drawing's alpha mask drawn in a particular color, composited below the drawing. This function takes up to five arguments:
<offset-x>: See <length> for possible units. Specifies the horizontal distance of the shadow.
<offset-y>: See <length> for possible units. Specifies the vertical distance of the shadow.
<blur-radius>: The larger this value, the bigger the blur, so the shadow becomes bigger and lighter. Negative values are not allowed.
<color>: See <color> values for possible keywords and notations.
*/

export const Dropshadow: FilterStory = {
  args: {
    filter: 'drop-shadow(-9px 9px 3px #e81)',
  },
};

/**
grayscale()
A CSS <percentage>. Converts the drawing to grayscale. A value of 100% is completely grayscale. A value of 0% leaves the drawing unchanged.
*/

export const Grayscale: FilterStory = {
  args: {
    filter: 'grayscale(100%)',
  },
};

/**
hue-rotate()
A CSS <angle>. Applies a hue rotation on the drawing. A value of 0deg leaves the input unchanged.
*/

export const HueRotate: FilterStory = {
  args: {
    filter: 'hue-rotate(180deg)',
  },
};

/**
invert()
A CSS <percentage>. Inverts the drawing. A value of 100% means complete inversion. A value of 0% leaves the drawing unchanged.
*/

export const Invert: FilterStory = {
  args: {
    filter: 'invert(75%)',
  },
};

/**
opacity()
A CSS <percentage>. Applies transparency to the drawing. A value of 0% means completely transparent. A value of 100% leaves the drawing unchanged.
*/

export const Opacity: FilterStory = {
  args: {
    filter: 'opacity(40%)',
  },
};

/**
saturate()
A CSS <percentage>. Saturates the drawing. A value of 0% means completely un-saturated. A value of 100% leaves the drawing unchanged.
*/

export const Saturate: FilterStory = {
  args: {
    filter: 'saturate(400%)',
  },
};

/**
sepia()
A CSS <percentage>. Converts the drawing to sepia. A value of 100% means completely sepia. A value of 0% leaves the drawing unchanged.
*/

export const Sepia: FilterStory = {
  args: {
    filter: 'sepia(100%)',
  },
};

/**
none
No filter is applied. Initial value.
 */

export const Default: FilterStory = {
  args: {
    filter: '',
  },
};
