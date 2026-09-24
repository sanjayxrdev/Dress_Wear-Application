/**
 * StyleTry AI — Core VTON & Session Types
 * Clean, decoupled domain types for real-time WebRTC Virtual Try-On
 */

export type SessionState =
  | 'idle'
  | 'permission'
  | 'positioning'
  | 'connecting'
  | 'live'
  | 'switching'
  | 'degraded'
  | 'ended'
  | 'failed';

export type VTONErrorCode =
  | 'CAMERA_DENIED'
  | 'NO_PERSON'
  | 'POOR_POSE_LIGHT'
  | 'OUT_OF_FRAME'
  | 'VTON_TIMEOUT'
  | 'INVALID_GARMENT_IMAGE'
  | 'UNSUPPORTED_GARMENT'
  | 'PROVIDER_OUTAGE'
  | 'NETWORK_DROP'
  | 'RATE_LIMIT'
  | 'LOW_CONFIDENCE';

export interface VTONError {
  code: VTONErrorCode;
  message: string;
  userMessage: string;
  recoveryAction: string;
  timestamp: string;
  technicalDetails?: string;
}

export const VTON_ERROR_CATALOG: Record<
  VTONErrorCode,
  { userMessage: string; recoveryAction: string }
> = {
  CAMERA_DENIED: {
    userMessage: 'Camera access is required for real-time virtual try-on.',
    recoveryAction: 'Please enable camera permissions in your browser address bar and refresh.',
  },
  NO_PERSON: {
    userMessage: 'No person detected in the camera view.',
    recoveryAction: 'Please step into the camera frame so the system can detect your upper body.',
  },
  POOR_POSE_LIGHT: {
    userMessage: 'Lighting is too dark or your posture needs adjustment.',
    recoveryAction: 'Face toward a natural light source and keep your upper torso visible.',
  },
  OUT_OF_FRAME: {
    userMessage: 'You are partially out of the fitting frame.',
    recoveryAction: 'Step back 3–5 feet until your shoulders and torso are centered in the guide.',
  },
  VTON_TIMEOUT: {
    userMessage: 'Connection to the live fitting server timed out.',
    recoveryAction: 'Retrying connection automatically. Please ensure a stable internet connection.',
  },
  INVALID_GARMENT_IMAGE: {
    userMessage: 'The selected garment image could not be processed for try-on.',
    recoveryAction: 'Please choose another garment or contact the store.',
  },
  UNSUPPORTED_GARMENT: {
    userMessage: 'This garment category is currently not supported for real-time try-on.',
    recoveryAction: 'Try on tops, outerwear, dresses, or tailoring items instead.',
  },
  PROVIDER_OUTAGE: {
    userMessage: 'The live fitting engine is temporarily experiencing high latency.',
    recoveryAction: 'Switching to high-stability mode. Please wait a moment.',
  },
  NETWORK_DROP: {
    userMessage: 'Network connection was interrupted.',
    recoveryAction: 'Reconnecting to the live fitting room...',
  },
  RATE_LIMIT: {
    userMessage: 'Session limit reached for this fitting room.',
    recoveryAction: 'Please wait a couple of minutes before starting a new try-on session.',
  },
  LOW_CONFIDENCE: {
    userMessage: 'Visual conditions are insufficient to generate a realistic fit.',
    recoveryAction: 'Adjust your lighting, avoid loose outer layers, and stand facing the camera directly.',
  },
};

export interface GarmentPayload {
  productId: string;
  image: string;
  prompt?: string;
  category?: string;
  name?: string;
  brand?: string;
  price?: number;
  structuredMetadata?: Record<string, unknown>;
}

export interface QualityMetrics {
  ttfrMs: number; // Time-to-first-render
  latencyMs: number; // End-to-end processing latency
  fps: number; // Frames per second rendered
  stabilityScore: number; // Garment stability score (0-100)
  reconnectCount: number; // Reconnection events count
  lastUpdated: string;
}

export interface LookQualityAssessment {
  state: 'good' | 'degraded' | 'blocked';
  guidance: string;
  shouldPauseOverlay: boolean;
  personDetected: boolean;
  bodyRegionVisible: boolean;
  lightingScore: number; // 0-100
  motionBlurScore: number; // 0-100 (higher = sharper, lower = blurry)
  occlusionScore: number; // 0-100 (higher = clear, lower = occluded)
  compositeQuality: number; // 0-100
  torsoRatio?: number; // 0-1 normalized torso area ratio
  timestamp: number;
}
