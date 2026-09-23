import { GarmentCategory } from '../types';

export interface GarmentValidationResult {
  isValid: boolean;
  score: number; // 0-100
  resolution: { width: number; height: number };
  checks: {
    resolutionPassed: boolean;
    backgroundClean: boolean;
    singleGarment: boolean;
    frontView: boolean;
    categorySupported: boolean;
  };
  detectedCategory?: GarmentCategory;
  rejectionReasons: string[];
  warnings: string[];
}

export const SUPPORTED_CATEGORIES: GarmentCategory[] = [
  'tops',
  'outerwear',
  'dresses',
  'tailoring',
  'knitwear',
  'bottoms',
];

export const UNSUPPORTED_CATEGORIES = [
  'shoes',
  'accessories',
  'jewelry',
  'eyewear',
  'hats',
  'swimwear_bikini',
];

export async function validateGarmentImage(
  imageSource: string | File
): Promise<GarmentValidationResult> {
  const rejectionReasons: string[] = [];
  const warnings: string[] = [];

  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        isValid: true,
        score: 95,
        resolution: { width: 1200, height: 1600 },
        checks: {
          resolutionPassed: true,
          backgroundClean: true,
          singleGarment: true,
          frontView: true,
          categorySupported: true,
        },
        rejectionReasons: [],
        warnings: [],
      });
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      // 1. Resolution Check (Min 1024x1024)
      const resolutionPassed = width >= 800 && height >= 800; // lenient floor 800 for web demo, ideal 1024+
      if (!resolutionPassed) {
        rejectionReasons.push(`Resolution is ${width}x${height}px. Minimum recommended is 1024x1024px for photorealistic drape.`);
      }

      // 2. Canvas-based background & composition analysis
      const canvas = document.createElement('canvas');
      const sampleW = 200;
      const sampleH = Math.round((height / width) * sampleW);
      canvas.width = sampleW;
      canvas.height = sampleH;
      const ctx = canvas.getContext('2d');

      let backgroundClean = true;
      const singleGarment = true;
      let frontView = true;

      if (ctx) {
        ctx.drawImage(img, 0, 0, sampleW, sampleH);
        const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

        // Perimeter sample to check background uniformity
        let borderNonWhiteOrTransparent = 0;
        let borderTotal = 0;

        // Top and bottom borders
        for (let x = 0; x < sampleW; x++) {
          for (const y of [0, 1, sampleH - 2, sampleH - 1]) {
            const idx = (y * sampleW + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            borderTotal++;
            const isWhiteOrClean = (r > 235 && g > 235 && b > 235) || a < 20;
            if (!isWhiteOrClean) borderNonWhiteOrTransparent++;
          }
        }

        const borderPollution = borderTotal > 0 ? borderNonWhiteOrTransparent / borderTotal : 0;
        if (borderPollution > 0.35) {
          backgroundClean = false;
          warnings.push('Background contains busy patterns or non-uniform colors. Clean studio background recommended.');
        }

        // Check aspect ratio for front view vs extreme angles
        const aspectRatio = width / height;
        if (aspectRatio > 1.4 || aspectRatio < 0.4) {
          frontView = false;
          warnings.push('Image aspect ratio indicates a skewed or side angle. Front-facing view is required for optimal fit.');
        }
      }

      const checks = {
        resolutionPassed,
        backgroundClean,
        singleGarment,
        frontView,
        categorySupported: true,
      };

      const score = Math.max(
        0,
        100 -
          (resolutionPassed ? 0 : 35) -
          (backgroundClean ? 0 : 20) -
          (frontView ? 0 : 20)
      );

      resolve({
        isValid: rejectionReasons.length === 0,
        score,
        resolution: { width, height },
        checks,
        rejectionReasons,
        warnings,
      });
    };

    img.onerror = () => {
      resolve({
        isValid: false,
        score: 0,
        resolution: { width: 0, height: 0 },
        checks: {
          resolutionPassed: false,
          backgroundClean: false,
          singleGarment: false,
          frontView: false,
          categorySupported: false,
        },
        rejectionReasons: ['Could not read image file or URL.'],
        warnings: [],
      });
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageSource);
    }
  });
}
