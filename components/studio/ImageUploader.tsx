"use client";

import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, AlertCircle, Check, Sparkles } from "lucide-react";
import { validateImageFile } from "@/lib/cv/image-validator";

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
  selectedImage?: string;
  onClear?: () => void;
}

// High-resolution curated neutral editorial portraits for instantaneous demonstration
const SAMPLE_PORTRAITS = [
  {
    name: "Editorial Portrait I",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Editorial Portrait II",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
  },
  {
    name: "Editorial Portrait III",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop",
  },
];

export function ImageUploader({
  onImageSelected,
  selectedImage,
  onClear,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsValidating(true);

    try {
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        setErrorMessage(validation.error || "Invalid image file.");
        setIsValidating(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelected(result);
        setIsValidating(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage("Could not parse image. Please try another file.");
      setIsValidating(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (selectedImage) {
    return (
      <div className="relative w-full aspect-[3/4] bg-[#141413] border border-[#2a2927] overflow-hidden group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selectedImage}
          alt="Selected Portrait"
          className="w-full h-full object-cover object-center"
        />

        <div className="absolute top-4 left-4 px-2.5 py-1 bg-[#141413]/85 text-[#f5f4ef] text-[10px] tracking-[0.18em] uppercase font-sans font-medium backdrop-blur-sm border border-[#333230]">
          Active Photo
        </div>

        <div className="absolute inset-0 bg-[#141413]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-[#fcfbf8] text-[#141413] text-xs uppercase tracking-wider font-semibold hover:bg-white transition-colors"
          >
            Change Photo
          </button>
          {onClear && (
            <button
              onClick={onClear}
              className="px-4 py-2 bg-[#262523] text-[#e0ded8] text-xs uppercase tracking-wider hover:bg-[#33312e] transition-colors border border-[#403e3a]"
            >
              Clear
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full aspect-[3/4] flex flex-col items-center justify-center p-6 border text-center cursor-pointer transition-colors duration-200 ${
          isDragging
            ? "border-[#9e5033] bg-[#9e5033]/5"
            : "border-dashed border-[#3a3835] bg-[#161615] hover:border-[#524f4b]"
        }`}
      >
        <div className="w-12 h-12 rounded-full border border-[#3a3835] flex items-center justify-center text-[#9e5033] mb-4">
          <Upload className="w-5 h-5" />
        </div>

        <span className="text-xs uppercase tracking-[0.16em] font-medium text-[#dedbd2]">
          Drop your photo here
        </span>
        <span className="text-[11px] text-[#7d7a73] mt-1.5 max-w-[220px]">
          or click to browse JPG, PNG, or WebP up to 10MB
        </span>

        {isValidating && (
          <span className="text-xs text-[#9e5033] mt-3 animate-pulse">
            Validating photo dimensions...
          </span>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 bg-[#241a18] border border-[#5c2a1c] text-[#e89078] text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Instant Demo Portrait Selector */}
      <div className="pt-2 border-t border-[#262523]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#8c8982]">
            Instant Portrait Samples
          </span>
          <span className="text-[9px] text-[#6b6861] uppercase tracking-wider">
            One-click test
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SAMPLE_PORTRAITS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onImageSelected(sample.url)}
              className="group relative aspect-[3/4] overflow-hidden border border-[#2a2927] hover:border-[#9e5033] transition-colors text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sample.url}
                alt={sample.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                <span className="text-[9px] text-white/90 uppercase tracking-tight">
                  Sample {idx + 1}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
