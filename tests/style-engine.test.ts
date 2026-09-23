import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  deltaE76,
  evaluateColorHarmonyScore,
  hexToLab,
  FORMALITY_COMPATIBILITY_MATRIX,
  SILHOUETTE_TO_FIT_MAP,
} from '../lib/style-engine/rule-tables';
import { computeStyleMatch, DEFAULT_WEIGHTS } from '../lib/style-engine/scorer';
import { evaluatePhysicalSizeFit, VISUAL_FIT_DISCLAIMER } from '../lib/style-engine/fit-calculator';
import { Product, UserProfile } from '../lib/types';

describe('Style Intelligence Engine & Published Rule Tables', () => {
  it('should compute CIE76 Delta E color distance accurately', () => {
    const labBlack = hexToLab('#000000');
    const labWhite = hexToLab('#ffffff');
    const dE = deltaE76(labBlack, labWhite);

    // Delta E between black and white in LAB is 100
    assert.ok(dE >= 98 && dE <= 102, `Expected dE near 100, got ${dE}`);

    // Identical color should be 0
    const dESelf = deltaE76(labBlack, labBlack);
    assert.strictEqual(dESelf, 0);
  });

  it('should evaluate color harmony score for classic contrasts', () => {
    const cream = '#fcfbf8';
    const charcoal = '#141413';
    const result = evaluateColorHarmonyScore(cream, charcoal);

    assert.ok(result.score >= 90, `Expected high harmony score, got ${result.score}`);
    assert.strictEqual(result.harmonyType, 'Balanced Contrast');
  });

  it('should enforce formality compatibility matrix', () => {
    // Casual (1) with Casual (1) = 100
    assert.strictEqual(FORMALITY_COMPATIBILITY_MATRIX[1][1], 100);
    // Casual (1) with Black Tie (5) = 10
    assert.strictEqual(FORMALITY_COMPATIBILITY_MATRIX[1][5], 10);
    // Black Tie (5) with Black Tie (5) = 100
    assert.strictEqual(FORMALITY_COMPATIBILITY_MATRIX[5][5], 100);
  });

  it('should renormalize weights when dimensions are unknown and reduce confidence', () => {
    const mockProduct: Product = {
      id: 'test_product',
      name: 'Architectural Trench',
      slug: 'architectural-trench',
      tagline: '',
      description: '',
      category: 'outerwear',
      brand: 'Atelier',
      price: 650,
      currency: '$',
      material: 'Virgin Wool',
      fit: 'tailored',
      care: '',
      status: 'active',
      primaryImage: 'https://example.com/img.jpg',
      tryOnReferenceImage: 'https://example.com/img.jpg',
      gallery: [],
      variants: [],
      availableColors: [],
      availableSizes: ['M'],
      structuredMetadata: {
        formalityLevel: 3,
        silhouette: 'tailored',
        primaryHex: '#141413',
      },
      createdAt: '',
    };

    const mockProfile: UserProfile = {
      id: 'user_1',
      email: 'test@example.com',
      name: 'Tester',
      fitPreference: 'tailored',
      preferredSize: 'M',
      notificationsEnabled: true,
      tryOnDataRetentionDays: 30,
    };

    // Case A: Missing wardrobe and occasion
    const matchWithoutWardrobe = computeStyleMatch({
      product: mockProduct,
      userProfile: mockProfile,
      wardrobeItems: [], // No wardrobe
      statedOccasion: undefined, // No occasion
      poseQualityScore: 90,
    });

    assert.strictEqual(matchWithoutWardrobe.label, 'Style Match');
    assert.strictEqual(matchWithoutWardrobe.dimensions.wardrobe.status, 'unknown');
    assert.strictEqual(matchWithoutWardrobe.dimensions.occasion.status, 'unknown');
    assert.strictEqual(matchWithoutWardrobe.dimensions.fitPreference.status, 'known');

    // Renormalized weights must sum to 1.0 among known dimensions
    const knownWeightSum = Object.values(matchWithoutWardrobe.dimensions).reduce(
      (sum, d) => sum + d.renormalizedWeight,
      0
    );
    assert.ok(
      Math.abs(knownWeightSum - 1.0) < 0.001,
      `Renormalized weights must sum to 1.0, got ${knownWeightSum}`
    );

    // Confidence should be lower than when all dimensions are known
    assert.ok(
      matchWithoutWardrobe.confidenceScore < 95,
      `Confidence should be penalized for missing data, got ${matchWithoutWardrobe.confidenceScore}`
    );
  });

  it('should strictly separate visual fit from size fit and display disclaimer when data is absent', () => {
    const mockProductWithoutSizeChart: Product = {
      id: 'test_product',
      name: 'Basic Top',
      slug: 'basic-top',
      tagline: '',
      description: '',
      category: 'tops',
      brand: 'Atelier',
      price: 120,
      currency: '$',
      material: 'Cotton',
      fit: 'relaxed',
      care: '',
      status: 'active',
      primaryImage: 'https://example.com/img.jpg',
      tryOnReferenceImage: 'https://example.com/img.jpg',
      gallery: [],
      variants: [],
      availableColors: [],
      availableSizes: ['S', 'M'],
      createdAt: '',
    };

    const sizeFit = evaluatePhysicalSizeFit(mockProductWithoutSizeChart, null);

    assert.strictEqual(sizeFit.status, 'insufficient_data');
    assert.strictEqual(sizeFit.recommendedSize, null);
    assert.strictEqual(sizeFit.disclaimer, VISUAL_FIT_DISCLAIMER);
  });
});
