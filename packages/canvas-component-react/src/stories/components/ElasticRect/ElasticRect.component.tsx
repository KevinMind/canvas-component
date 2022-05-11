import React from "react";

import { useMousePos } from "../../../../.storybook/decorators";
import { Polygon } from "../../../components/Polygon";

import { useRectPoints, useActiveZone, useSide } from "./ElasticRect.hooks";
import { ElasticRectProps } from "./ElasticRect.types";

export function ElasticRect(props: ElasticRectProps) {
  const {margin = 0} = props;
  const [x, y] = useMousePos();
  const {vertices, leftX, rightX, topY, bottomY} = useRectPoints(props);

  const mousePos = {x, y};

  const isOutsideRect = mousePos.x < (leftX - margin) || mousePos.x > (rightX + margin) || mousePos.y > (bottomY + margin) || mousePos.y < (topY - margin);

  const activeZone = useActiveZone(props);
  const isActive = !isOutsideRect;

  const sides = [
    useSide(vertices.topLeft, isActive && activeZone === 'left'),
    useSide(vertices.topRight, isActive && activeZone === 'top'),
    useSide(vertices.bottomRight, isActive && activeZone === 'right'),
    useSide(vertices.bottomLeft, isActive && activeZone === 'bottom'),
  ];
  
  return (
    <>
      <Polygon
        center={props.center}
        sides={sides}
      />
    </>
  )
}
