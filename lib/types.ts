export type GarmentCategory =
  | "tops"
  | "outerwear"
  | "dresses"
  | "tailoring"
  | "knitwear"
  | "bottoms";

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  colorHex?: string;
  size: string;
  stock: number;
  sku: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  type: "product" | "front" | "back" | "side" | "model" | "try_on_reference";
  sortOrder: number;
}

export interface GarmentAnchorPoints {
  neck: [number, number];
  leftShoulder: [number, number];
  rightShoulder: [number, number];
  leftHem: [number, number];
  rightHem: [number, number];
  leftSleeve?: [number, number];
  rightSleeve?: [number, number];
}

export interface TryOnAsset {
  type: "2d_warp" | "3d_gltf";
  url: string;
  anchors?: GarmentAnchorPoints;
  gltfUrl?: string;
  hasValidAsset: boolean;
  disabledReason?: string;
}

export interface ProductSizeChart {
  unit: "cm" | "in";
  measurements: Record<string, { chest?: number; waist?: number; hips?: number; length?: number }>;
}

export interface Product {
  id: string;
  merchantId?: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: GarmentCategory;
  brand: string;
  price: number;
  currency: string;
  material: string;
  fit: string;
  care: string;
  status: "active" | "draft" | "archived";
  primaryImage: string;
  tryOnReferenceImage: string;
  tryOnAsset?: TryOnAsset;
  modelImage?: string;
  gallery: ProductImage[];
  variants: ProductVariant[];
  availableColors: { name: string; hex: string }[];
  availableSizes: string[];
  structuredMetadata?: {
    formalityLevel?: number; // 1-5 (Casual to Black Tie)
    silhouette?: "slim" | "tailored" | "relaxed" | "oversized";
    primaryHex?: string;
    occasion?: string[];
    careComplexity?: "easy" | "moderate" | "delicate";
  };
  sizeChart?: ProductSizeChart;
  createdAt: string;
}

export type TryOnStage =
  | "idle"
  | "permission"
  | "positioning"
  | "analyzing"
  | "segmenting"
  | "synthesizing"
  | "finalizing"
  | "completed"
  | "failed";

export interface TryOnSession {
  id: string;
  merchantId?: string;
  userId?: string;
  anonymousSessionId?: string;
  productId: string;
  productName: string;
  productBrand: string;
  garmentImageUrl: string;
  inputImageUrl: string;
  resultImageUrl?: string;
  status: "queued" | "processing" | "completed" | "failed";
  stage?: TryOnStage;
  stageMessage?: string;
  provider: "demo" | "replicate" | "decart" | "mock";
  model: string;
  processingTimeMs?: number;
  errorMessage?: string;
  styleMatchScore?: number;
  confidenceScore?: number;
  analysisJson?: Record<string, unknown>;
  createdAt: string;
}

export interface SavedLook {
  id: string;
  merchantId?: string;
  userId?: string;
  anonymousSessionId?: string;
  sessionId: string;
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  category: GarmentCategory;
  inputImageUrl: string;
  resultImageUrl: string;
  styleMatchScore?: number;
  analysisJson?: Record<string, unknown>;
  notes?: string;
  createdAt: string;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: GarmentCategory;
  colorHex?: string;
  imageUrl: string;
  formalityLevel?: number;
  createdAt: string;
}

export interface UserMeasurements {
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  height?: number; // cm
  unit?: "cm" | "in";
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  fitPreference: "slim" | "tailored" | "relaxed" | "oversized";
  preferredSize: string;
  measurements?: UserMeasurements;
  notificationsEnabled: boolean;
  tryOnDataRetentionDays: number;
}

export interface Merchant {
  id: string;
  name: string;
  slug: string;
  apiKey: string;
  allowedOrigins: string[];
  plan: "starter" | "growth" | "enterprise";
  monthlySessionLimit: number;
  maxSessionDurationSec: number;
  idleTimeoutSec: number;
  rateLimitPerMinute: number;
  createdAt: string;
}

export interface MerchantConfig {
  merchantId: string;
  brandName: string;
  brandAccentColor: string;
  buttonLabel: string;
  qualityTier: "low_latency" | "balanced" | "ultra_hd";
  ruleOverrides: Record<string, unknown>;
  isActive: boolean;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id?: number;
  merchantId: string;
  sessionId?: string;
  eventType: string;
  ttfrMs?: number;
  latencyMs?: number;
  fps?: number;
  stabilityScore?: number;
  reconnectCount?: number;
  deviceType?: string;
  browser?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

export interface CustomerFeedback {
  id?: number;
  merchantId: string;
  sessionId?: string;
  rating: number; // 1-5
  fitAccuracy?: string;
  comments?: string;
  createdAt?: string;
}
