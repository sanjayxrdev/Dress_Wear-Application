export interface BodyPoseCoordinates {
  headX: number;
  headY: number;
  headRadius: number;
  neckX: number;
  neckY: number;
  leftShoulderX: number;
  leftShoulderY: number;
  rightShoulderX: number;
  rightShoulderY: number;
  torsoWidth: number;
  torsoHeight: number;
  tiltAngle: number;
  confidence: number;
}

export interface TrackerOptions {
  smoothingFactor?: number;
  garmentScale?: number;
  verticalOffset?: number;
}

export class RealtimeGarmentTracker {
  private lastPose: BodyPoseCoordinates | null = null;
  private garmentImageCache: Map<string, HTMLImageElement> = new Map();
  private sampleCanvas: HTMLCanvasElement;
  private sampleCtx: CanvasRenderingContext2D | null;

  constructor() {
    this.sampleCanvas = document.createElement("canvas");
    this.sampleCanvas.width = 160;
    this.sampleCanvas.height = 120;
    this.sampleCtx = this.sampleCanvas.getContext("2d", { willReadFrequently: true });
  }

  public preloadGarment(url: string): Promise<HTMLImageElement> {
    if (this.garmentImageCache.has(url)) {
      return Promise.resolve(this.garmentImageCache.get(url)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.garmentImageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          this.garmentImageCache.set(url, fallbackImg);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = reject;
        fallbackImg.src = url;
      };
      img.src = url;
    });
  }

  public estimatePose(video: HTMLVideoElement): BodyPoseCoordinates {
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    if (!this.sampleCtx || video.readyState < 2) {
      return this.getDefaultPose(vw, vh);
    }

    const sw = this.sampleCanvas.width;
    const sh = this.sampleCanvas.height;
    this.sampleCtx.drawImage(video, 0, 0, sw, sh);

    const imgData = this.sampleCtx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    let faceWeightSum = 0;
    let faceXSum = 0;
    let faceYSum = 0;

    const upperLimitY = Math.floor(sh * 0.65);
    const minX = Math.floor(sw * 0.15);
    const maxX = Math.floor(sw * 0.85);

    for (let y = Math.floor(sh * 0.08); y < upperLimitY; y += 2) {
      for (let x = minX; x < maxX; x += 2) {
        const idx = (y * sw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (r > 60 && g > 40 && b > 20 && r > g && r - b > 15) {
          const weight = (r - g) * 1.5 + (r - b);
          faceWeightSum += weight;
          faceXSum += x * weight;
          faceYSum += y * weight;
        }
      }
    }

    let detectedHeadX = vw * 0.5;
    let detectedHeadY = vh * 0.28;
    let confidence = 0.5;

    if (faceWeightSum > 300) {
      // Mirrored horizontal position since preview is flipped
      const normX = 1.0 - (faceXSum / faceWeightSum / sw);
      const normY = faceYSum / faceWeightSum / sh;
      detectedHeadX = normX * vw;
      detectedHeadY = Math.max(vh * 0.15, Math.min(vh * 0.45, normY * vh));
      confidence = 0.9;
    }

    const headRadius = vh * 0.14;
    const neckY = detectedHeadY + headRadius * 1.05;
    const torsoWidth = headRadius * 3.4;
    const torsoHeight = vh * 0.52;

    const leftShoulderX = detectedHeadX - torsoWidth * 0.5;
    const leftShoulderY = neckY + headRadius * 0.25;
    const rightShoulderX = detectedHeadX + torsoWidth * 0.5;
    const rightShoulderY = neckY + headRadius * 0.25;

    const currentPose: BodyPoseCoordinates = {
      headX: detectedHeadX,
      headY: detectedHeadY,
      headRadius,
      neckX: detectedHeadX,
      neckY,
      leftShoulderX,
      leftShoulderY,
      rightShoulderX,
      rightShoulderY,
      torsoWidth,
      torsoHeight,
      tiltAngle: 0,
      confidence,
    };

    if (!this.lastPose) {
      this.lastPose = currentPose;
      return currentPose;
    }

    const alpha = 0.35;
    const smoothed: BodyPoseCoordinates = {
      headX: this.lastPose.headX + alpha * (currentPose.headX - this.lastPose.headX),
      headY: this.lastPose.headY + alpha * (currentPose.headY - this.lastPose.headY),
      headRadius: this.lastPose.headRadius + alpha * (currentPose.headRadius - this.lastPose.headRadius),
      neckX: this.lastPose.neckX + alpha * (currentPose.neckX - this.lastPose.neckX),
      neckY: this.lastPose.neckY + alpha * (currentPose.neckY - this.lastPose.neckY),
      leftShoulderX: this.lastPose.leftShoulderX + alpha * (currentPose.leftShoulderX - this.lastPose.leftShoulderX),
      leftShoulderY: this.lastPose.leftShoulderY + alpha * (currentPose.leftShoulderY - this.lastPose.leftShoulderY),
      rightShoulderX: this.lastPose.rightShoulderX + alpha * (currentPose.rightShoulderX - this.lastPose.rightShoulderX),
      rightShoulderY: this.lastPose.rightShoulderY + alpha * (currentPose.rightShoulderY - this.lastPose.rightShoulderY),
      torsoWidth: this.lastPose.torsoWidth + alpha * (currentPose.torsoWidth - this.lastPose.torsoWidth),
      torsoHeight: this.lastPose.torsoHeight + alpha * (currentPose.torsoHeight - this.lastPose.torsoHeight),
      tiltAngle: 0,
      confidence: currentPose.confidence,
    };

    this.lastPose = smoothed;
    return smoothed;
  }

  /**
   * Transparent overlay: clears canvas and draws ONLY the garment onto the upper body
   * Leaves face, hair, and camera background 100% visible through transparency!
   */
  public renderGarmentOverlayOnly(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    garmentImgUrl: string,
    options: TrackerOptions = {}
  ): BodyPoseCoordinates {
    const ctx = canvas.getContext("2d");
    if (!ctx) return this.getDefaultPose(canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;

    // Clear previous overlay frame
    ctx.clearRect(0, 0, width, height);

    const pose = this.estimatePose(video);
    const garment = this.garmentImageCache.get(garmentImgUrl);

    if (garment && garment.complete && garment.naturalWidth > 0) {
      const scale = options.garmentScale || 1.15;
      const vOffset = options.verticalOffset || 0;

      const garmentW = pose.torsoWidth * 1.55 * scale;
      const garmentH = garmentW * (garment.naturalHeight / garment.naturalWidth);

      const garmentX = pose.neckX - garmentW / 2;
      const garmentY = pose.neckY - pose.headRadius * 0.35 + vOffset;

      ctx.save();

      // Subtle drop shadow for fabric depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;

      // Clip neckline so user's head, chin, and neck are unobstructed
      ctx.beginPath();
      ctx.rect(garmentX - 50, garmentY - 20, garmentW + 100, garmentH + 100);
      ctx.arc(pose.headX, pose.headY + pose.headRadius * 0.7, pose.headRadius * 0.85, 0, Math.PI * 2, true);
      ctx.clip();

      ctx.globalAlpha = 0.96;
      ctx.drawImage(garment, garmentX, garmentY, garmentW, garmentH);

      ctx.restore();
    }

    return pose;
  }

  private getDefaultPose(vw: number, vh: number): BodyPoseCoordinates {
    const headRadius = vh * 0.14;
    return {
      headX: vw * 0.5,
      headY: vh * 0.28,
      headRadius,
      neckX: vw * 0.5,
      neckY: vh * 0.42,
      leftShoulderX: vw * 0.25,
      leftShoulderY: vh * 0.46,
      rightShoulderX: vw * 0.75,
      rightShoulderY: vh * 0.46,
      torsoWidth: vw * 0.48,
      torsoHeight: vh * 0.52,
      tiltAngle: 0,
      confidence: 0.5,
    };
  }
}
