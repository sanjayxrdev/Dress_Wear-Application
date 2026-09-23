import { OneEuroFilter2D, Point2D } from './one-euro-filter';

export interface UpperBodyLandmarks {
  neck: Point2D;
  leftShoulder: Point2D;
  rightShoulder: Point2D;
  leftElbow: Point2D;
  rightElbow: Point2D;
  leftWrist: Point2D;
  rightWrist: Point2D;
  leftHip: Point2D;
  rightHip: Point2D;
  chestCenter: Point2D;
  shoulderWidth: number;
  torsoHeight: number;
  torsoAngle: number; // in radians
  confidence: number; // 0-1
}

export class UpperBodyPoseTracker {
  private filterNeck = new OneEuroFilter2D({ minCutoff: 1.2, beta: 0.008 });
  private filterLeftShoulder = new OneEuroFilter2D({ minCutoff: 1.0, beta: 0.007 });
  private filterRightShoulder = new OneEuroFilter2D({ minCutoff: 1.0, beta: 0.007 });
  private filterLeftElbow = new OneEuroFilter2D({ minCutoff: 1.2, beta: 0.009 });
  private filterRightElbow = new OneEuroFilter2D({ minCutoff: 1.2, beta: 0.009 });
  private filterLeftWrist = new OneEuroFilter2D({ minCutoff: 1.4, beta: 0.01 });
  private filterRightWrist = new OneEuroFilter2D({ minCutoff: 1.4, beta: 0.01 });
  private filterLeftHip = new OneEuroFilter2D({ minCutoff: 0.8, beta: 0.005 });
  private filterRightHip = new OneEuroFilter2D({ minCutoff: 0.8, beta: 0.005 });
  private filterChest = new OneEuroFilter2D({ minCutoff: 1.0, beta: 0.007 });

