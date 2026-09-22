"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Sliders, Eye } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  identityMatchScore?: number;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "YOUR PHOTO",
  afterLabel = "WEARING ARCHITECTURAL WOOL OVERCOAT",
  className = "",
  identityMatchScore,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
    setHasInteracted(true);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  // When holding original view button, show 100% original
  const effectivePosition = isHoldingOriginal ? 100 : sliderPosition;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative select-none overflow-hidden bg-[#141413] cursor-ew-resize ${className}`}
      style={{ touchAction: "none" }}
    >
      {/* After Image (AI Try-On Result - Background) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover object-center"
        />

        {/* Top-Right Badge: WEARING [GARMENT NAME] */}
        <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-[#141413]/85 text-[#f5f4ef] text-[10px] tracking-[0.2em] uppercase font-sans font-medium border border-[#3d3b37]/60">
          {afterLabel}
        </div>
      </div>

      {/* Before Image (Original User Photo - Clipped Foreground) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ width: `${effectivePosition}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover object-center max-w-none"
          style={{
            width: containerRef.current
              ? `${containerRef.current.clientWidth}px`
              : "100%",
            height: "100%",
          }}
        />

        {/* Top-Left Badge: YOUR PHOTO */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-[#141413]/85 text-[#f5f4ef] text-[10px] tracking-[0.2em] uppercase font-sans font-medium border border-[#3d3b37]/60">
          {beforeLabel}
        </div>
      </div>

      {/* Split Divider Line & Handle */}
      {!isHoldingOriginal && (
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular grip handle with divider symbol */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#141413] border-2 border-white/90 flex items-center justify-center text-white shadow-2xl">
            <Sliders className="w-3.5 h-3.5 rotate-90 text-white" />
          </div>
        </div>
      )}

      {/* Bottom Scrim Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none z-20" />

      {/* Control bar at bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Bottom-Left: HOLD TO VIEW ORIGINAL button */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            setIsHoldingOriginal(true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            setIsHoldingOriginal(false);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            setIsHoldingOriginal(false);
          }}
          className="pointer-events-auto px-3.5 py-1.5 bg-[#141413]/90 hover:bg-[#1c1b1a] text-[#dedbd2] text-[10px] uppercase tracking-[0.16em] font-sans border border-[#3d3b37]/70 flex items-center gap-2 transition-all active:scale-95 shadow-lg"
        >
          <Eye className="w-3.5 h-3.5 text-[#9e5033]" />
          <span>Hold to view original</span>
        </button>

        {/* Bottom-Right: DRAG SLIDER TO COMPARE (fades on drag) */}
        <span
          className={`text-[10px] text-[#a4a095] uppercase tracking-[0.16em] bg-[#141413]/85 px-3 py-1.5 border border-[#3d3b37]/50 shadow-lg transition-opacity duration-700 ${
            hasInteracted ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          Drag slider to compare
        </span>
      </div>
    </div>
  );
}
