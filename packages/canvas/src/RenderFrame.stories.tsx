import React, { ComponentProps, useEffect, useState, useCallback } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";

import { useAnimationFrame } from "./hooks/useAnimationFrame";
import { withRenderFrameProvider, withTodoList } from "../.storybook/decorators";
import { RenderFrameProvider } from "./RenderFrame.component";
import { useRenderFrame } from "./RenderFrame.hooks";

function Input() {
  const [input, setInput] = useState<string>("");

  return <input value={input} onChange={(e) => setInput(e.target.value)} />;
}

function RawCircle({ radius, x, y }: { x: number; y: number; radius: number }) {
  useRenderFrame((context) => {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.stroke();
  });

  return null;
}

function Circle({
  x,
  y,
  radius = 10,
}: {
  x: number;
  y: number;
  radius?: number;
}) {
  const [width, setWidth] = useState<number>(radius);
  const [increment, setIncrement] = useState<boolean>(false);

  const update = useCallback(() => {
    setWidth((w) => {
      if (w === radius) {
        setIncrement(false);
        return w - 1;
      }
      if (w === 0 || increment) {
        setIncrement(true);
        return w + 1;
      }
      return w - 1;
    });
  }, [increment, radius]);

  useEffect(() => {
    let int = setInterval(update, 10);

    return () => {
      clearInterval(int);
    };
  }, [update]);

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
  decorators: [withRenderFrameProvider, withTodoList],
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
        <Input />
        <Triangle />
        <Circle x={150} y={150} radius={150} />
        <Circle x={200} y={50} radius={100} />
        <Circle x={100} y={50} radius={100} />
        <Smiley />
      </>
    );
  },
};

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const setFromEvent = (e: MouseEvent) =>
      setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", setFromEvent);

    return () => {
      window.removeEventListener("mousemove", setFromEvent);
    };
  }, []);

  return position;
};

function RenderDraggable() {
  const { x } = useMousePosition();

  return (
    <>
      <RawCircle x={x + 100} y={100} radius={100} />
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

function getPointInCircle(radius: number, degrees: number) {
  const radians = degrees * (Math.PI / 180);

  var x = Math.cos(radians) * radius;
  var y = Math.sin(radians) * radius;

  return { x, y };
}

function RenderCircleOfCircles() {
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

  const slow = getPointInCircle(slowRadius, slowRadian);
  const moon = getPointInCircle(slowRadius * 0.3, moonRadian);

  const [fastRadian] = useAnimationFrame({
    from: 0,
    to: 360,
    duration: 10_000,
    auto: true,
    infinite: true,
  });

  const fast = getPointInCircle(radius, fastRadian);

  return (
    <>
      <RawCircle x={x} y={y} radius={slowRadius} />
      <RawCircle x={x} y={y} radius={radius} />
      <RawCircle x={x + slow.x} y={y + slow.y} radius={slowRadius / 10} />
      <RawCircle
        x={x + slow.x + moon.x}
        y={y + slow.y + moon.y}
        radius={slowRadius / 20}
      />

      <RawCircle x={x + fast.x} y={y + fast.y} radius={radius / 10} />
    </>
  );
}

export const CircleOfCircles: RenderFrameProviderStory = {
  parameters: {
    canvasProvider: {
      width: 500,
      height: 200,
    },
  },
  render: () => <RenderCircleOfCircles />,
};
