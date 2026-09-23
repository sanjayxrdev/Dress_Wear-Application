/**
 * One Euro Filter for Real-Time Landmark Temporal Smoothing
 * Reference: Casiez, G., Roussel, N. and Vogel, D. (2012).
 * 1€ Filter: A Simple Speed-based Low-pass Filter for Noisy Input in Interactive Systems. CHI 2012.
 */

class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  public filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.s = value;
      this.y = value;
      return value;
    }
    this.s = alpha * value + (1.0 - alpha) * (this.s ?? value);
    this.y = this.s;
    return this.y;
  }

  public last(): number | null {
    return this.y;
  }

  public reset(): void {
    this.y = null;
    this.s = null;
  }
}

export interface OneEuroConfig {
  minCutoff?: number; // Minimum cutoff frequency in Hz (prevents jitter at rest)
  beta?: number; // Speed coefficient (reduces lag during rapid movement)
  dCutoff?: number; // Cutoff frequency for derivative filtering
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number | null = null;

  constructor(config: OneEuroConfig = {}) {
    this.minCutoff = config.minCutoff ?? 1.0;
    this.beta = config.beta ?? 0.007;
    this.dCutoff = config.dCutoff ?? 1.0;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  public filter(value: number, timestamp: number): number {
    if (this.lastTime === null || timestamp === this.lastTime) {
      this.lastTime = timestamp;
      return this.xFilter.filter(value, 1.0);
    }

    const dt = Math.max((timestamp - this.lastTime) / 1000.0, 1e-5);
    this.lastTime = timestamp;

    const prevX = this.xFilter.last();
    const dx = prevX !== null ? (value - prevX) / dt : 0.0;

    // Filter derivative to prevent noise amplification
    const alphaD = this.getAlpha(this.dCutoff, dt);
    const filteredDx = this.dxFilter.filter(dx, alphaD);

    // Adaptive cutoff frequency based on movement speed
    const cutoff = this.minCutoff + this.beta * Math.abs(filteredDx);
    const alpha = this.getAlpha(cutoff, dt);

    return this.xFilter.filter(value, alpha);
  }

  public reset(): void {
    this.xFilter.reset();
    this.dxFilter.reset();
    this.lastTime = null;
  }

  private getAlpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2.0 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }
}

export interface Point2D {
  x: number;
  y: number;
}

export class OneEuroFilter2D {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor(config: OneEuroConfig = {}) {
    this.filterX = new OneEuroFilter(config);
    this.filterY = new OneEuroFilter(config);
  }

  public filter(pt: Point2D, timestamp: number): Point2D {
    return {
      x: this.filterX.filter(pt.x, timestamp),
      y: this.filterY.filter(pt.y, timestamp),
    };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export class OneEuroFilter3D {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;
  private filterZ: OneEuroFilter;

  constructor(config: OneEuroConfig = {}) {
    this.filterX = new OneEuroFilter(config);
    this.filterY = new OneEuroFilter(config);
    this.filterZ = new OneEuroFilter(config);
  }

  public filter(pt: Point3D, timestamp: number): Point3D {
    return {
      x: this.filterX.filter(pt.x, timestamp),
      y: this.filterY.filter(pt.y, timestamp),
      z: this.filterZ.filter(pt.z, timestamp),
    };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}
