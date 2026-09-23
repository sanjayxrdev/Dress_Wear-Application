import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MockVTONProvider } from '../lib/vton/mock-adapter';
import { SessionStateMachine } from '../lib/vton/state-machine';
import { SessionState, VTONError } from '../lib/vton/types';

describe('VTON Provider & State Machine Architecture', () => {
  it('should manage valid state machine transitions cleanly', () => {
    const states: SessionState[] = [];
    const sm = new SessionStateMachine({
      onStateChange: (state) => states.push(state),
      onError: () => {},
    });

    assert.strictEqual(sm.getState(), 'idle');

    // idle -> connecting
    const ok1 = sm.transitionTo('connecting');
    assert.strictEqual(ok1, true);
    assert.strictEqual(sm.getState(), 'connecting');

    // connecting -> live
    const ok2 = sm.transitionTo('live');
    assert.strictEqual(ok2, true);
    assert.strictEqual(sm.getState(), 'live');

    // live -> switching
    const ok3 = sm.transitionTo('switching');
    assert.strictEqual(ok3, true);
    assert.strictEqual(sm.getState(), 'switching');

    // switching -> live (atomic switch back)
    const ok4 = sm.transitionTo('live');
    assert.strictEqual(ok4, true);

    // live -> ended
    const ok5 = sm.transitionTo('ended');
    assert.strictEqual(ok5, true);
    assert.strictEqual(sm.getState(), 'ended');
  });

  it('should reject invalid state transitions', () => {
    const sm = new SessionStateMachine({
      onStateChange: () => {},
      onError: () => {},
    });

    // Cannot jump from idle directly to switching
    const invalid = sm.transitionTo('switching');
    assert.strictEqual(invalid, false);
    assert.strictEqual(sm.getState(), 'idle');
  });

  it('should emit typed error codes without leaking internal errors', async () => {
    const provider = new MockVTONProvider();
    const errors: VTONError[] = [];

    provider.onError((err) => {
      errors.push(err);
    });

    // Test invalid garment error
    await provider.setGarment({
      productId: 'test',
      image: '', // Missing image triggers typed error
    });

    assert.strictEqual(errors.length, 1);
    assert.strictEqual(errors[0].code, 'INVALID_GARMENT_IMAGE');
    assert.ok(errors[0].userMessage.length > 0);
    assert.ok(errors[0].recoveryAction.length > 0);
  });
});
