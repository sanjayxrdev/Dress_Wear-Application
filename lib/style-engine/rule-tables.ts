/**
 * StyleTry AI — Published Rule Tables for Style Intelligence
 * Transparent, deterministic rules used to compute Style Match without black-box bias.
 */

// 1. Color Harmony & LAB Color Distance (CIE76)
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const sanitized = hex.replace(/^#/, '');
  const bigint = parseInt(sanitized, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

export function rgbToXyz(rgb: RGB): { x: number; y: number; z: number } {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // D65 Standard Illuminant
  return {
    x: (r * 0.4124 + g * 0.3576 + b * 0.1805) * 100,
    y: (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100,
    z: (r * 0.0193 + g * 0.1192 + b * 0.9505) * 100,
  };
}

export function xyzToLab(xyz: { x: number; y: number; z: number }): LAB {
  // D65 reference white points
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let x = xyz.x / refX;
  let y = xyz.y / refY;
  let z = xyz.z / refZ;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return {
    l: 116 * y - 16,
    a: 500 * (x - y),
    b: 200 * (y - z),
  };
}

export function hexToLab(hex: string): LAB {
  return xyzToLab(rgbToXyz(hexToRgb(hex)));
}

/**
 * CIE76 Delta E Color Distance formula:
 * ΔE = sqrt((ΔL)^2 + (Δa)^2 + (Δb)^2)
 */
export function deltaE76(lab1: LAB, lab2: LAB): number {
  const dL = lab1.l - lab2.l;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Color Harmony Score:
 * Evaluates whether two colors form an elegant pairing (monochromatic contrast, complementary, or classic neutral harmony).
 */
export function evaluateColorHarmonyScore(hex1: string, hex2: string): { score: number; harmonyType: string; deltaE: number } {
  try {
    const lab1 = hexToLab(hex1);
    const lab2 = hexToLab(hex2);
    const dE = deltaE76(lab1, lab2);

    const chroma1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
    const chroma2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
    const isNeutralPair = chroma1 < 12 && chroma2 < 12;

    // Classic Neutral Contrast (e.g. Cream / Ivory & Deep Charcoal / Black)
    if (isNeutralPair && dE > 40) {
      return { score: 96, harmonyType: 'Balanced Contrast', deltaE: Math.round(dE * 10) / 10 };
    }

    // Monochromatic tonal depth (similar hue, tasteful lightness step)
    if (dE < 18) {
      return { score: 92, harmonyType: 'Tonal Monochrome', deltaE: Math.round(dE * 10) / 10 };
    }
    // High-contrast balance
    if (dE >= 40 && dE <= 85) {
      return { score: 94, harmonyType: 'Balanced Contrast', deltaE: Math.round(dE * 10) / 10 };
    }
    // Moderate separation
    if (dE >= 18 && dE < 40) {
      return { score: 88, harmonyType: 'Soft Analogy', deltaE: Math.round(dE * 10) / 10 };
    }
    // High chromatic clash / bold accent
    return { score: 78, harmonyType: 'Bold Accent', deltaE: Math.round(dE * 10) / 10 };
  } catch {
    return { score: 80, harmonyType: 'Classic Neutral', deltaE: 30 };
  }
}

// 2. Published Formality Compatibility Matrix (1 = Casual, 5 = Black Tie)
export const FORMALITY_LEVELS: Record<number, string> = {
  1: 'Casual',
  2: 'Smart Casual',
  3: 'Business Casual',
  4: 'Formal / Evening',
  5: 'Black Tie',
};

export const FORMALITY_COMPATIBILITY_MATRIX: Record<number, Record<number, number>> = {
  1: { 1: 100, 2: 85, 3: 50, 4: 20, 5: 10 },
  2: { 1: 85, 2: 100, 3: 88, 4: 55, 5: 25 },
  3: { 1: 50, 2: 88, 3: 100, 4: 85, 5: 45 },
  4: { 1: 20, 2: 55, 3: 85, 4: 100, 5: 85 },
  5: { 1: 10, 2: 25, 3: 45, 4: 85, 5: 100 },
};

// 3. Published Silhouette-to-Fit Preference Compatibility Map
export type SilhouetteType = 'slim' | 'tailored' | 'relaxed' | 'oversized';

export const SILHOUETTE_TO_FIT_MAP: Record<SilhouetteType, Record<SilhouetteType, number>> = {
  slim: { slim: 100, tailored: 88, relaxed: 60, oversized: 40 },
  tailored: { slim: 88, tailored: 100, relaxed: 82, oversized: 65 },
  relaxed: { slim: 60, tailored: 85, relaxed: 100, oversized: 90 },
  oversized: { slim: 40, tailored: 65, relaxed: 90, oversized: 100 },
};

// 4. Occasion Compatibility Matrix
export const OCCASION_FORMALITY_MAP: Record<string, number> = {
  weekend: 1,
  brunch: 2,
  workplace: 3,
  cocktail: 4,
  gala: 5,
};
