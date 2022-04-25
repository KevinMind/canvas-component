import React, { useEffect, useMemo, useState } from "react";

import {Line} from "../../../components/Line";
import { useAnimationFrame } from "../../../hooks/useAnimationFrame";
import { useRenderFrameCanvas } from "../../../RenderFrame.hooks";
import { bezierEasing } from "../../../utilities/bezier";

import { DrawGridProps } from "./DrawGrid.types";

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function Row({width, y, reverse = false, maxDuration = 10_000}: {maxDuration: number; width: number; y: number; reverse?: boolean}) {
  const duration = useMemo(() => {
    return randomNumber(maxDuration / Math.E, maxDuration);
  }, []);
  const [percentage] = useAnimationFrame({
    from: 0,
    to: 100,
    duration,
    auto: true,
    easing: bezierEasing([.64, .13, .64, .98]),
  });

  const x = width * percentage / 100;

  if (reverse) {
    const reverseX = width - x;
    return (
      <Line start={{x: reverseX, y}} end={{x: width, y}} rotation={0} key={y} />
    );
  }

  return (
    <Line start={{x: 0, y}} end={{x, y}} rotation={0} key={y} />
  );
}

function Col({height, x, reverse = false, maxDuration = 10_000}: {maxDuration: number; height: number; x: number; reverse?: boolean}) {
  const duration = useMemo(() => {
    return randomNumber(maxDuration / 2, maxDuration);
  }, []);
  const [percentage] = useAnimationFrame({
    from: 0,
    to: 100,
    duration,
    auto: true,
    easing: bezierEasing([.64, .13, .64, .98]),
  });

  const y = height * percentage / 100;

  if (reverse) {
    const reverseY = height - y;
    return (
      <Line start={{x, y: reverseY}} end={{x, y: height}} rotation={0} key={x} />
    );
  }
  
  return (
    <Line start={{x, y: 0}} end={{x, y}} rotation={0} key={x} />
  );
}

export function DrawGrid({rows, cols, children}: DrawGridProps) {
  const [numCols, setNumCols] = useState<number>(cols);
  const [numRows, setNumRows] = useState<number>(rows);
  const [spacing, setSpacing] = useState<{row: number; col: number}>({row: 0, col: 0});

  const [canvas] = useRenderFrameCanvas();

  if (typeof cols === 'undefined' && typeof rows === 'undefined') {
    throw new Error('must define at least one of rows or cols');
  }


  if (rows < 0 || rows % 1 > 0) {
    throw new Error('rows must be positive integer')
  }

  if (cols < 0 || cols % 1 > 0) {
    throw new Error('cols must be positive integer')
  }

  useEffect(() => {
    if (!canvas) {
      return;
    }

    let row = canvas.height / rows;
    let col = canvas.width / cols;

    if (!rows) {
      row = col;
    }

    if (!cols) {
      col = row;
    }

    setSpacing({row, col});

    setNumRows(Math.round(canvas.height / row));
    setNumCols(Math.round(canvas.width / col));

  }, [rows, cols, canvas]);

  if (!canvas) {
    return null;
  }

  if (spacing.row === 0 || spacing.col === 0) {
    return null;
  }
  
  const maxDuration = 6_000;

  return (
    <>
    {Array.apply(null, Array(numRows)).map((_x, idx) => {
      return (
        <Row
          y={idx * spacing.row}
          width={canvas.width}
          maxDuration={maxDuration}
          reverse={idx % 2 === 0}
        />
      );
    })}
    {Array.apply(null, Array(numCols)).map((_x, idx) => {
      return (
        <Col
          x={idx * spacing.col}
          height={canvas.height}
          maxDuration={maxDuration}
          reverse={idx % 2 !== 0}
        />
      )
    })}
    {children}
    </>
  );
  
}
