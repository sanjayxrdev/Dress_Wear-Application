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

export interface Product {
  id: string;
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
  modelImage?: string;
  gallery: ProductImage[];
  variants: ProductVariant[];
  availableColors: { name: string; hex: string }[];
  availableSizes: string[];
  createdAt: string;
}

export type TryOnStage =
  | "idle"
  | "analyzing"
  | "segmenting"
  | "synthesizing"
  | "finalizing"
  | "completed"
  | "failed";

export interface TryOnSession {
  id: string;
  userId?: string;
  productId: string;
  productName: string;
  productBrand: string;
  garmentImageUrl: string;
  inputImageUrl: string;
  resultImageUrl?: string;
  status: "queued" | "processing" | "completed" | "failed";
  stage?: TryOnStage;
  stageMessage?: string;
  provider: "demo" | "replicate";
  model: string;
  processingTimeMs?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface SavedLook {
  id: string;
  userId: string;
  sessionId: string;
  productId: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  category: GarmentCategory;
  inputImageUrl: string;
  resultImageUrl: string;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  fitPreference: "slim" | "tailored" | "relaxed" | "oversized";
  preferredSize: string;
  notificationsEnabled: boolean;
  tryOnDataRetentionDays: number;
}
