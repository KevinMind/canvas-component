import React, { useEffect, useState } from 'react';
import { useSpring } from 'use-spring';
import { Position } from '@canvas-component/core';

import { useMousePos } from '../../../../.storybook/decorators';
import { ElasticRectProps, ActiveZone } from './ElasticRect.types';

export function useRectPoints({width, height, center}: ElasticRectProps) {
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

export function useActiveZone(props: ElasticRectProps): ActiveZone {
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

export function useSide(point: Position, active: boolean): [Position, Position] {
  const [x, y] = useMousePos();

  const mousePos = {x, y};

  const config: Parameters<typeof useSpring>[1] = {
    stiffness: 100,
    damping: 26,
    mass: 5,
    decimals: 2,
    teleport: false,
    initialSpeed: 0
  };

  const cp = active ? mousePos : point;

  const [xSpring] = useSpring(cp.x, config);
  const [ySpring] = useSpring(cp.y, config);

  return  [{x: xSpring, y: ySpring}, point];
}