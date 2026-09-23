import { SessionState, VTONError, VTONErrorCode } from './types';

export interface StateMachineConfig {
  connectionTimeoutMs?: number;
  idleTimeoutSec?: number;
  maxReconnectAttempts?: number;
  onStateChange: (state: SessionState) => void;
  onError: (error: VTONError) => void;
}

export class SessionStateMachine {
  private currentState: SessionState = 'idle';
  private connectionTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly config: Required<StateMachineConfig>;

  constructor(config: StateMachineConfig) {
    this.config = {
      connectionTimeoutMs: config.connectionTimeoutMs ?? 15000,
      idleTimeoutSec: config.idleTimeoutSec ?? 90,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 3,
      onStateChange: config.onStateChange,
      onError: config.onError,
    };
  }

  public getState(): SessionState {
    return this.currentState;
  }

  public transitionTo(target: SessionState): boolean {
    const valid = this.isValidTransition(this.currentState, target);
    if (!valid) {
      console.warn(`[VTON StateMachine] Invalid transition from ${this.currentState} to ${target}`);
      return false;
    }

    const previousState = this.currentState;
    this.currentState = target;
    this.config.onStateChange(target);

    // Lifecycle side effects
    if (target === 'connecting') {
      this.startConnectionTimer();
    } else {
      this.clearConnectionTimer();
    }

    if (target === 'live') {
      this.reconnectAttempts = 0;
      this.resetIdleTimer();
    } else if (target === 'ended' || target === 'failed') {
      this.clearAllTimers();
    }

    return true;
  }

  public touchActivity(): void {
    if (this.currentState === 'live' || this.currentState === 'switching') {
      this.resetIdleTimer();
    }
  }

  public handleNetworkInterruption(): void {
    if (this.currentState === 'live' || this.currentState === 'switching') {
      if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.transitionTo('connecting');
      } else {
        this.transitionTo('degraded');
      }
    }
  }

  public reset(): void {
    this.clearAllTimers();
    this.reconnectAttempts = 0;
    this.currentState = 'idle';
    this.config.onStateChange('idle');
  }

  private isValidTransition(from: SessionState, to: SessionState): boolean {
    if (from === to) return true;

    const allowedTransitions: Record<SessionState, SessionState[]> = {
      idle: ['permission', 'connecting', 'failed'],
      permission: ['positioning', 'connecting', 'failed', 'ended'],
      positioning: ['connecting', 'failed', 'ended'],
      connecting: ['live', 'degraded', 'failed', 'ended'],
      live: ['switching', 'degraded', 'connecting', 'ended', 'failed'],
      switching: ['live', 'degraded', 'failed', 'ended'],
      degraded: ['live', 'connecting', 'ended', 'failed'],
      ended: ['idle', 'permission'],
      failed: ['idle', 'connecting', 'permission'],
    };

    return allowedTransitions[from]?.includes(to) ?? false;
  }

  private startConnectionTimer(): void {
    this.clearConnectionTimer();
    this.connectionTimer = setTimeout(() => {
      if (this.currentState === 'connecting') {
        this.transitionTo('degraded');
      }
    }, this.config.connectionTimeoutMs);
  }

  private clearConnectionTimer(): void {
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      if (this.currentState === 'live' || this.currentState === 'switching') {
        this.transitionTo('ended');
      }
    }, this.config.idleTimeoutSec * 1000);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private clearAllTimers(): void {
    this.clearConnectionTimer();
    this.clearIdleTimer();
  }
}
