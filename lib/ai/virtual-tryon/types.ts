import { GarmentCategory, TryOnStage } from "@/lib/types";

export interface PoseKeypoints {
  nose?: [number, number];
  neck?: [number, number];
  leftShoulder?: [number, number];
  rightShoulder?: [number, number];
  leftElbow?: [number, number];
  rightElbow?: [number, number];
  leftWrist?: [number, number];
  rightWrist?: [number, number];
  leftHip?: [number, number];
  rightHip?: [number, number];
  torsoWidth?: number;
  torsoHeight?: number;
  headRadius?: number;
}

export interface InputQualityAssessment {
  isValid: boolean;
  lightingScore: number; // 0.0 - 1.0
  isFaceCentered: boolean;
  isStableAngle: boolean;
  message?: string;
  diagnostics?: string[];
}

export interface TryOnRequestOptions {
  hd?: boolean;
  preservePose?: boolean;
  seed?: number;
  guidanceScale?: number;
  denoiseSteps?: number;
  fitScale?: number;
  collarShift?: number;
}

export interface TryOnRequest {
  personImage: string; // base64 data URI or public URL
  personMask?: string; // clothing-region mask (data URI) - required for mask-conditioned transfer
  poseKeypoints?: PoseKeypoints; // skeletal landmarks for body shape/fit conditioning
  garmentImage: string; // URL or base64 data URI
  garmentCategory: GarmentCategory;
  productId?: string;
  productName?: string;
  options?: TryOnRequestOptions;
}

export interface TryOnProgressUpdate {
  stage: TryOnStage;
  message: string;
  percent: number;
}

export interface TryOnResponse {
  requestId: string;
  status: "queued" | "processing" | "completed" | "failed";
  resultImage?: string;
  identityMatchScore?: number; // 0.0 to 1.0 (e.g. 0.96) - first-class identity preservation check
  processingTimeMs?: number;
  provider: "demo" | "replicate" | "idm-vton";
  model: string;
  error?: string;
  maskUrl?: string;
}

export interface VirtualTryOnProvider {
  name: string;
  generateTryOn(
    request: TryOnRequest,
    onProgress?: (update: TryOnProgressUpdate) => void
  ): Promise<TryOnResponse>;
}
