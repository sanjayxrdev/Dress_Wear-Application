import { Product, UserMeasurements } from '../types';

export interface SizeFitAssessment {
  recommendedSize: string | null;
  status: 'recommended' | 'insufficient_data';
  disclaimer: string;
  comparisonTable?: {
    dimension: string;
    userMeasurement: number;
    garmentMeasurement: number;
    unit: string;
    variance: number;
  }[];
  explanation: string;
}

export const VISUAL_FIT_DISCLAIMER =
  'Visual try-on cannot guarantee physical sizing. Please consult the brand size chart or provide your measurements.';

export function evaluatePhysicalSizeFit(
  product: Product,
  measurements?: UserMeasurements | null
): SizeFitAssessment {
  const sizeChart = product.sizeChart;

  // Rule: Camera feed alone CANNOT claim a physical size.
  // Size fit requires BOTH a structured size chart AND explicit user measurements.
  if (!sizeChart || !measurements || (!measurements.chest && !measurements.waist)) {
    return {
      recommendedSize: null,
      status: 'insufficient_data',
      disclaimer: VISUAL_FIT_DISCLAIMER,
      explanation:
        'Physical size recommendations require your measurements and a merchant size chart. Visual try-on shows aesthetic drape only.',
    };
  }

  const unit = sizeChart.unit || measurements.unit || 'cm';
  const userChest = measurements.chest || 0;
  const userWaist = measurements.waist || 0;

  let bestSize: string | null = null;
  let smallestDiff = Infinity;
  let bestComparison: SizeFitAssessment['comparisonTable'] = [];

  for (const [size, specs] of Object.entries(sizeChart.measurements)) {
    let diff = 0;
    const comparisons: SizeFitAssessment['comparisonTable'] = [];

    if (specs.chest && userChest) {
      const dChest = Math.abs(specs.chest - userChest);
      diff += dChest;
      comparisons.push({
        dimension: 'Chest / Bust',
        userMeasurement: userChest,
        garmentMeasurement: specs.chest,
        unit,
        variance: specs.chest - userChest,
      });
    }

    if (specs.waist && userWaist) {
      const dWaist = Math.abs(specs.waist - userWaist);
      diff += dWaist;
      comparisons.push({
        dimension: 'Waist',
        userMeasurement: userWaist,
        garmentMeasurement: specs.waist,
        unit,
        variance: specs.waist - userWaist,
      });
    }

    if (comparisons.length > 0 && diff < smallestDiff) {
      smallestDiff = diff;
      bestSize = size;
      bestComparison = comparisons;
    }
  }

  if (bestSize) {
    return {
      recommendedSize: bestSize,
      status: 'recommended',
      disclaimer:
        'Size recommendation is derived from your specified measurements and brand size specifications.',
      comparisonTable: bestComparison,
      explanation: `Size ${bestSize} provides the closest anatomical match based on your ${unit} measurements.`,
    };
  }

  return {
    recommendedSize: null,
    status: 'insufficient_data',
    disclaimer: VISUAL_FIT_DISCLAIMER,
    explanation: 'Could not match measurements against size chart.',
  };
}
