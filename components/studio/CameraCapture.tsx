"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, RefreshCw, AlertCircle, Sparkles, Shirt } from "lucide-react";
import { FramingGuide } from "./FramingGuide";
import { analyzeVideoLighting, LightingAnalysisResult } from "@/lib/cv/lighting-detector";
import { RealtimeGarmentTracker } from "@/lib/cv/realtime-garment-tracker";

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel?: () => void;
  garmentImageUrl?: string;
  garmentName?: string;
}

export function CameraCapture({
  onCapture,
  onCancel,
  garmentImageUrl,
  garmentName = "Selected Garment",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const trackerRef = useRef<RealtimeGarmentTracker | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lighting, setLighting] = useState<LightingAnalysisResult | undefined>();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLiveOverlayActive, setIsLiveOverlayActive] = useState(true);
  const [garmentLoaded, setGarmentLoaded] = useState(false);

  // Initialize tracker instance
  useEffect(() => {
    trackerRef.current = new RealtimeGarmentTracker();
  }, []);

  // Preload garment when URL changes
  useEffect(() => {
    if (garmentImageUrl && trackerRef.current) {
      setGarmentLoaded(false);
      trackerRef.current
        .preloadGarment(garmentImageUrl)
        .then(() => {
          if (isMountedRef.current) setGarmentLoaded(true);
        })
        .catch((e) => console.warn("Could not preload garment texture:", e));
    }
  }, [garmentImageUrl]);

  // Initialize webcam stream with bulletproof AbortError handling
  const startCamera = useCallback(async () => {
    try {
      if (isMountedRef.current) setErrorMessage(null);

      // Clean up any prior stream
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        } catch (_) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;

      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          if (!isMountedRef.current) return;
          video.play().catch((err: unknown) => {
            // AbortError is normal if user changed view or stream re-initialized
            if (err instanceof Error && err.name === "AbortError") {
              return;
            }
            console.warn("Video playback interrupted:", err);
          });
        };
      }

      if (isMountedRef.current) {
        setHasPermission(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.warn("Camera access denied or unavailable:", err);
      if (isMountedRef.current) {
        setHasPermission(false);
        setErrorMessage(
          "Camera access was not granted or no webcam was detected. You can upload any portrait photo instead."
        );
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    startCamera();

    return () => {
      isMountedRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        } catch (_) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // Real-time render loop: updates transparent garment overlay canvas
  useEffect(() => {
    if (!hasPermission) return;

    let lastLightingCheck = 0;

    const renderLoop = (timestamp: number) => {
      const video = videoRef.current;
      const canvas = displayCanvasRef.current;

      if (video && canvas && video.readyState >= 2 && !video.paused) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        if (isLiveOverlayActive && garmentImageUrl && trackerRef.current) {
          // Render transparent garment overlay directly aligned to moving body
          trackerRef.current.renderGarmentOverlayOnly(canvas, video, garmentImageUrl);
        } else {
          // Clear overlay if toggled off
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // Lighting analysis every 400ms
        if (timestamp - lastLightingCheck > 400) {
          lastLightingCheck = timestamp;
          const result = analyzeVideoLighting(video);
          if (isMountedRef.current) setLighting(result);
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hasPermission, isLiveOverlayActive, garmentImageUrl]);

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;
    setIsCapturing(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // 1. Draw mirrored user photo
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.94);

      // Stop camera tracks cleanly
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        } catch (_) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      onCapture(dataUrl);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#161615] border border-[#2c2b29] text-center min-h-[380px]">
        <AlertCircle className="w-8 h-8 text-[#9e5033] mb-3" />
        <h4 className="text-sm font-semibold text-[#f5f4ef] uppercase tracking-wider">
          Camera Unavailable
        </h4>
        <p className="text-xs text-[#8c8982] max-w-sm mt-2 leading-relaxed">
          {errorMessage}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-[#242321] hover:bg-[#302f2c] text-[#dedbd2] text-xs uppercase tracking-wider border border-[#3d3b37]"
          >
            Retry Permission
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-[#9e5033] hover:bg-[#864228] text-white text-xs uppercase tracking-wider"
            >
              Switch to Upload
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] bg-[#121211] overflow-hidden border border-[#2a2927] group">
      {/* 1. Native Hardware Accelerated Mirrored Webcam (visible, no display: none) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />

      {/* 2. Transparent Dynamic Garment Overlay (tracks shoulders & torso at 60 FPS) */}
      <canvas
        ref={displayCanvasRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
          isLiveOverlayActive ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Real-time Tracking & Mode Badge Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141413]/85 backdrop-blur-sm border border-[#333230] text-[10px] uppercase tracking-[0.16em] font-mono text-[#dedbd2]">
            <span className="w-2 h-2 rounded-full bg-[#e05638] animate-pulse" />
            <span>LIVE REC</span>
          </span>

          {garmentImageUrl && (
            <button
              type="button"
              onClick={() => setIsLiveOverlayActive(!isLiveOverlayActive)}
              className={`px-2.5 py-1 backdrop-blur-sm border text-[10px] uppercase tracking-[0.14em] font-medium transition-colors flex items-center gap-1.5 ${
                isLiveOverlayActive
                  ? "bg-[#9e5033]/90 border-[#9e5033] text-white"
                  : "bg-[#141413]/80 border-[#383734] text-[#8c8982] hover:text-white"
              }`}
            >
              <Shirt className="w-3 h-3" />
              <span>{isLiveOverlayActive ? "Live Fit: Active" : "Natural View"}</span>
            </button>
          )}
        </div>

        {isLiveOverlayActive && (
          <span className="px-2 py-0.5 bg-[#141413]/80 text-[#9ec4a2] border border-[#28382a] text-[9px] uppercase tracking-wider font-mono hidden sm:inline">
            Tracking Upper Body
          </span>
        )}
      </div>

      {/* Framing & Lighting Advisory Overlay */}
      <FramingGuide lightingAnalysis={lighting} isCapturing={isCapturing} />

      {/* Camera Capture Shutter Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex flex-col items-center justify-center gap-2">
        <button
          type="button"
          onClick={captureSnapshot}
          disabled={isCapturing}
          className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white backdrop-blur-md transition-all active:scale-95"
          id="shutter-capture-button"
          aria-label="Capture photo for neural try-on"
        >
          <div className="w-12 h-12 rounded-full bg-[#fcfbf8] group-hover:scale-95 transition-transform" />
        </button>

        <span className="text-[10px] text-[#dedbd2] uppercase tracking-[0.18em] bg-[#141413]/80 px-2.5 py-0.5 backdrop-blur-sm border border-[#333230]">
          Tap to Freeze & Refine 4K Look
        </span>
      </div>
    </div>
  );
}
