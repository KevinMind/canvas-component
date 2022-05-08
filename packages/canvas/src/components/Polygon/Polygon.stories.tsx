import React, { ComponentProps, useState, useEffect } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider, withRotation } from "../../../.storybook/decorators";

import { Polygon } from "./Polygon.component";
import { usePolygon } from "./Polygon.hooks";
import { PolygonArgs } from "./Polygon.types";
import { useLinearGradient } from "../../hooks/useLinearGradient";

export default {
  decorators: [withRenderFrameProvider],
  component: Polygon,
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
} as ComponentMeta<typeof Polygon>;

type PolygonStory = StoryObj<ComponentProps<typeof Polygon>>;

export const Default: PolygonStory = {
  args: {
    sides: 3,
    sideLength: 100,
    center: {
      x: 250,
      y: 250,
    },
  },
};

export const BentRectangle: PolygonStory = {
  args: {
    sides: [
      [{x: 100, y: 100}, {x: 100, y: 100}],
      [{x: 250, y: 150}, {x: 400, y: 100}],
      [{x: 400, y: 400}, {x: 400, y: 400}],
      [{x: 100, y: 400}, {x: 100, y: 400}],
      [{x: 100, y: 100}, {x: 100, y: 100}],
    ],
    center: {
      x: 250,
      y: 250,
    },
  },
};

export const Rotate: PolygonStory = {
  // @TODO: fix broken decorator function signature
  // @ts-ignore
  decorators: [withRotation],
  ...Default,
};

export const FillStyle: PolygonStory = {
  ...Default,
  args: {
    ...Default.args,
    fillStyle: randomColor({
      format: 'rgba',
      alpha: 0.5,
    }),
  }
}

export const StrokeStyle: PolygonStory = {
  ...Default,
  args: {
    ...Default.args,
    strokeStyle: randomColor({
      format: 'rgba',
      alpha: 0.5,
    }),
    lineWidth: 2,
  }
}

function RenderGradient() {
  const grd = useLinearGradient({
    start: {x: 0, y: 250},
    end: {x: 500, y: 250},
    colorStops: [
      [0, 'red'],
      [0.3, 'red'],
      [0.31, 'yellow'],
      [0.7, 'yellow'],
      [0.71, 'black'],
      [1, 'black'],
    ],
  });

  return (
    <Polygon
      sides={8}
      sideLength={250}
      center={{x: 250, y: 250}}
      fillStyle={grd}
    />
  )
}

export const LinearGradient: StoryObj = {
  render: () => <RenderGradient />,
};


function random(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function RandomShape(props: PolygonArgs) {
  usePolygon(props);

  return null;
}

function RenderManyShapes({count}: {count: number}) {
  const [shapes, setShapes] = useState<PolygonArgs[]>([]);

  useEffect(() => {
    const newShapes: PolygonArgs[] = [];

    for (let x = 0; x < count; x++) {
      newShapes.push({
        sideLength: random(10, Math.max(500 / count * 2, 20)),
        sides: random(3, 8),
        center: {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
        fillStyle: randomColor({alpha: 0.5, format: 'rgba'}),
      });
    }

    setShapes(newShapes);
  
  }, [count]);

  return (
    <>
    {shapes.map((shape) => (
      <RandomShape {...shape} key={shape.center.x} />
    ))}
    </>
  );
}

export const ManyShapes: StoryObj<ComponentProps<typeof RenderManyShapes>> = {
  args: {
    count: 10,
  },
  render: (args) => <RenderManyShapes {...args} />,
};

export const CustomPolygon: PolygonStory = {
  args: {
    sides: [
      {x: 100, y: 100},
      {x: 200, y: 100},
      [{x: 200, y: 230}, {x: 250, y: 250}],
      [{x: 300, y: 150}, {x: 470, y: 300}],
      {x: 100, y: 400},
    ],
    sideLength: 100,
    center: {
      x: 250,
      y: 250,
    }
  },
};
