import React, { useMemo } from "react";
import randomColor from "randomcolor";
import { useSpring } from "use-spring";

import { useEllipse } from "../../../components/Ellipse";
import { useRadialGradient } from "../../../hooks/useRadialGradient";
import { useMousePos } from "../../../../.storybook/decorators";
import { useRenderFrameCanvas } from "../../../RenderFrame.hooks";

const config = {mass: 0.1, stiffness: 100, damping: 12};

export function Eyeball() {
  const [_x, _y] = useMousePos();
  const [x] = useSpring(_x, config);
  const [y] = useSpring(_y, config);

  const [canvas] = useRenderFrameCanvas();

  const colors = useMemo(() => {
    return {
      bright: randomColor({hue: 'blue', luminosity: 'bright'}),
      light: randomColor({hue: 'blue', luminosity: 'light'}),
      dark: randomColor({hue: 'blue', luminosity: 'dark'}),
      white: 'white',
      gray: '#eeeeee',
      black: 'black',
    };
  }, []);

  function getOffest(perc: number) {
    return (2 * perc) - 1;
  }

  const offsetX =  canvas ? x / canvas.width : 0;
  const offsetY = canvas ? y / canvas.height : 0;

  const startX = 250 + (50 * getOffest(offsetX));
  const endX = 250 + (7.5 * getOffest(offsetX));
  const startY = 250 + (50 * getOffest(offsetY));

  useEllipse({
    radius: 250,
    center: {x: 250, y: 250},
    fillStyle: useRadialGradient({
      start: {x: startX, y: startY},
      startRadius: 30,
      end: {x: endX, y: 250},
      endRadius: 250,
      colorStops: [
        [0, colors.black],
        [0.15, colors.black],
        [0.16, colors.bright],
        [0.18, colors.light],
        [0.55, colors.dark],
        [0.56, colors.white],
        [0.86, colors.white],
        [1, colors.gray],
      ],
    })
  });
  return null;
}
