"use client";

import React from "react";
import { LightingAnalysisResult } from "@/lib/cv/lighting-detector";
import { SunMedium, AlertCircle, CheckCircle2 } from "lucide-react";

interface FramingGuideProps {
  lightingAnalysis?: LightingAnalysisResult;
  isCapturing?: boolean;
}

export function FramingGuide({ lightingAnalysis, isCapturing }: FramingGuideProps) {
  const isOptimal = lightingAnalysis?.isReady ?? true;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
      {/* Top Advisory Pill */}
      <div className="w-full flex justify-between items-center">
        <div className="px-3 py-1 bg-[#141413]/80 border border-[#333230] text-[10px] tracking-[0.2em] uppercase font-sans font-medium text-[#c4c0b6] backdrop-blur-sm">
          Framing Guide
        </div>

        {lightingAnalysis && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 backdrop-blur-sm border text-[11px] font-sans font-medium transition-all duration-300 ${
              isOptimal
                ? "bg-[#141413]/80 border-[#384a3c] text-[#86bf92]"
                : "bg-[#141413]/90 border-[#6b422e] text-[#e08960]"
            }`}
          >
            {isOptimal ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#86bf92]" />
            ) : (
              <SunMedium className="w-3.5 h-3.5 text-[#e08960]" />
            )}
            <span>{lightingAnalysis.advisoryMessage}</span>
          </div>
        )}
      </div>

      {/* Editorial Silhouette Target Overlay */}
      <div className="relative w-64 h-80 sm:w-72 sm:h-96 my-auto flex items-center justify-center opacity-70">
        {/* Subtle corner brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60" />

        {/* Minimalist Head & Shoulder Silhouette SVG */}
        <svg
          viewBox="0 0 200 260"
          className="w-full h-full stroke-white/40 fill-none"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        >
          {/* Head oval */}
          <ellipse cx="100" cy="65" rx="34" ry="44" />
          {/* Neck */}
          <path d="M 88 108 L 88 126" />
          <path d="M 112 108 L 112 126" />
          {/* Torso & Shoulders drape */}
          <path d="M 50 160 C 65 130, 80 126, 88 126" />
          <path d="M 150 160 C 135 130, 120 126, 112 126" />
          <path d="M 50 160 L 40 250" />
          <path d="M 150 160 L 160 250" />
        </svg>

        <span className="absolute bottom-3 text-[10px] tracking-[0.2em] uppercase font-sans text-white/60 text-center">
          Position upper body inside frame
        </span>
      </div>

      {/* Bottom status note */}
      <div className="text-[10px] text-[#8c8982] uppercase tracking-[0.16em] bg-[#141413]/60 px-3 py-1">
        Advisory feedback • Photo captured locally only
      </div>
    </div>
  );
}
