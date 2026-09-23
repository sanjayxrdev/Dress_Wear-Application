import {
  GarmentPayload,
  QualityMetrics,
  SessionState,
  VTONError,
  VTONErrorCode,
  VTON_ERROR_CATALOG,
} from './types';

export interface IVTONProvider {
  connect(stream: MediaStream): Promise<MediaStream>;
  setGarment(garment: GarmentPayload): Promise<void>;
  disconnect(): Promise<void>;
  onStatus(callback: (status: SessionState) => void): () => void;
  onError(callback: (error: VTONError) => void): () => void;
  getMetrics(): QualityMetrics;
  getState(): SessionState;
}

export abstract class BaseVTONProvider implements IVTONProvider {
  protected state: SessionState = 'idle';
  protected statusListeners = new Set<(status: SessionState) => void>();
  protected errorListeners = new Set<(error: VTONError) => void>();
  protected currentGarment: GarmentPayload | null = null;
  protected metrics: QualityMetrics = {
    ttfrMs: 0,
    latencyMs: 0,
    fps: 0,
    stabilityScore: 95,
    reconnectCount: 0,
    lastUpdated: new Date().toISOString(),
  };

  abstract connect(stream: MediaStream): Promise<MediaStream>;
  abstract setGarment(garment: GarmentPayload): Promise<void>;
  abstract disconnect(): Promise<void>;

  public onStatus(callback: (status: SessionState) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.state);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public onError(callback: (error: VTONError) => void): () => void {
    this.errorListeners.add(callback);
    return () => {
      this.errorListeners.delete(callback);
    };
  }

  public getMetrics(): QualityMetrics {
    return { ...this.metrics };
  }

  public getState(): SessionState {
    return this.state;
  }

  protected setState(newState: SessionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.statusListeners.forEach((listener) => listener(newState));
    }
  }

  protected emitError(code: VTONErrorCode, technicalDetails?: string): void {
    const errorInfo = VTON_ERROR_CATALOG[code] || {
      userMessage: 'An unexpected fitting room error occurred.',
      recoveryAction: 'Please refresh and try again.',
    };

    const vtonError: VTONError = {
      code,
      message: errorInfo.userMessage,
      userMessage: errorInfo.userMessage,
      recoveryAction: errorInfo.recoveryAction,
      timestamp: new Date().toISOString(),
      technicalDetails,
    };

    // Never leak raw provider internals to callers
    this.errorListeners.forEach((listener) => listener(vtonError));
  }
}
