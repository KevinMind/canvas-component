import React, { ComponentProps } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { useAnimationFrame } from "./hooks/useAnimationFrame";
import { withRenderFrameProvider, withMousePosition, useMousePos, withTodoList } from "../.storybook/decorators";
import { RenderFrameProvider } from "./RenderFrame.component";
import { useRenderFrame } from "./RenderFrame.hooks";
import { Ellipse, useEllipse } from "./components/Ellipse";

function CustomEllipse({
  x,
  y,
  radius = 10,
}: {
  x: number;
  y: number;
  radius?: number;
}) {
  const [width] = useAnimationFrame({
    from: 0,
    to: radius,
    mode: "pingpong",
    auto: true,
    duration: 1_000,
    infinite: true,
  });

  useRenderFrame((context) => {
    context.strokeStyle = "green";
    context.setLineDash([2]);
    context.beginPath();

    context.arc(x, y, width, 0, 2 * Math.PI);
    context.stroke();
  });

  return null;
}

function Triangle() {
  useRenderFrame((ctx) => {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(75, 50);
    ctx.lineTo(100, 75);
    ctx.lineTo(100, 25);
    ctx.fill();
  });

  return null;
}

function Smiley() {
  useRenderFrame((ctx) => {
    ctx.beginPath();
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true);
    ctx.moveTo(110, 75);
    ctx.arc(75, 75, 35, 0, Math.PI, false);
    ctx.moveTo(65, 65);
    ctx.arc(60, 65, 5, 0, Math.PI * 2, true);
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI * 2, true);
    ctx.stroke();
  });

  return null;
}

export default {
  component: RenderFrameProvider,
  decorators: [withTodoList, withMousePosition, withRenderFrameProvider],
} as ComponentMeta<typeof RenderFrameProvider>;

type RenderFrameProviderStory = StoryObj<ComponentProps<typeof RenderFrameProvider>>;

export const Default: RenderFrameProviderStory = {
  parameters: {
    canvasProvider: {
      width: 300,
      height: 300,
    },
  },
  render: () => {
    return (
      <>
        <Triangle />
        <CustomEllipse x={150} y={150} radius={150} />
        <CustomEllipse x={200} y={50} radius={100} />
        <CustomEllipse x={100} y={50} radius={100} />
        <Smiley />
      </>
    );
  },
};

function RenderDraggable() {
  const [x] = useMousePos();

  return (
    <>
      <Ellipse pos={{x, y: 100}} radius={100} rotation={0} />
    </>
  );
}

export const Draggable: RenderFrameProviderStory = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 200,
    },
  },
  render: () => <RenderDraggable />,
};

function getPointInEllipse(radius: number, degrees: number) {
  const radians = degrees * (Math.PI / 180);

  var x = Math.cos(radians) * radius;
  var y = Math.sin(radians) * radius;

  return { x, y };
}

function RenderEllipseOfEllipses() {
  const radius = 60;
  const slowRadius = 100;
  const x = 100;
  const y = 100;

  const [slowRadian] = useAnimationFrame({
    from: 0,
    to: 360,
    duration: 3_000,
    auto: true,
    infinite: true,
  });

  const [moonRadian] = useAnimationFrame({
    from: 0,
    to: 360,
    duration: 1_000,
    auto: true,
    infinite: true,
  });

  const slow = getPointInEllipse(slowRadius, slowRadian);
  const moon = getPointInEllipse(slowRadius * 0.3, moonRadian);

  const [fastRadian] = useAnimationFrame({
    from: 0,
    to: 360,
    duration: 10_000,
    auto: true,
    infinite: true,
  });

  const fast = getPointInEllipse(radius, fastRadian);

  return (
    <>
      <Ellipse pos={{x, y}} radius={slowRadius} rotation={0} />
      <Ellipse pos={{x, y}} radius={radius} rotation={0} />
      <Ellipse pos={{x: x + slow.x, y: y + slow.y}} radius={slowRadius / 10} rotation={0} />
      <Ellipse
        pos={{
          x: x + slow.x + moon.x,
          y: y + slow.y + moon.y,
        }}
        radius={slowRadius / 20}
        rotation={0}
      />
      <Ellipse pos={{x: x + fast.x, y: y + fast.y}} radius={radius / 10} rotation={0} />
    </>
  );
}

export const EllipseOfEllipses: RenderFrameProviderStory = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 200,
    },
  },
  render: () => <RenderEllipseOfEllipses />,
};

function RenderPoint() {
  const [radius] = useAnimationFrame({from: 10, to: 100, duration: 5_000, infinite: true, auto: true, mode: 'pingpong'});
  const [x, y] = useMousePos();

  useEllipse({pos: {x, y}, radius});

  return null;
}

export const Point: RenderFrameProviderStory = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 500,
    },
  },
  render: () => <RenderPoint />,
};
