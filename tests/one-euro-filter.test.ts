import { describe, it } from 'node:test';
import assert from 'node:assert';
import { OneEuroFilter, OneEuroFilter2D, OneEuroFilter3D } from '../lib/cv/one-euro-filter';

describe('One Euro Filter for Temporal Landmark Smoothing', () => {
  it('should eliminate high-frequency micro-jitter on stationary coordinates', () => {
    const filter = new OneEuroFilter({ minCutoff: 1.0, beta: 0.007 });
    const baseline = 200.0;
    const noisySamples = [];
    const filteredSamples = [];

    // Simulate 60 frames of a stationary user with camera sensor noise (+/- 2.5px)
    for (let i = 0; i < 60; i++) {
      const timestamp = i * 16.66; // 60 FPS in ms
      const noise = (Math.sin(i * 1.5) + Math.cos(i * 2.3)) * 2.5;
      const rawValue = baseline + noise;
      noisySamples.push(rawValue);

      const filtered = filter.filter(rawValue, timestamp);
      filteredSamples.push(filtered);
    }

    // Compute variance of raw vs filtered (excluding first 5 warm-up frames)
    const rawSlice = noisySamples.slice(5);
    const filteredSlice = filteredSamples.slice(5);

    const calcVar = (arr: number[]) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
    };

    const rawVar = calcVar(rawSlice);
    const filteredVar = calcVar(filteredSlice);

    assert.ok(
      filteredVar < rawVar * 0.4,
      `Expected filtered variance (${filteredVar}) to be significantly lower than raw variance (${rawVar})`
    );
  });

  it('should adaptively respond with low latency during rapid movements', () => {
    const filter = new OneEuroFilter({ minCutoff: 1.0, beta: 0.015 });

    // Initial steady state at 100px
    let t = 0;
    for (let i = 0; i < 20; i++) {
      t += 16.66;
      filter.filter(100, t);
    }

    // Rapid jump to 300px (fast arm raise)
    t += 16.66;
    const firstStep = filter.filter(300, t);

    // After fast motion, beta should expand cutoff and allow responsive tracking
    t += 16.66;
    const secondStep = filter.filter(300, t);

    assert.ok(
      secondStep > 200,
      `Filter should rapidly adapt to fast movement, got ${secondStep}`
    );
  });

  it('should filter 2D and 3D landmark points cleanly', () => {
    const filter2D = new OneEuroFilter2D();
    const filter3D = new OneEuroFilter3D();

    const pt2 = filter2D.filter({ x: 150, y: 300 }, 16.66);
    assert.strictEqual(typeof pt2.x, 'number');
    assert.strictEqual(typeof pt2.y, 'number');

    const pt3 = filter3D.filter({ x: 100, y: 200, z: 50 }, 16.66);
    assert.strictEqual(typeof pt3.x, 'number');
    assert.strictEqual(typeof pt3.y, 'number');
    assert.strictEqual(typeof pt3.z, 'number');
  });
});
