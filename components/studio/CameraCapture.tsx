"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Shirt,
  ShieldCheck,
  X,
  Gauge,
  Info,
  HelpCircle,
} from "lucide-react";
import { LookQualityMonitor } from "@/lib/cv/look-quality-monitor";
import { createVTONProvider } from "@/lib/vton";
import { IVTONProvider } from "@/lib/vton/provider";
import { LookQualityAssessment, QualityMetrics, SessionState, VTONError } from "@/lib/vton/types";
import { computeStyleMatch, StyleMatchResult } from "@/lib/style-engine/scorer";
import { evaluatePhysicalSizeFit, SizeFitAssessment } from "@/lib/style-engine/fit-calculator";
import { generateStyleMatchExplanation } from "@/lib/style-engine/llm-gateway";
import { StyleMatchDrawer } from "./StyleMatchDrawer";
import { fittedStore } from "@/lib/db/store";
import { Product } from "@/lib/types";

interface GarmentItem {
  id: string;
  name: string;
  category?: string;
  imageUrl: string;
  price?: number;
}

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  selectedGarment?: GarmentItem;
  garmentList?: GarmentItem[];
  onSelectGarment?: (garment: GarmentItem) => void;
  garmentImageUrl?: string;
  garmentName?: string;
}

export function CameraCapture({
  onCapture,
  onCancel,
  onClose,
  selectedGarment,
  garmentList = [],
  onSelectGarment,
  garmentImageUrl: legacyImageUrl,
  garmentName: legacyName = "Selected Garment",
}: CameraCaptureProps) {
  const activeGarment = selectedGarment || {
    id: "active_garment",
    name: legacyName,
    imageUrl: legacyImageUrl || "",
    category: "tops",
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const providerRef = useRef<IVTONProvider | null>(null);
  const qualityMonitorRef = useRef<LookQualityMonitor | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // States
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [qualityAssessment, setQualityAssessment] = useState<LookQualityAssessment | null>(null);
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null);
  const [isStyleDrawerOpen, setIsStyleDrawerOpen] = useState(false);
  const [styleMatch, setStyleMatch] = useState<StyleMatchResult | null>(null);
  const [sizeFit, setSizeFit] = useState<SizeFitAssessment | null>(null);
  const [stylistExplanation, setStylistExplanation] = useState<string>("");
  const [currentGarment, setCurrentGarment] = useState<GarmentItem>(activeGarment);

  // Initialize Quality Monitor
  useEffect(() => {
    qualityMonitorRef.current = new LookQualityMonitor();
  }, []);

  // Compute Style Match & Size Fit when garment changes
  useEffect(() => {
    async function evaluateGarmentStyle() {
      const profile = fittedStore.getProfile();
      const wardrobe = await fittedStore.getWardrobeItems();

      const mockProduct: Product = {
        id: currentGarment.id,
        name: currentGarment.name,
        slug: currentGarment.id,
        tagline: "Fine garment",
        description: "",
        category: (currentGarment.category as any) || "tops",
        brand: "StyleTry Studio",
        price: currentGarment.price || 420,
        currency: "$",
        material: "Silk Virgin Wool",
        fit: "tailored",
        care: "Dry Clean Only",
        status: "active",
        primaryImage: currentGarment.imageUrl,
        tryOnReferenceImage: currentGarment.imageUrl,
        gallery: [],
        variants: [],
        availableColors: [{ name: "Neutral", hex: "#141413" }],
        availableSizes: ["S", "M", "L"],
        structuredMetadata: {
          formalityLevel: 3,
          silhouette: "tailored",
          primaryHex: "#141413",
        },
        sizeChart: {
          unit: "cm",
          measurements: {
            S: { chest: 92, waist: 76 },
            M: { chest: 96, waist: 80 },
            L: { chest: 102, waist: 86 },
          },
        },
        createdAt: new Date().toISOString(),
      };

      const match = computeStyleMatch({
        product: mockProduct,
        userProfile: profile,
        wardrobeItems: wardrobe,
        poseQualityScore: qualityAssessment?.compositeQuality || 90,
      });
      setStyleMatch(match);

      const fit = evaluatePhysicalSizeFit(mockProduct, profile.measurements);
      setSizeFit(fit);

      const explanation = await generateStyleMatchExplanation(
        currentGarment.name,
        currentGarment.category || "apparel",
        match
      );
      setStylistExplanation(explanation);
    }

    if (currentGarment.imageUrl) {
      evaluateGarmentStyle();
    }
  }, [currentGarment, qualityAssessment?.compositeQuality]);

  // Connect to VTON Provider and Camera
  const startFittingSession = useCallback(async () => {
    try {
      if (isMountedRef.current) setErrorMessage(null);

      // Clean up previous stream
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

      // 1. Request hardware camera stream
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
      setHasPermission(true);

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          if (!isMountedRef.current) return;
          video.play().catch((err) => {
            if (err instanceof Error && err.name === "AbortError") return;
            console.warn("Video play error:", err);
          });
        };
      }

      // 2. Initialize VTON Provider (Decart adapter or high-fidelity mock adapter)
      const provider = createVTONProvider(true);
      providerRef.current = provider;

      provider.onStatus((status) => {
        if (isMountedRef.current) setSessionState(status);
      });

      provider.onError((err: VTONError) => {
        if (isMountedRef.current) {
          setErrorMessage(`${err.userMessage} (${err.recoveryAction})`);
        }
      });

      await provider.connect(stream);

      // Set initial garment atomically
      if (currentGarment.imageUrl) {
        await provider.setGarment({
          productId: currentGarment.id,
          image: currentGarment.imageUrl,
          name: currentGarment.name,
          category: currentGarment.category,
        });
      }

      // Poll metrics periodically
      const metricsInterval = setInterval(() => {
        if (!isMountedRef.current || !providerRef.current) {
          clearInterval(metricsInterval);
          return;
        }
        setMetrics(providerRef.current.getMetrics());
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.warn("Camera access denied or unavailable:", err);
      if (isMountedRef.current) {
        setHasPermission(false);
        setErrorMessage(
          "Camera access is required for real-time live fitting. Please grant camera permission in your browser."
        );
      }
    }
  }, [currentGarment]);

  useEffect(() => {
    isMountedRef.current = true;
    startFittingSession();

    return () => {
      isMountedRef.current = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.disconnect();
        providerRef.current = null;
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
  }, [startFittingSession]);

  // Real-time render loop & on-device Look Quality Monitor
  useEffect(() => {
    if (!hasPermission) return;

    let lastQualityCheck = 0;

    const renderLoop = (timestamp: number) => {
      const video = videoRef.current;
      const canvas = displayCanvasRef.current;

      if (video && canvas && video.readyState >= 2 && !video.paused) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        // On-device Look Quality Monitor runs every ~150ms on raw video frame
        if (timestamp - lastQualityCheck > 150 && qualityMonitorRef.current) {
          lastQualityCheck = timestamp;
          const assessment = qualityMonitorRef.current.analyzeFrame(video);
          if (isMountedRef.current) setQualityAssessment(assessment);
        }

        // Render live stream
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hasPermission]);

  // Atomic Garment Switch Handler (No camera restart!)
  const handleGarmentSwitch = async (garment: GarmentItem) => {
    setCurrentGarment(garment);
    onSelectGarment?.(garment);

    if (providerRef.current) {
      await providerRef.current.setGarment({
        productId: garment.id,
        image: garment.imageUrl,
        name: garment.name,
        category: garment.category,
      });
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.94);

      // Clean up hardware camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      onCapture(dataUrl);
    }
  };

  const handleExit = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#141413] text-[#fcfbf8] overflow-hidden flex flex-col font-sans select-none">
      {/* Top Demo Mode Badge */}
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
        <div className="bg-[#9e5033]/90 text-white text-[11px] font-medium tracking-widest uppercase text-center py-1 border-b border-[#9e5033]/30 z-20">
          Demo, not live AI
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-black">
        {/* Hidden video decoder */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
          autoPlay
        />

        {/* Live Display Canvas */}
        <canvas
          ref={displayCanvasRef}
          className="w-full h-full object-cover"
        />

        {/* Look Quality Monitor Status HUD */}
        {qualityAssessment && (
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs shadow-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  qualityAssessment.state === "good"
                    ? "bg-emerald-400 animate-pulse"
                    : qualityAssessment.state === "degraded"
                    ? "bg-amber-400"
                    : "bg-rose-400"
                }`}
              />
              <span className="capitalize font-semibold text-white">
                Quality: {qualityAssessment.state}
              </span>
              <span className="text-white/40">|</span>
              <span className="text-white/80">{qualityAssessment.guidance}</span>
            </div>

            {/* Performance telemetry pill */}
            {metrics && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-[10px] text-white/60 font-mono">
                <span>{metrics.fps || 30} FPS</span>
                <span>•</span>
                <span>{metrics.latencyMs || 165} ms</span>
                <span>•</span>
                <span>Lock: {metrics.stabilityScore || 95}%</span>
              </div>
            )}
          </div>
        )}

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {styleMatch && (
            <button
              onClick={() => setIsStyleDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#9e5033] hover:bg-[#85432b] text-white text-xs font-medium tracking-wide flex items-center gap-1.5 shadow-lg shadow-[#9e5033]/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Style Match: {styleMatch.overallScore}</span>
            </button>
          )}

          <button
            onClick={handleExit}
            className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10"
            title="Exit Fitting Room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Floating Control Deck: Atomic Garment Strip & Shutter */}
        <div className="absolute bottom-6 inset-x-0 z-20 flex flex-col items-center gap-4 px-4">
          {/* Garment Selector Strip */}
          {garmentList.length > 1 && (
            <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 max-w-full overflow-x-auto shadow-2xl">
              {garmentList.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGarmentSwitch(g)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    currentGarment.id === g.id
                      ? "border-[#9e5033] scale-105 shadow-md shadow-[#9e5033]/40"
                      : "border-white/10 hover:border-white/40 opacity-70 hover:opacity-100"
                  }`}
                  title={g.name}
                >
                  <img
                    src={g.imageUrl}
                    alt={g.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Shutter / Capture Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCapture}
              disabled={qualityAssessment?.state === "blocked"}
              className="py-3 px-6 rounded-full bg-white text-[#141413] hover:bg-neutral-200 font-semibold text-xs tracking-wider uppercase shadow-2xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Camera className="w-4 h-4" />
              <span>Freeze & Compare</span>
            </button>
          </div>
        </div>

        {/* Error / Warning Overlay */}
        {errorMessage && (
          <div className="absolute bottom-24 inset-x-6 z-30 max-w-md mx-auto p-3.5 bg-rose-950/90 border border-rose-500/40 rounded-xl text-xs text-rose-200 text-center shadow-2xl">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Style Match Drawer */}
      <StyleMatchDrawer
        isOpen={isStyleDrawerOpen}
        onClose={() => setIsStyleDrawerOpen(false)}
        styleMatch={styleMatch}
        sizeFit={sizeFit}
        stylistExplanation={stylistExplanation}
        product={{
          id: currentGarment.id,
          name: currentGarment.name,
          slug: currentGarment.id,
          tagline: "",
          description: "",
          category: (currentGarment.category as any) || "tops",
          brand: "StyleTry Studio",
          price: currentGarment.price || 420,
          currency: "$",
          material: "Italian Virgin Wool",
          fit: "tailored",
          care: "",
          status: "active",
          primaryImage: currentGarment.imageUrl,
          tryOnReferenceImage: currentGarment.imageUrl,
          gallery: [],
          variants: [],
          availableColors: [],
          availableSizes: [],
          createdAt: "",
        }}
      />
    </div>
  );
}
