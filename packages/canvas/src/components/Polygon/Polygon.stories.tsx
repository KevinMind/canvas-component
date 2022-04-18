import React, { ComponentProps, useState, useEffect } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { withRenderFrameProvider } from "../../../.storybook/decorators";

import { Polygon } from "./Polygon.component";
import { usePolygon } from "./Polygon.hooks";
import { PolygonArgs } from "./Polygon.types";
import { useAnimationFrame } from "../../hooks/useAnimationFrame";

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

function random(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function RandomShape(props: PolygonArgs) {
  usePolygon({
    size: props.size,
    sides: props.sides,
    pos: {
      x: props.pos.x,
      y: props.pos.y,
    },
    rotation: 0,
  });

  return null;
}

function RenderManyShapes({count}: {count: number}) {
  const [shapes, setShapes] = useState<PolygonArgs[]>([]);

  useEffect(() => {
    const newShapes: PolygonArgs[] = [];

    for (let x = 0; x < count; x++) {
      newShapes.push({
        size: random(10, 100),
        sides: random(3, 10),
        pos: {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
        rotation: 0,
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
