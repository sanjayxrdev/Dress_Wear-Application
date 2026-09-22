export interface LightingAnalysisResult {
  score: number; // 0-100
  brightnessLevel: "too_dark" | "optimal" | "too_bright";
  contrastLevel: "low" | "optimal" | "harsh";
  advisoryMessage: string;
  isReady: boolean;
}

/**
 * Evaluates real-time lighting quality and framing contrast on a hidden 2D canvas
 */
export function analyzeVideoLighting(
  videoElement: HTMLVideoElement,
  sampleCanvas?: HTMLCanvasElement
): LightingAnalysisResult {
  const canvas = sampleCanvas || document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    return {
      score: 50,
      brightnessLevel: "optimal",
      contrastLevel: "optimal",
      advisoryMessage: "Aligning camera sensor...",
      isReady: true,
    };
  }

  // Downsample to 64x64 for instant 60fps analysis without blocking main thread
  canvas.width = 64;
  canvas.height = 64;

  ctx.drawImage(videoElement, 0, 0, 64, 64);
  const imageData = ctx.getImageData(0, 0, 64, 64);
  const data = imageData.data;

  let totalLuminance = 0;
  const luminances: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Standard perceptual ITU-R BT.709 luminance formula
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    totalLuminance += lum;
    luminances.push(lum);
  }

  const avgLuminance = totalLuminance / luminances.length;

  // Calculate standard deviation for contrast
  let variance = 0;
  for (const lum of luminances) {
    variance += Math.pow(lum - avgLuminance, 2);
  }
  const stdDev = Math.sqrt(variance / luminances.length);

  let brightnessLevel: "too_dark" | "optimal" | "too_bright" = "optimal";
  let contrastLevel: "low" | "optimal" | "harsh" = "optimal";
  let message = "Lighting looks optimal. Subject ready.";
  let score = 90;
  let isReady = true;

  if (avgLuminance < 60) {
    brightnessLevel = "too_dark";
    score -= 35;
    message = "Low light detected. Face towards a direct or soft light source.";
    isReady = false;
  } else if (avgLuminance > 215) {
    brightnessLevel = "too_bright";
    score -= 25;
    message = "High glare detected. Reduce direct backlight or harsh glare.";
  }

  if (stdDev < 20) {
    contrastLevel = "low";
    score -= 20;
    if (brightnessLevel === "optimal") {
      message = "Low subject separation. Step back from the background.";
    }
  } else if (stdDev > 85) {
    contrastLevel = "harsh";
    score -= 15;
    if (brightnessLevel === "optimal") {
      message = "Harsh directional shadow detected. Diffuse light if possible.";
    }
  }

  return {
    score: Math.max(10, Math.min(100, Math.round(score))),
    brightnessLevel,
    contrastLevel,
    advisoryMessage: message,
    isReady,
  };
}
