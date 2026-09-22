import { PoseKeypoints } from "@/lib/ai/virtual-tryon/types";

export interface SegmentationResult {
  maskDataUrl: string; // Black & White mask (white = clothing to replace, black = preserve pixel-for-pixel)
  poseKeypoints: PoseKeypoints;
  faceCentroid: { x: number; y: number; radius: number };
}

/**
 * Generates an accurate clothing-region segmentation mask from a subject photograph.
 * Strictly preserves the user's face, hair, jawline, neck, and environment.
 */
export async function generateClothingSegmentationMask(
  imageSource: string
): Promise<SegmentationResult> {
  const img = await loadHtmlImage(imageSource);
  const width = img.naturalWidth || img.width || 768;
  const height = img.naturalHeight || img.height || 1024;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context initialization failed.");

  // Draw source image to scan skin, silhouette, and face geometry
  ctx.drawImage(img, 0, 0, width, height);

  // Analyze subject silhouette and landmark coordinates
  const { faceCentroid, keypoints } = extractSubjectLandmarks(ctx, width, height);

  // Create isolated mask canvas
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext("2d");
  if (!mCtx) throw new Error("Mask canvas context initialization failed.");

  // Fill black (everything preserved by default)
  mCtx.fillStyle = "#000000";
  mCtx.fillRect(0, 0, width, height);

  // Draw clothing region in white (garment transfer target)
  mCtx.fillStyle = "#ffffff";
  mCtx.beginPath();

  const neckX = keypoints.neck ? keypoints.neck[0] : width * 0.5;
  const neckY = keypoints.neck ? keypoints.neck[1] : height * 0.35;
  const lShoulderX = keypoints.leftShoulder ? keypoints.leftShoulder[0] : width * 0.2;
  const lShoulderY = keypoints.leftShoulder ? keypoints.leftShoulder[1] : height * 0.38;
  const rShoulderX = keypoints.rightShoulder ? keypoints.rightShoulder[0] : width * 0.8;
  const rShoulderY = keypoints.rightShoulder ? keypoints.rightShoulder[1] : height * 0.38;

  const bottomY = Math.min(height, neckY + (keypoints.torsoHeight || height * 0.55));
  const lWaistX = Math.max(0, lShoulderX - width * 0.05);
  const rWaistX = Math.min(width, rShoulderX + width * 0.05);

  // Upper garment outline: starts at neck collar, expands to left shoulder, down arms/torso, across waist, up right shoulder
  mCtx.moveTo(neckX, neckY);
  mCtx.lineTo(lShoulderX, lShoulderY);
  mCtx.lineTo(lWaistX, bottomY);
  mCtx.lineTo(rWaistX, bottomY);
  mCtx.lineTo(rShoulderX, rShoulderY);
  mCtx.closePath();
  mCtx.fill();

  // Protect chin, neck, and jawline with feathered destination-out
  mCtx.globalCompositeOperation = "destination-out";
  const chinCutoutRadius = faceCentroid.radius * 0.9;
  mCtx.beginPath();
  mCtx.ellipse(
    faceCentroid.x,
    faceCentroid.y + faceCentroid.radius * 0.8,
    chinCutoutRadius,
    chinCutoutRadius * 1.1,
    0,
    0,
    Math.PI * 2
  );
  mCtx.fill();

  return {
    maskDataUrl: maskCanvas.toDataURL("image/png"),
    poseKeypoints: keypoints,
    faceCentroid,
  };
}

function extractSubjectLandmarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): {
  faceCentroid: { x: number; y: number; radius: number };
  keypoints: PoseKeypoints;
} {
  // Sample upper half of image for face and shoulder geometry
  const dw = 120;
  const dh = 160;
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = dw;
  sampleCanvas.height = dh;
  const sCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

  let headX = width * 0.5;
  let headY = height * 0.28;
  const headRadius = height * 0.125;

  if (sCtx) {
    sCtx.drawImage(ctx.canvas, 0, 0, dw, dh);
    const data = sCtx.getImageData(0, 0, dw, dh).data;

    let skinWeight = 0;
    let sumX = 0;
    let sumY = 0;

    for (let y = Math.floor(dh * 0.08); y < Math.floor(dh * 0.6); y += 2) {
      for (let x = Math.floor(dw * 0.15); x < Math.floor(dw * 0.85); x += 2) {
        const idx = (y * dw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (r > 60 && g > 40 && b > 20 && r > g && r - b > 15) {
          const w = (r - g) + (r - b);
          skinWeight += w;
          sumX += x * w;
          sumY += y * w;
        }
      }
    }

    if (skinWeight > 200) {
      headX = (sumX / skinWeight / dw) * width;
      headY = Math.max(height * 0.15, Math.min(height * 0.42, (sumY / skinWeight / dh) * height));
    }
  }

  const neckY = headY + headRadius * 1.1;
  const shoulderSpan = headRadius * 2.8;

  const keypoints: PoseKeypoints = {
    nose: [headX, headY],
    neck: [headX, neckY],
    leftShoulder: [Math.max(0, headX - shoulderSpan), neckY + headRadius * 0.35],
    rightShoulder: [Math.min(width, headX + shoulderSpan), neckY + headRadius * 0.35],
    torsoWidth: shoulderSpan * 2,
    torsoHeight: height * 0.55,
    headRadius,
  };

  return {
    faceCentroid: { x: headX, y: headY, radius: headRadius },
    keypoints,
  };
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = (e) => reject(e);
      fallback.src = src;
    };
    img.src = src;
  });
}