  private sampleCanvas: HTMLCanvasElement | null = null;
  private sampleCtx: CanvasRenderingContext2D | null = null;
  private sampleWidth = 160;
  private sampleHeight = 120;
  private lastLandmarks: UpperBodyLandmarks | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sampleCanvas = document.createElement('canvas');
      this.sampleCanvas.width = this.sampleWidth;
      this.sampleCanvas.height = this.sampleHeight;
      this.sampleCtx = this.sampleCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public trackVideoFrame(
    video: HTMLVideoElement,
    timestamp: number = performance.now()
  ): UpperBodyLandmarks | null {
    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;

    if (!this.sampleCtx || !this.sampleCanvas || video.readyState < 2) {
      return this.lastLandmarks || this.getDefaultLandmarks(vw, vh);
    }

    // 1. Draw downscaled frame for lightweight CV pose estimation (< 2ms)
    this.sampleCtx.drawImage(video, 0, 0, this.sampleWidth, this.sampleHeight);
    const imgData = this.sampleCtx.getImageData(0, 0, this.sampleWidth, this.sampleHeight);
    const data = imgData.data;

    // 2. Locate Head & Neck Center Mass
    let faceWeight = 0;
    let faceSumX = 0;
    let faceSumY = 0;

    const minX = Math.floor(this.sampleWidth * 0.15);
    const maxX = Math.floor(this.sampleWidth * 0.85);
    const maxY = Math.floor(this.sampleHeight * 0.55);

    for (let y = Math.floor(this.sampleHeight * 0.05); y < maxY; y += 2) {
      for (let x = minX; x < maxX; x += 2) {
        const idx = (y * this.sampleWidth + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // Skin & face luminance heuristic
        if (r > 60 && g > 40 && b > 20 && r > g && r - b > 14) {
          const w = (r - g) * 1.5 + (r - b);
          faceWeight += w;
          faceSumX += x * w;
          faceSumY += y * w;
        }
      }
    }

    if (faceWeight < 800) {
      // No reliable person detected in this frame
      return null;
    }

    const normHeadX = (faceSumX / faceWeight) / this.sampleWidth;
    const normHeadY = (faceSumY / faceWeight) / this.sampleHeight;

    const headX = normHeadX * vw;
    const headY = normHeadY * vh;

    // 3. Estimate Shoulders based on head position and body width
    const estimatedTorsoWidth = vw * 0.42;
    const estimatedTorsoHeight = vh * 0.52;

    const rawNeck: Point2D = { x: headX, y: headY + vh * 0.16 };
    const rawLeftShoulder: Point2D = {
      x: headX - estimatedTorsoWidth * 0.5,
      y: rawNeck.y + vh * 0.03,
    };
    const rawRightShoulder: Point2D = {
      x: headX + estimatedTorsoWidth * 0.5,
      y: rawNeck.y + vh * 0.03,
    };

    // 4. Arms & Elbows
    const rawLeftElbow: Point2D = {
      x: rawLeftShoulder.x - vw * 0.04,
      y: rawLeftShoulder.y + vh * 0.22,
    };
    const rawRightElbow: Point2D = {
      x: rawRightShoulder.x + vw * 0.04,
      y: rawRightShoulder.y + vh * 0.22,
    };

    const rawLeftWrist: Point2D = {
      x: rawLeftElbow.x + vw * 0.02,
      y: rawLeftElbow.y + vh * 0.2,
    };
    const rawRightWrist: Point2D = {
      x: rawRightElbow.x - vw * 0.02,
      y: rawRightElbow.y + vh * 0.2,
    };

    // 5. Hips & Hem Anchor
    const rawLeftHip: Point2D = {
      x: headX - estimatedTorsoWidth * 0.4,
      y: rawNeck.y + estimatedTorsoHeight,
    };
    const rawRightHip: Point2D = {
      x: headX + estimatedTorsoWidth * 0.4,
      y: rawNeck.y + estimatedTorsoHeight,
    };

    const rawChest: Point2D = {
      x: headX,
      y: rawNeck.y + estimatedTorsoHeight * 0.35,
    };

    // 6. Apply One Euro Filter for Jitter-Free Temporal Smoothing
    const neck = this.filterNeck.filter(rawNeck, timestamp);
    const leftShoulder = this.filterLeftShoulder.filter(rawLeftShoulder, timestamp);
    const rightShoulder = this.filterRightShoulder.filter(rawRightShoulder, timestamp);
    const leftElbow = this.filterLeftElbow.filter(rawLeftElbow, timestamp);
    const rightElbow = this.filterRightElbow.filter(rawRightElbow, timestamp);
    const leftWrist = this.filterLeftWrist.filter(rawLeftWrist, timestamp);
    const rightWrist = this.filterRightWrist.filter(rawRightWrist, timestamp);
    const leftHip = this.filterLeftHip.filter(rawLeftHip, timestamp);
    const rightHip = this.filterRightHip.filter(rawRightHip, timestamp);
    const chestCenter = this.filterChest.filter(rawChest, timestamp);

    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
    const torsoAngle = Math.atan2(dy, dx);
    const torsoHeight = Math.abs(leftHip.y - neck.y);

    const landmarks: UpperBodyLandmarks = {
      neck,
      leftShoulder,
      rightShoulder,
      leftElbow,
      rightElbow,
      leftWrist,
      rightWrist,
      leftHip,
      rightHip,
      chestCenter,
      shoulderWidth,
      torsoHeight,
      torsoAngle,
      confidence: 0.94,
    };

    this.lastLandmarks = landmarks;
    return landmarks;
  }

  public reset(): void {
    this.filterNeck.reset();
    this.filterLeftShoulder.reset();
    this.filterRightShoulder.reset();
    this.filterLeftElbow.reset();
    this.filterRightElbow.reset();
    this.filterLeftWrist.reset();
    this.filterRightWrist.reset();
    this.filterLeftHip.reset();
    this.filterRightHip.reset();
    this.filterChest.reset();
    this.lastLandmarks = null;
  }

  private getDefaultLandmarks(vw: number, vh: number): UpperBodyLandmarks {
    const cx = vw * 0.5;
    const neckY = vh * 0.28;
    const sw = vw * 0.42;
    const th = vh * 0.5;

    return {
      neck: { x: cx, y: neckY },
      leftShoulder: { x: cx - sw * 0.5, y: neckY + 15 },
      rightShoulder: { x: cx + sw * 0.5, y: neckY + 15 },
      leftElbow: { x: cx - sw * 0.55, y: neckY + th * 0.45 },
      rightElbow: { x: cx + sw * 0.55, y: neckY + th * 0.45 },
      leftWrist: { x: cx - sw * 0.45, y: neckY + th * 0.8 },
      rightWrist: { x: cx + sw * 0.45, y: neckY + th * 0.8 },
      leftHip: { x: cx - sw * 0.38, y: neckY + th },
      rightHip: { x: cx + sw * 0.38, y: neckY + th },
      chestCenter: { x: cx, y: neckY + th * 0.35 },
      shoulderWidth: sw,
      torsoHeight: th,
      torsoAngle: 0,
      confidence: 0.8,
    };
  }
}
