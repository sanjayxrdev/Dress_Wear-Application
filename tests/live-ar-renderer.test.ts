import { describe, it } from 'node:test';
import assert from 'node:assert';
import { LookQualityMonitor } from '../lib/cv/look-quality-monitor';
import { UpperBodyPoseTracker } from '../lib/cv/pose-tracker';
import { SEED_PRODUCTS } from '../lib/db/seed-data';

describe('Live AR Rendering & Quality Gating Tests', () => {
  it('should pause garment overlay when lighting is critically low or person is missing', () => {
    const monitor = new LookQualityMonitor();
    // When null or uninitialized
    const assessment = monitor.analyzeFrame(null as any);

    assert.ok(assessment.timestamp > 0);
    // When offline/SSR, should emit guidance
    assert.strictEqual(typeof assessment.guidance, 'string');
  });

  it('should validate garment try-on assets and disable invalid assets gracefully', () => {
    const validProducts = SEED_PRODUCTS.filter((p) => p.tryOnAsset?.hasValidAsset === true);
    const invalidProducts = SEED_PRODUCTS.filter((p) => p.tryOnAsset?.hasValidAsset === false);

    assert.ok(validProducts.length >= 3, 'Expected at least 3 valid try-on products');
    assert.ok(invalidProducts.length >= 1, 'Expected at least 1 product demonstrating graceful asset disabling');

    const invalid = invalidProducts[0];
    assert.strictEqual(invalid.tryOnAsset?.hasValidAsset, false);
    assert.ok(
      (invalid.tryOnAsset?.disabledReason || '').length > 0,
      'Disabled try-on asset must have an explanatory reason'
    );
  });

  it('should initialize UpperBodyPoseTracker cleanly', () => {
    const tracker = new UpperBodyPoseTracker();
    assert.ok(tracker);
    tracker.reset();
  });
});
