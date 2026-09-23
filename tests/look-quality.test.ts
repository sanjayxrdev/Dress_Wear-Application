import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LookQualityMonitor } from '../lib/cv/look-quality-monitor';

describe('On-Device Look Quality Monitor', () => {
  it('should initialize cleanly and degrade gracefully when offline/SSR', () => {
    const monitor = new LookQualityMonitor();
    // Simulate empty/null video element (SSR environment)
    const assessment = monitor.analyzeFrame(null as any);

    assert.ok(assessment.timestamp > 0);
    assert.strictEqual(assessment.state, 'degraded');
    assert.ok(assessment.guidance.length > 0);
  });

  it('should provide reset capability', () => {
    const monitor = new LookQualityMonitor();
    monitor.reset();
    assert.ok(monitor, 'Monitor should reset without exception');
  });
});
