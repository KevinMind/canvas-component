import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";


import { useMousePos, withMousePosition, withRenderFrameProvider } from "../../../../.storybook/decorators";
import { Polygon } from "../../../components/Polygon";
import { Ellipse } from "../../../components/Ellipse";

import { useActiveZone, useRectPoints } from './ElasticRect.hooks';
import { ElasticRect } from "./ElasticRect.component";
import { ElasticRectProps, ActiveZone } from "./ElasticRect.types";

type StoryProps = ElasticRectProps & {showHelpers: boolean};

function RenderElasticRect(args: StoryProps) {
  const zone = useActiveZone(args);
  const [x, y] = useMousePos();
  const {vertices} = useRectPoints(args);

  const lineStroke = 'rgba(0, 0, 0, 0.1)';
  const {center, margin = 0} = args;

  return (
    <>
      {args.showHelpers && (
        <>
              <Polygon sides={[center, vertices.topLeft, vertices.topRight]} center={center} strokeStyle={lineStroke} fillStyle={zone === 'top' ? lineStroke : 'transparent'} />
      <Polygon sides={[center, vertices.topRight, vertices.bottomRight]} center={center} strokeStyle={lineStroke} fillStyle={zone === 'right' ? lineStroke : 'transparent'} />
      <Polygon sides={[center, vertices.bottomLeft, vertices.bottomRight]} center={center} strokeStyle={lineStroke} fillStyle={zone === 'bottom' ? lineStroke : 'transparent'} />
      <Polygon sides={[center, vertices.topLeft, vertices.bottomLeft]} center={center} strokeStyle={lineStroke} fillStyle={zone === 'left' ? lineStroke : 'transparent'} />
      <Polygon
        sides={[
          {
            x: vertices.topLeft.x - margin,
            y: vertices.topLeft.y - margin,
          },
          {
            x: vertices.topRight.x + margin,
            y: vertices.topRight.y - margin,
          },
          {
            x: vertices.bottomRight.x + margin,
            y: vertices.bottomRight.y + margin,
          },
          {
            x: vertices.bottomLeft.x - margin,
            y: vertices.bottomLeft.y + margin,
          },
        ]}
        center={center}
        strokeStyle={lineStroke}
      />
      <Ellipse center={{x, y}} radius={1} />
        </>
      )}
      <ElasticRect {...args} />
    </>
  )
}

export default {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  decorators: [withMousePosition, withRenderFrameProvider],
  component: RenderElasticRect,
} as ComponentMeta<typeof RenderElasticRect>;

type ElasticRectStory = StoryObj<ComponentProps<typeof RenderElasticRect>>;

export const Default: ElasticRectStory = {
  args: {
    width: 250,
    height: 150,
    center: {
      x: 250,
      y: 250,
    },
    margin: 50,
    showHelpers: false,
  },
};
