import { UpperBodyLandmarks } from './pose-tracker';

export class OcclusionMaskEngine {
  private maskCanvas: HTMLCanvasElement | null = null;
  private maskCtx: CanvasRenderingContext2D | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.maskCanvas = document.createElement('canvas');
      this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true });
    }
  }

  /**
   * Generates a foreground occlusion mask for arms, hands, and hair.
   * Renders the detected foreground regions onto a transparent canvas
   * which can be drawn over the WebGL garment layer.
   */
  public renderForegroundOcclusions(
    targetCanvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    landmarks: UpperBodyLandmarks
  ): void {
    if (!this.maskCanvas || !this.maskCtx || video.readyState < 2) return;

    const w = targetCanvas.width;
    const h = targetCanvas.height;

    if (this.maskCanvas.width !== w || this.maskCanvas.height !== h) {
      this.maskCanvas.width = w;
      this.maskCanvas.height = h;
    }

    // Clear mask canvas
    this.maskCtx.clearRect(0, 0, w, h);

    // 1. Draw video section for chest & torso zone
    const torsoTop = landmarks.neck.y - 20;
    const torsoBottom = Math.max(landmarks.leftHip.y, landmarks.rightHip.y) + 30;
    const torsoLeft = Math.min(landmarks.leftShoulder.x, landmarks.leftHip.x) - 40;
    const torsoRight = Math.max(landmarks.rightShoulder.x, landmarks.rightHip.x) + 40;

    const torsoW = Math.max(10, torsoRight - torsoLeft);
    const torsoH = Math.max(10, torsoBottom - torsoTop);

    // Draw torso rectangle of video
    this.maskCtx.drawImage(
      video,
      torsoLeft,
      torsoTop,
      torsoW,
      torsoH,
      torsoLeft,
      torsoTop,
      torsoW,
      torsoH
    );

    const imgData = this.maskCtx.getImageData(torsoLeft, torsoTop, torsoW, torsoH);
    const data = imgData.data;

    // 2. Identify skin tone (arms/hands) and hair pixels in the torso area
    // to keep them in front of the garment
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Skin tone detection in RGB
      const isSkin =
        r > 60 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r - b > 14 &&
        Math.abs(r - g) > 8;

      // Dark hair or jewelry detection
      const isHairOrDarkAccent = r < 40 && g < 40 && b < 40;

      if (isSkin || isHairOrDarkAccent) {
        // Keep foreground pixel with alpha feathering
        data[i + 3] = 255;
      } else {
        // Make non-foreground pixels transparent so the garment shows underneath
        data[i + 3] = 0;
      }
    }

    this.maskCtx.putImageData(imgData, torsoLeft, torsoTop);

    // 3. Composite the foreground arms/hair onto the target canvas over the garment
    const targetCtx = targetCanvas.getContext('2d');
    if (targetCtx) {
      targetCtx.save();
      targetCtx.globalCompositeOperation = 'source-over';
      targetCtx.drawImage(this.maskCanvas, 0, 0);
      targetCtx.restore();
    }
  }
}
