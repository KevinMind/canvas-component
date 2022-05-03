import React, { ComponentProps, useState, useEffect } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
import randomColor from "randomcolor";

import { withRenderFrameProvider } from "../../../.storybook/decorators";

import { Polygon } from "./Polygon.component";
import { usePolygon } from "./Polygon.hooks";
import { PolygonArgs } from "./Polygon.types";

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
    size: 100,
    pos: {
      x: 250,
      y: 250,
    }
  },
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
        size: random(10, Math.max(500 / count * 2, 20)),
        sides: random(3, 8),
        pos: {
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
      <RandomShape {...shape} key={shape.pos.x} />
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
      {x: 250, y: 250},
      {x: 470, y: 300},
      {x: 100, y: 400},
    ],
    size: 100,
    pos: {
      x: 250,
      y: 250,
    }
  },
}
