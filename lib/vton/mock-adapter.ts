import { BaseVTONProvider } from './provider';
import { SessionStateMachine } from './state-machine';
import { GarmentPayload, QualityMetrics, SessionState, VTONError, VTONErrorCode } from './types';

export class MockVTONProvider extends BaseVTONProvider {
  private inputStream: MediaStream | null = null;
  private outputStream: MediaStream | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private garmentImage: HTMLImageElement | null = null;
  private isProcessing = false;
  private animationFrameId: number | null = null;
  private stateMachine: SessionStateMachine;
  private connectionStartTime = 0;
  private frameCount = 0;
  private lastFpsCalcTime = 0;

  constructor() {
    super();
    this.stateMachine = new SessionStateMachine({
      connectionTimeoutMs: 12000,
      idleTimeoutSec: 90,
      onStateChange: (state: SessionState) => this.setState(state),
      onError: (error: VTONError) => this.emitError(error.code, error.technicalDetails),
    });
  }

  public async connect(stream: MediaStream): Promise<MediaStream> {
    this.connectionStartTime = Date.now();
    this.inputStream = stream;
    this.stateMachine.transitionTo('connecting');

    // Simulate realistic WebRTC peer connection handshake (350-650ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (typeof window === 'undefined') {
      this.stateMachine.transitionTo('live');
      return stream;
    }

    try {
      // Create offscreen video element to feed the rendering canvas
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.muted = true;
      this.videoElement.playsInline = true;
      await this.videoElement.play();

      const width = this.videoElement.videoWidth || 640;
      const height = this.videoElement.videoHeight || 480;

      this.canvas = document.createElement('canvas');
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx = this.canvas.getContext('2d', { alpha: false });

      // Generate MediaStream from the simulated VTON canvas at 30 FPS
      if (typeof (this.canvas as any).captureStream === 'function') {
        this.outputStream = (this.canvas as any).captureStream(30);
      } else {
        // Fallback for environments lacking captureStream
        this.outputStream = stream;
      }

      this.isProcessing = true;
      this.startRenderLoop();

      // Compute Time-To-First-Render
      const ttfr = Date.now() - this.connectionStartTime;
      this.metrics.ttfrMs = ttfr;
      this.metrics.latencyMs = 165;
      this.metrics.fps = 30.0;
      this.metrics.stabilityScore = 96.5;

      this.stateMachine.transitionTo('live');
      return this.outputStream || stream;
    } catch (err: any) {
      console.warn('MockVTONProvider connect fallback:', err);
      this.stateMachine.transitionTo('live');
      return stream;
    }
  }

  public async setGarment(garment: GarmentPayload): Promise<void> {
    if (!garment.image) {
      this.emitError('INVALID_GARMENT_IMAGE', 'Garment image URL is empty or missing');
      return;
    }

    this.currentGarment = garment;
    this.stateMachine.touchActivity();
    this.stateMachine.transitionTo('switching');

    // Atomic switch: preload new garment image in memory
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load garment image'));
        img.src = garment.image;
      });

      this.garmentImage = img;
      // Brief simulated warp recalculation time (< 80ms)
      await new Promise((resolve) => setTimeout(resolve, 60));
      this.stateMachine.transitionTo('live');
    } catch (err) {
      this.emitError('INVALID_GARMENT_IMAGE', 'Failed to load selected garment image');
      this.stateMachine.transitionTo('live');
    }
  }

  public async disconnect(): Promise<void> {
    this.isProcessing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    if (this.outputStream) {
      this.outputStream.getTracks().forEach((track) => track.stop());
      this.outputStream = null;
    }

    this.canvas = null;
    this.ctx = null;
    this.garmentImage = null;
    this.inputStream = null;

    this.stateMachine.transitionTo('ended');
    this.stateMachine.reset();
  }

  public simulateError(code: VTONErrorCode, details?: string): void {
    this.emitError(code, details);
    if (code === 'PROVIDER_OUTAGE' || code === 'NETWORK_DROP') {
      this.stateMachine.handleNetworkInterruption();
    }
  }

  private startRenderLoop(): void {
    this.lastFpsCalcTime = performance.now();
    this.frameCount = 0;

    const render = () => {
      if (!this.isProcessing || !this.ctx || !this.canvas || !this.videoElement) {
        return;
      }

      const w = this.canvas.width;
      const h = this.canvas.height;

      // Draw mirrored camera feed
      this.ctx.save();
      this.ctx.translate(w, 0);
      this.ctx.scale(-1, 1);
      this.ctx.drawImage(this.videoElement, 0, 0, w, h);
      this.ctx.restore();

      // Render fitted garment if present
      if (this.garmentImage && this.state !== 'switching') {
        this.renderGarmentOverlay(w, h);
      }

      // Track FPS
      this.frameCount++;
      const now = performance.now();
      if (now - this.lastFpsCalcTime >= 1000) {
        this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCalcTime));
        this.frameCount = 0;
        this.lastFpsCalcTime = now;
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  private renderGarmentOverlay(w: number, h: number): void {
    if (!this.ctx || !this.garmentImage) return;

    this.ctx.save();
    // Torso fitting box coordinates
    const garmentW = w * 0.58;
    const garmentH = h * 0.52;
    const posX = (w - garmentW) / 2;
    const posY = h * 0.28;

    // Subtle natural breathing oscillation
    const oscillation = Math.sin(performance.now() / 450) * 1.5;

    this.ctx.globalAlpha = 0.95;
    this.ctx.drawImage(
      this.garmentImage,
      posX,
      posY + oscillation,
      garmentW,
      garmentH
    );
    this.ctx.restore();
  }
}
