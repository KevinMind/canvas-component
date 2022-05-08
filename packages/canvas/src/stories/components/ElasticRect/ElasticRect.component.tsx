import React, { useState, useEffect } from "react";
import { useSpring } from "use-spring";

import { useMousePos } from "../../../../.storybook/decorators";
import { Ellipse } from "../../../components/Ellipse";
import { Line } from "../../../components/Line";
import { Polygon, Side } from "../../../components/Polygon";
import { Position } from "../../../RenderFrame.types";

import { ElasticRectProps } from "./ElasticRect.types";

function useRectPoints({width, height, center}: ElasticRectProps) {
  const w2 = width / 2;
  const h2 = height / 2;

  const leftX = center.x - w2;
  const topY = center.y - h2;
  const rightX = center.x + w2;
  const bottomY = center.y + h2;

  const vertices = {
    topRight: {x: rightX, y: topY},
    bottomRight: {x: rightX, y: bottomY},
    bottomLeft: {x: leftX, y: bottomY},
    topLeft: {x: leftX, y: topY},
  }

  return {
    vertices,
    leftX,
    rightX,
    topY,
    bottomY,
  };
}

interface QuandrantSectorProps extends ElasticRectProps {
  low: number;
  high: number;
}

function QuadrantSectorLines({center, width, height}: QuandrantSectorProps) {
  const lineStroke = 'rgba(0, 0, 0, 0.1)';

  const {leftX, rightX, topY, bottomY} = useRectPoints({center, width, height});

  return (
    <>
      <Line start={{x: leftX, y: topY}} end={{x: rightX, y: bottomY}} strokeStyle={lineStroke} />
      <Line start={{x: rightX, y: topY}} end={{x: leftX, y: bottomY}} strokeStyle={lineStroke} />
    </>
  );
}

function DeadZones(props: QuandrantSectorProps) {
  const {low, high} = props;
  const {leftX, rightX, topY, bottomY } = useRectPoints(props);

  const fillStyle = "rgba(0, 0, 0, 0.15)";
  const strokeStyle = "transparent";

  return (
    <>
      <Polygon
        sides={[
          {x: low, y: low},
          {x: leftX, y: low},
          {x: leftX, y: topY},
          {x: low, y: topY},
        ]}
        center={props.center}
        fillStyle={fillStyle}
        strokeStyle={strokeStyle}
      />
      <Polygon
        sides={[
          {x: rightX, y: low},
          {x: high, y: low},
          {x: high, y: topY},
          {x: rightX, y: topY},
        ]}
        center={props.center}
        fillStyle={fillStyle}
        strokeStyle={strokeStyle}
      />
      <Polygon
        sides={[
          {x: rightX, y: bottomY},
          {x: high, y: bottomY},
          {x: high, y: high},
          {x: rightX, y: high},
        ]}
        center={props.center}
        fillStyle={fillStyle}
        strokeStyle={strokeStyle}
      />
      <Polygon
        sides={[
          {x: low, y: bottomY},
          {x: leftX, y: bottomY},
          {x: leftX, y: high},
          {x: low, y: high},
        ]}
        center={props.center}
        fillStyle={fillStyle}
        strokeStyle={strokeStyle}
      />
    </>
  );
}

type ActiveZone = 'top' | 'right' | 'bottom' | 'left' | 'dead';

function useActiveZone(props: ElasticRectProps): ActiveZone {
  const [zone, setZone] = useState<ActiveZone>('dead');
  const {leftX, rightX, topY, bottomY, vertices} = useRectPoints(props);
  const [x, y] = useMousePos();

  function inside(point: Position, vs: Position[]) {      
      let inside = false;

      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          let xi = vs[i].x;
          let yi = vs[i].y;

          let xj = vs[j].x;
          let yj = vs[j].y;
          
          let intersect = ((yi > point.y) != (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

          if (intersect) {
            inside = !inside;
          }
      }
      
      return inside;
  };

  useEffect(() => {
    if ((x > leftX && x < rightX && y < topY) || inside({x, y}, [props.center, vertices.topLeft, vertices.topRight])) {
      setZone('top');
    }

    // right-zone
    if ((x > rightX && y < bottomY && y > topY) || inside({x, y}, [props.center, vertices.topRight, vertices.bottomRight])) {
      setZone('right');
    }

    // bottom-zone
    if ((x > leftX && x < rightX && y > bottomY) || inside({x, y}, [props.center, vertices.bottomLeft, vertices.bottomRight])) {
      setZone('bottom');
    }

    // left-zone
    if ((x < leftX && y > topY && y < bottomY) || inside({x, y}, [props.center, vertices.topLeft, vertices.bottomLeft])) {
      setZone('left');
    }
  }, [x, y, leftX, rightX, topY, bottomY]);


  return zone;
}

function useMouseInRect(props: ElasticRectProps) {
  const {leftX, rightX, topY, bottomY} = useRectPoints(props);
  const [x, y] = useMousePos();

  const mousePos = {x, y};

  const isOutsideRect = mousePos.x < leftX || mousePos.x > rightX || mousePos.y > bottomY || mousePos.y < topY;

  return !isOutsideRect;

}

function useSide(point: Position, active: boolean): [Position, Position] {
  const [x, y] = useMousePos();

  const mousePos = {x, y};

  const config: Parameters<typeof useSpring>[1] = {
    stiffness: 170,
    damping: 26,
    mass: 1,
    decimals: 2,
    teleport: false,
    initialSpeed: 0
  };

  const cp = active ? mousePos : point;

  const [xSpring] = useSpring(cp.x, config);
  const [ySpring] = useSpring(cp.y, config);

  return  [{x: xSpring, y: ySpring}, point];
}

export function ElasticRect(props: ElasticRectProps) {
  const [x, y] = useMousePos();
  const {vertices} = useRectPoints(props);
  
  const low = 0;
  const high = 500;

  const zone = useActiveZone(props);
  // const sides = useSideCoords(props, zone);
  const isActive = useMouseInRect(props);

  const sides = [
    useSide(vertices.topLeft, isActive && zone === 'left'),
    useSide(vertices.topRight, isActive && zone === 'top'),
    useSide(vertices.bottomRight, isActive && zone === 'right'),
    useSide(vertices.bottomLeft, isActive && zone === 'bottom'),
  ]
  
  return (
    <>
      <QuadrantSectorLines {...props} low={low} high={high} />
      <DeadZones {...props}  low={low} high={high} />

      <Ellipse center={{x, y}} radius={1} />

      <Polygon
        center={props.center}
        sides={sides}
      />
    </>
  )
}
