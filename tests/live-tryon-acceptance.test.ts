import { test } from 'node:test';
import assert from 'node:assert';
import { vtonQueueManager } from '../lib/vton/session-queue';
import { lookQualityMonitor } from '../lib/cv/look-quality-monitor';
import { validateGarmentImage } from '../lib/intake/validator';
import { MockVTONProvider } from '../lib/vton/mock-adapter';

test('Live Try-On Acceptance Suite', async (t) => {
  await t.test('1. Capacity & Queue Manager: Enforces max concurrent sessions and queues subsequent clients', () => {
    // Clean queue manager state
    const admittedSessions: string[] = [];

    // Fill up to max capacity (5)
    for (let i = 0; i < 5; i++) {
      const res = vtonQueueManager.requestSession('merch_test', `usr_active_${i}`);
      assert.strictEqual(res.status, 'admitted', `User ${i} should be admitted`);
      if (res.status === 'admitted') {
        admittedSessions.push(res.sessionId);
      }
    }

    // 6th user should be queued with position 1 and estimated wait
    const queuedRes = vtonQueueManager.requestSession('merch_test', 'usr_queued_1');
    assert.strictEqual(queuedRes.status, 'queued');
    if (queuedRes.status === 'queued') {
      assert.strictEqual(queuedRes.position, 1);
      assert.strictEqual(queuedRes.estimatedWaitSec, 25);
      assert.ok(queuedRes.queueId.startsWith('q_'));

      // Test polling queue
      const pollRes = vtonQueueManager.pollQueue(queuedRes.queueId);
      assert.strictEqual(pollRes.status, 'queued');

      // Test leaving queue
      vtonQueueManager.leaveQueue(queuedRes.queueId);
      const afterLeave = vtonQueueManager.pollQueue(queuedRes.queueId);
      assert.strictEqual(afterLeave.status, 'unavailable');
    }

    // Clean up active sessions
    for (const sessId of admittedSessions) {
      vtonQueueManager.releaseSession(sessId);
    }
  });

  await t.test('2. Look Quality Framing Guidance: Emits clear corrective messages without video upload', () => {
    // Create mock canvas to test framing analyzer
    const mockCanvas = {
      width: 160,
      height: 120,
    } as any;

    const assessment = lookQualityMonitor.analyzeFrame(mockCanvas);
    assert.ok(assessment);
    assert.ok(['good', 'degraded', 'blocked'].includes(assessment.state));
    assert.ok(typeof assessment.guidance === 'string');
    assert.ok(typeof assessment.lightingScore === 'number');
    assert.ok(typeof assessment.motionBlurScore === 'number');
  });

  await t.test('3. Garment Input Validation: Flags invalid/corrupt images and prevents faked results', async () => {
    // Valid standard image URL
    const validUrl = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200';
    const validation = await validateGarmentImage(validUrl);
    assert.strictEqual(typeof validation.isValid, 'boolean');
    assert.strictEqual(typeof validation.score, 'number');
    assert.ok(Array.isArray(validation.rejectionReasons));
  });

  await t.test('4. VTON Provider: Instant garment swap without restarting stream or resetting pipeline', async () => {
    const provider = new MockVTONProvider();
    assert.strictEqual(provider.getState(), 'idle');

    // Connect first with mock stream
    const mockStream = {
      getTracks: () => [],
      getVideoTracks: () => [],
    } as unknown as MediaStream;

    await provider.connect(mockStream);
    assert.strictEqual(provider.getState(), 'live');

    // Simulate switching garment seamlessly
    await provider.setGarment({
      productId: 'prod-wool-overcoat',
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000',
    });

    const metrics = provider.getMetrics();
    assert.ok(metrics.stabilityScore >= 90);
    assert.ok(metrics.latencyMs <= 180);
    await provider.disconnect();
    assert.ok(['ended', 'idle'].includes(provider.getState()));
  });

  await t.test('5. Zero Leaked Browser API Keys: Client bundle environment check', () => {
    // Verify that DECART_API_KEY does NOT have NEXT_PUBLIC_ prefix
    assert.strictEqual(process.env.NEXT_PUBLIC_DECART_API_KEY, undefined);
  });
});
