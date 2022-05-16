import { PlayModes, AnimationConfig, AnimationArgs } from "./Animation.types";
import { linearEasing } from "./Animation.utilities";

export class Animation implements AnimationConfig {
  #id = 0;
  #startTime = 0;
  #lastTime = 0;

  #value = 0;

  from: number;
  to: number;

  easing: (percentage: number) => number = linearEasing;
  mode: PlayModes = "forward";
  duration: number = Number.MAX_SAFE_INTEGER;
  infinite: boolean = false;
  interval: number = 0;
  auto: boolean = false;

  constructor({ from, to, ...inputConfig }: AnimationArgs) {
    this.from = from;
    this.to = to;
    Object.assign(this, inputConfig);
  }

  public logConfig() {
    console.log("config", JSON.stringify(this, null, 2));
  }

  #render(frame: number) {
    const step = this.mode.includes("backward") ? this.duration - frame : frame;
    const factor = this.easing(step / this.duration);
    this.#value = this.from + (this.to - this.from) * factor;
  }

  public start(playMode?: PlayModes) {
    if (playMode) {
      this.mode = playMode;
    }

    const self = this;

    function render(currentTime: number, isFirst = false) {
      if (isFirst) {
        self.#startTime = currentTime;
        self.#lastTime = 0;
      }

      let frame = Math.min(
        Math.max(Math.round(currentTime - self.#startTime), 0),
        self.duration
      );

      if (frame >= self.duration) {
        self.#render(frame);

        if (!self.infinite) {
          return self.stop();
        }

        switch (self.mode) {
          case "forward":
          case "backward":
            return self.start(self.mode);
          case "pingpong":
            return self.start("pingpong-backward");
          case "pingpong-backward":
            return self.start("pingpong");
          default:
            return self.stop();
        }
      }

      if (frame - self.#lastTime >= self.interval) {
        self.#render(frame);
        self.#lastTime = frame;
      }

      self.#id = window.requestAnimationFrame(render);
    }

    this.#render(0);
    render(performance.now(), true);
  }

  public stop() {
    if (this.#id) {
      window.cancelAnimationFrame(this.#id);
    }
  }

  public reset() {
    this.#render(0);
  }

  public get value(): number {
    return this.#value;
  }
}
