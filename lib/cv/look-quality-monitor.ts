import { LookQualityAssessment } from '../vton/types';

export class LookQualityMonitor {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private width = 160;
  private height = 120;
  private consecutiveGoodFrames = 0;
  private consecutiveBadFrames = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public analyzeFrame(video: HTMLVideoElement | HTMLCanvasElement): LookQualityAssessment {
    const timestamp = Date.now();

    // SSR fallback
    if (!this.canvas || !this.ctx || !video) {
      return {
        state: 'degraded',
        guidance: 'Initializing camera feed...',
        shouldPauseOverlay: false,
        personDetected: false,
        bodyRegionVisible: false,
        lightingScore: 50,
        motionBlurScore: 50,
        occlusionScore: 50,
        compositeQuality: 50,
        timestamp,
      };
    }

    try {
      this.ctx.drawImage(video, 0, 0, this.width, this.height);
      const imgData = this.ctx.getImageData(0, 0, this.width, this.height);
      const data = imgData.data;

      // 1. Lighting & Luminance Analysis
      let totalLuminance = 0;
      let underExposedCount = 0;
      let overExposedCount = 0;
      const totalPixels = this.width * this.height;

      // Torso Region Box: middle 60% horizontally, 20% to 80% vertically
      const torsoXMin = Math.floor(this.width * 0.2);
      const torsoXMax = Math.floor(this.width * 0.8);
      const torsoYMin = Math.floor(this.height * 0.2);
      const torsoYMax = Math.floor(this.height * 0.8);
      let torsoPixelsWithBody = 0;
      let torsoTotalPixels = 0;

      // 2. Motion Energy / Blur
      let frameDiffEnergy = 0;
      let gradientSum = 0;

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (y * this.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // ITU-R BT.601 luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += lum;

          if (lum < 35) underExposedCount++;
          if (lum > 225) overExposedCount++;

          // High frequency spatial gradient (sharpness / blur)
          if (x < this.width - 1 && y < this.height - 1) {
            const nextIdxX = (y * this.width + (x + 1)) * 4;
            const nextIdxY = ((y + 1) * this.width + x) * 4;
            const lumX = 0.299 * data[nextIdxX] + 0.587 * data[nextIdxX + 1] + 0.114 * data[nextIdxX + 2];
            const lumY = 0.299 * data[nextIdxY] + 0.587 * data[nextIdxY + 1] + 0.114 * data[nextIdxY + 2];
            gradientSum += Math.abs(lum - lumX) + Math.abs(lum - lumY);
          }

          // Frame-to-frame difference for motion blur
          if (this.prevFrameData) {
            const prevLum =
              0.299 * this.prevFrameData[idx] +
              0.587 * this.prevFrameData[idx + 1] +
              0.114 * this.prevFrameData[idx + 2];
            frameDiffEnergy += Math.abs(lum - prevLum);
          }

          // Check torso region coverage & skin/cloth presence
          if (x >= torsoXMin && x <= torsoXMax && y >= torsoYMin && y <= torsoYMax) {
            torsoTotalPixels++;
            // Check if pixel deviates from uniform flat backdrop
            const isNonWhite = lum < 240 && lum > 25;
            const hasColorVariance = Math.abs(r - g) > 6 || Math.abs(g - b) > 6;
            if (isNonWhite && hasColorVariance) {
              torsoPixelsWithBody++;
            }
          }
        }
      }

      this.prevFrameData = new Uint8ClampedArray(data);

      const meanLum = totalLuminance / totalPixels;
      let lightingScore = 100;
      if (meanLum < 45) {
        lightingScore = Math.max(5, Math.round((meanLum / 45) * 60));
      } else if (meanLum > 215) {
        lightingScore = Math.max(10, Math.round(((255 - meanLum) / 40) * 70));
      } else {
        // Ideal range: 70-170
        lightingScore = Math.min(100, Math.round(85 + (1 - Math.abs(meanLum - 120) / 75) * 15));
      }

      // Person presence & body region visibility
      const torsoRatio = torsoTotalPixels > 0 ? torsoPixelsWithBody / torsoTotalPixels : 0;
      const personDetected = torsoRatio > 0.16;
      const bodyRegionVisible = torsoRatio > 0.28 && torsoRatio < 0.88;

      // Sharpness & Motion Blur Score (0-100)
      const avgGradient = gradientSum / totalPixels;
      const avgMotion = frameDiffEnergy / totalPixels;
      let motionBlurScore = 90;
      if (avgMotion > 18) {
        motionBlurScore = Math.max(20, Math.round(100 - avgMotion * 3));
      } else if (avgGradient < 4.5 && personDetected) {
        motionBlurScore = Math.max(30, Math.round(avgGradient * 15));
      }

      // Occlusion analysis in the center chest
      let occlusionScore = 92;
      if (torsoRatio > 0.88) {
        // Person too close to camera, cutting off shoulders
        occlusionScore = 45;
      }

      // Guidance, State, and Overlay Pausing Determination
      let guidance = 'Pose and lighting are optimal.';
      let state: 'good' | 'degraded' | 'blocked' = 'good';
      let shouldPauseOverlay = false;

      if (!personDetected) {
        state = 'blocked';
        guidance = 'Step into the camera view.';
        shouldPauseOverlay = true;
      } else if (lightingScore < 35 || meanLum < 30) {
        // Very dark room: PAUSE overlay and show guidance rather than rendering a distorted result!
        state = 'blocked';
        guidance = 'Face the light. Area is too dark for fitting.';
        shouldPauseOverlay = true;
      } else if (torsoRatio < 0.22) {
        state = 'degraded';
        guidance = 'Move closer.';
        shouldPauseOverlay = false;
      } else if (torsoRatio >= 0.88) {
        state = 'degraded';
        guidance = 'Step back so your shoulders fit in the frame.';
        shouldPauseOverlay = false;
      } else if (!bodyRegionVisible) {
        state = 'degraded';
        guidance = 'Make sure your shoulders are visible.';
        shouldPauseOverlay = false;
      } else if (motionBlurScore < 45) {
        state = 'degraded';
        guidance = 'Hold still for a moment.';
        shouldPauseOverlay = false;
      } else if (lightingScore < 60) {
        state = 'degraded';
        guidance = 'Face the light for optimal fabric drape.';
        shouldPauseOverlay = false;
      } else {
        state = 'good';
        guidance = 'Pose and lighting are optimal.';
        shouldPauseOverlay = false;
      }

      // Frame smoothing
      if (state === 'good') {
        this.consecutiveGoodFrames++;
        this.consecutiveBadFrames = 0;
      } else {
        this.consecutiveBadFrames++;
        this.consecutiveGoodFrames = 0;
      }

      const compositeQuality = Math.round(
        lightingScore * 0.35 +
          motionBlurScore * 0.25 +
          occlusionScore * 0.2 +
          (bodyRegionVisible ? 20 : 0)
      );

      return {
        state,
        guidance,
        shouldPauseOverlay,
        personDetected,
        bodyRegionVisible,
        lightingScore,
        motionBlurScore,
        occlusionScore,
        compositeQuality,
        timestamp,
      };
    } catch (err) {
      console.warn('LookQualityMonitor error:', err);
      return {
        state: 'degraded',
        guidance: 'Adjusting camera tracking...',
        shouldPauseOverlay: false,
        personDetected: true,
        bodyRegionVisible: true,
        lightingScore: 60,
        motionBlurScore: 60,
        occlusionScore: 60,
        compositeQuality: 60,
        timestamp,
      };
    }
  }

  public reset(): void {
    this.prevFrameData = null;
    this.consecutiveGoodFrames = 0;
    this.consecutiveBadFrames = 0;
  }
}

export const lookQualityMonitor = new LookQualityMonitor();
