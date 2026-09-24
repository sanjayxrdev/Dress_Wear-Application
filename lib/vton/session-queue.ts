/**
 * StyleTry AI — VTON Realtime Session & Queue Manager
 * Enforces concurrent GPU capacity, queue position, session duration, and idle auto-disconnect.
 */

export interface ActiveSession {
  sessionId: string;
  merchantId: string;
  userId: string;
  startedAt: number;
  lastActiveAt: number;
  maxDurationSec: number;
  idleTimeoutSec: number;
}

export interface QueuedClient {
  queueId: string;
  merchantId: string;
  userId: string;
  joinedAt: number;
  lastPingAt: number;
}

export type QueueResponse =
  | {
      status: 'admitted';
      sessionId: string;
      mode: 'decart_live' | 'mock_webrtc';
      maxDurationSec: number;
      idleTimeoutSec: number;
    }
  | {
      status: 'queued';
      queueId: string;
      position: number;
      estimatedWaitSec: number;
    }
  | {
      status: 'unavailable';
      message: string;
      fallbackToOnDevice: boolean;
    };

class VTONQueueManager {
  private activeSessions = new Map<string, ActiveSession>();
  private queue: QueuedClient[] = [];
  private maxConcurrentSessions = 5;
  private maxDurationSec = 300; // 5 minutes max session length
  private idleTimeoutSec = 90; // 90 seconds idle disconnect
  private maxQueueLength = 25;

  constructor() {
    if (process.env.MAX_CONCURRENT_SESSIONS) {
      const parsed = parseInt(process.env.MAX_CONCURRENT_SESSIONS, 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.maxConcurrentSessions = parsed;
      }
    }
  }

  private pruneStale(): void {
    const now = Date.now();

    // 1. Prune expired or idle active sessions
    for (const [id, session] of this.activeSessions.entries()) {
      const elapsedTotal = (now - session.startedAt) / 1000;
      const elapsedIdle = (now - session.lastActiveAt) / 1000;

      if (elapsedTotal > session.maxDurationSec || elapsedIdle > session.idleTimeoutSec) {
        this.activeSessions.delete(id);
      }
    }

    // 2. Prune abandoned queue entries (no poll for > 15s)
    this.queue = this.queue.filter((q) => now - q.lastPingAt < 15000);

    // 3. Promote front of queue if slots freed
    while (this.activeSessions.size < this.maxConcurrentSessions && this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) break;

      const sessionId = `vton_sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      this.activeSessions.set(sessionId, {
        sessionId,
        merchantId: next.merchantId,
        userId: next.userId,
        startedAt: now,
        lastActiveAt: now,
        maxDurationSec: this.maxDurationSec,
        idleTimeoutSec: this.idleTimeoutSec,
      });
    }
  }

  public requestSession(merchantId = 'merch_atelier_haute', userId = 'usr_guest'): QueueResponse {
    this.pruneStale();
    const now = Date.now();

    // Check if user already has an active session
    for (const session of this.activeSessions.values()) {
      if (session.userId === userId && session.merchantId === merchantId) {
        session.lastActiveAt = now;
        return {
          status: 'admitted',
          sessionId: session.sessionId,
          mode: process.env.DECART_API_KEY ? 'decart_live' : 'mock_webrtc',
          maxDurationSec: session.maxDurationSec,
          idleTimeoutSec: session.idleTimeoutSec,
        };
      }
    }

    // If capacity available, admit immediately
    if (this.activeSessions.size < this.maxConcurrentSessions) {
      const sessionId = `vton_sess_${now}_${Math.random().toString(36).slice(2, 7)}`;
      this.activeSessions.set(sessionId, {
        sessionId,
        merchantId,
        userId,
        startedAt: now,
        lastActiveAt: now,
        maxDurationSec: this.maxDurationSec,
        idleTimeoutSec: this.idleTimeoutSec,
      });

      return {
        status: 'admitted',
        sessionId,
        mode: process.env.DECART_API_KEY ? 'decart_live' : 'mock_webrtc',
        maxDurationSec: this.maxDurationSec,
        idleTimeoutSec: this.idleTimeoutSec,
      };
    }

    // Check queue capacity
    if (this.queue.length >= this.maxQueueLength) {
      return {
        status: 'unavailable',
        message: 'Live AI fitting is currently at maximum capacity. Basic on-device preview is available.',
        fallbackToOnDevice: true,
      };
    }

    // Add to queue
    const queueId = `q_${now}_${Math.random().toString(36).slice(2, 7)}`;
    this.queue.push({
      queueId,
      merchantId,
      userId,
      joinedAt: now,
      lastPingAt: now,
    });

    const position = this.queue.length;
    return {
      status: 'queued',
      queueId,
      position,
      estimatedWaitSec: position * 25,
    };
  }

  public pollQueue(queueId: string): QueueResponse {
    this.pruneStale();
    const now = Date.now();

    // Check if admitted
    for (const session of this.activeSessions.values()) {
      if (session.sessionId.includes(queueId)) {
        return {
          status: 'admitted',
          sessionId: session.sessionId,
          mode: process.env.DECART_API_KEY ? 'decart_live' : 'mock_webrtc',
          maxDurationSec: session.maxDurationSec,
          idleTimeoutSec: session.idleTimeoutSec,
        };
      }
    }

    const index = this.queue.findIndex((q) => q.queueId === queueId);
    if (index === -1) {
      // If slots are open, grant new admission
      if (this.activeSessions.size < this.maxConcurrentSessions) {
        return this.requestSession();
      }
      return {
        status: 'unavailable',
        message: 'Queue entry expired or canceled.',
        fallbackToOnDevice: true,
      };
    }

    // Update ping
    this.queue[index].lastPingAt = now;
    const position = index + 1;

    // If at front and slot available
    if (position === 1 && this.activeSessions.size < this.maxConcurrentSessions) {
      const item = this.queue.splice(index, 1)[0];
      const sessionId = `vton_sess_${now}_${Math.random().toString(36).slice(2, 7)}`;
      this.activeSessions.set(sessionId, {
        sessionId,
        merchantId: item.merchantId,
        userId: item.userId,
        startedAt: now,
        lastActiveAt: now,
        maxDurationSec: this.maxDurationSec,
        idleTimeoutSec: this.idleTimeoutSec,
      });

      return {
        status: 'admitted',
        sessionId,
        mode: process.env.DECART_API_KEY ? 'decart_live' : 'mock_webrtc',
        maxDurationSec: this.maxDurationSec,
        idleTimeoutSec: this.idleTimeoutSec,
      };
    }

    return {
      status: 'queued',
      queueId,
      position,
      estimatedWaitSec: position * 25,
    };
  }

  public leaveQueue(queueId: string): void {
    this.queue = this.queue.filter((q) => q.queueId !== queueId);
  }

  public heartbeat(sessionId: string): boolean {
    this.pruneStale();
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;
    session.lastActiveAt = Date.now();
    return true;
  }

  public releaseSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    this.pruneStale();
  }

  public getStatus() {
    this.pruneStale();
    return {
      activeSessions: this.activeSessions.size,
      maxCapacity: this.maxConcurrentSessions,
      queueLength: this.queue.length,
    };
  }
}

// Singleton in-memory manager
export const vtonQueueManager = new VTONQueueManager();
