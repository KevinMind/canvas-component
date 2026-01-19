export type PlayModes =
  | "forward"
  | "backward"
  | "pingpong"
  | "pingpong-backward";

export interface AnimationValueConfig {
  from: number;
  to: number;
  duration?: number;
  easing?: (t: number) => number;
  mode?: PlayModes;
  infinite?: boolean;
  auto?: boolean;
}

export interface AnimationValueHandle {
  getValue: () => number;
  start: (mode?: PlayModes) => void;
  stop: () => void;
  reset: () => void;
  isRunning: () => boolean;
}

const linearEasing = (t: number) => t;

/**
 * AnimationValue - A standalone animation value class that manages animation state
 * via requestAnimationFrame WITHOUT triggering React state updates.
 *
 * Values are stored internally and accessed via getValue() - this avoids
 * React re-renders during animation, achieving 0 reconciliations per frame.
 */
export class AnimationValue {
  private value: number;
  private config: Required<AnimationValueConfig>;
  private rafId: number | null = null;
  private startTime: number = 0;
  private mode: PlayModes;
  private running: boolean = false;

  constructor(config: AnimationValueConfig) {
    this.config = {
      from: config.from,
      to: config.to,
      duration: config.duration ?? Number.MAX_SAFE_INTEGER,
      easing: config.easing ?? linearEasing,
      mode: config.mode ?? 'forward',
      infinite: config.infinite ?? false,
      auto: config.auto ?? false,
    };
    this.value = this.config.from;
    this.mode = this.config.mode;

    if (this.config.auto) {
      this.start();
    }
  }

  getValue(): number {
    return this.value;
  }

  isRunning(): boolean {
    return this.running;
  }

  start(playMode?: PlayModes): void {
    if (playMode) {
      this.mode = playMode;
    }

    this.running = true;
    this.startTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.running = false;
  }

  reset(): void {
    this.stop();
    this.value = this.config.from;
    this.mode = this.config.mode;
  }

  updateConfig(config: Partial<AnimationValueConfig>): void {
    if (config.from !== undefined) this.config.from = config.from;
    if (config.to !== undefined) this.config.to = config.to;
    if (config.duration !== undefined) this.config.duration = config.duration;
    if (config.easing !== undefined) this.config.easing = config.easing;
    if (config.mode !== undefined) {
      this.config.mode = config.mode;
      this.mode = config.mode;
    }
    if (config.infinite !== undefined) this.config.infinite = config.infinite;
  }

  destroy(): void {
    this.stop();
  }

  private tick = (currentTime: number): void => {
    const elapsed = currentTime - this.startTime;
    const { duration, from, to, easing, infinite } = this.config;

    // Calculate progress (0 to 1)
    let progress = Math.min(elapsed / duration, 1);

    // Apply direction
    if (this.mode.includes('backward')) {
      progress = 1 - progress;
    }

    // Apply easing and interpolate value
    const easedProgress = easing(progress);
    this.value = from + (to - from) * easedProgress;

    // Check if animation completed
    if (elapsed >= duration) {
      if (infinite) {
        // Handle infinite looping
        switch (this.mode) {
          case 'forward':
          case 'backward':
            this.start(this.mode);
            return;
          case 'pingpong':
            this.start('pingpong-backward');
            return;
          case 'pingpong-backward':
            this.start('pingpong');
            return;
        }
      } else {
        this.running = false;
        return;
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  /**
   * Create a handle object for use with React hooks
   */
  getHandle(): AnimationValueHandle {
    return {
      getValue: () => this.getValue(),
      start: (mode?: PlayModes) => this.start(mode),
      stop: () => this.stop(),
      reset: () => this.reset(),
      isRunning: () => this.isRunning(),
    };
  }
}
