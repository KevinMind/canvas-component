import { Story, Meta } from "@storybook/html";

import { Animation } from "./Animation.class";
import { getCanvasContext } from "../.storybook/decorators";
import { drawEllipse, EllipseArgs } from "./components/Ellipse";
import { Canvas } from "./Canvas.class";

export default {} as Meta;

const Template: Story = (_args, ctx) => {
  const animate = new Animation({
    from: 0,
    to: 250,
    duration: 3_000,
    auto: true,
    infinite: true,
    mode: "pingpong-backward",
  });

  animate.start();

  const canvas = getCanvasContext(ctx);

  const wrapper = document.createElement("div");

  const startButton = document.createElement("button");
  startButton.innerHTML = "start";
  startButton.onclick = () => animate.start();

  const stopButton = document.createElement("button");
  stopButton.innerHTML = "stop";
  stopButton.onclick = () => animate.stop();

  const resetButon = document.createElement("button");
  resetButon.innerHTML = "reset";
  resetButon.onclick = () => animate.reset();

  const displayText = document.createElement("h3");

  canvas.add((ctx) => {
    displayText.innerHTML = animate.value.toFixed(2);

    drawEllipse(ctx, { center: { x: 250, y: 250 }, radius: animate.value });
  });

  wrapper.append(
    startButton,
    stopButton,
    resetButon,
    displayText,
    canvas.canvas
  );

  return wrapper;
};

export const Default = Template.bind({});

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getInitialProps() {
  const xOffest = getRandomArbitrary(0, 250);
  const y = getRandomArbitrary(0, 500);
  const duration = getRandomArbitrary(500, 3_000);
  const radius = getRandomArbitrary(10, 30);

  return {
    y,
    xOffest,
    duration,
    radius,
  };
}

interface BenchmarkProos {
  shapeCount: number;
}

const BenchmarkTemplate: Story<BenchmarkProos> = (args, ctx) => {
  const canvas = getCanvasContext(ctx);

  for (let x = 0; x < args.shapeCount; x++) {
    const props = getInitialProps();

    const x = new Animation({
      from: -100,
      to: 500 + props.xOffest,
      mode: "backward",
      auto: true,
      infinite: true,
      duration: props.duration,
    });

    x.start();

    canvas.add((ctx) => {
      drawEllipse(ctx, { ...props, center: { x: x.value, y: props.y } });
    });
  }

  console.log("size", canvas.size);

  return canvas.canvas;
};

export const Benchmark = BenchmarkTemplate.bind({});

Benchmark.args = {
  shapeCount: 10,
};
