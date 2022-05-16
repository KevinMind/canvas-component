import { Story, Meta } from "@storybook/html";

import { Animation } from "./Animation.class";
import { getCanvasContext } from "../.storybook/decorators";
import { drawEllipse } from "./components/Ellipse";

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
