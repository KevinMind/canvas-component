import React, { ComponentProps, useEffect, useState, useCallback } from "react";
import { ComponentMeta, StoryObj } from "@storybook/react";
// import { within, userEvent } from "@storybook/testing-library";
// import { expect, jest } from "@storybook/jest";

import { CanvasProvider, useCanvasFrame } from ".";

function Input() {
  const [input, setInput] = useState<string>("");

  return <input value={input} onChange={(e) => setInput(e.target.value)} />;
}

function StoryComponent(args: ComponentProps<typeof CanvasProvider>) {
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

    useCanvasFrame((context) => {
      context.strokeStyle = "green";
      context.setLineDash([2]);
      context.beginPath();

      context.arc(x, y, width, 0, 2 * Math.PI);
      context.stroke();
    });

    return null;
  }

  function Triangle() {
    useCanvasFrame((ctx) => {
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
    useCanvasFrame((ctx) => {
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

  return (
    <>
      <Input />
      <CanvasProvider {...args}>
        <Triangle />
        <Circle x={200} y={100} radius={100} />
        <Circle x={150} y={50} radius={100} />
        <Circle x={200} y={50} radius={100} />
        <Smiley />
      </CanvasProvider>
    </>
  );
}

export default {
  component: CanvasProvider,
} as ComponentMeta<typeof CanvasProvider>;

type CanvasProviderStory = StoryObj<ComponentProps<typeof CanvasProvider>>;

export const Default: CanvasProviderStory = {
  args: {
    width: 800,
    height: 800,
  },
  render: (args) => {
    return <StoryComponent {...args} />;
  },
};
