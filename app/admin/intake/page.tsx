'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';
import {
  GarmentValidationResult,
  SUPPORTED_CATEGORIES,
  UNSUPPORTED_CATEGORIES,
  validateGarmentImage,
} from '@/lib/intake/validator';
import { GarmentCategory } from '@/lib/types';

export default function GarmentIntakePage() {
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&auto=format&fit=crop&q=80'
  );
  const [category, setCategory] = useState<GarmentCategory>('outerwear');
  const [formalityLevel, setFormalityLevel] = useState<number>(3);
  const [silhouette, setSilhouette] = useState<'slim' | 'tailored' | 'relaxed' | 'oversized'>('tailored');
  const [primaryHex, setPrimaryHex] = useState('#141413');
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<GarmentValidationResult | null>(null);

  const handleValidate = async () => {
    setIsValidating(true);
    const result = await validateGarmentImage(imageUrl);
    setValidation(result);
    setIsValidating(false);
  };

  return (
    <div className="min-h-screen bg-[#141413] text-[#fcfbf8] font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base font-serif tracking-tight text-white font-medium">
                Garment Intake & Validation Studio
              </h1>
              <p className="text-[11px] text-white/50 tracking-wider uppercase">
                Asset Quality Gating & Structured Metadata Intake
              </p>
            </div>
          </div>

          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="py-2 px-4 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-xs font-medium text-white transition-all flex items-center gap-2 shadow-md shadow-[#9e5033]/20 disabled:opacity-50"
          >
            {isValidating ? (
              <span>Validating Asset...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Run Intake Validation</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form & Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-serif text-white font-medium">
                Upload & Image Specifications
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                  Garment Try-On Reference URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                  />
                  <button
                    onClick={handleValidate}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white"
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Category & Formality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                    Supported Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GarmentCategory)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                  >
                    {SUPPORTED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#141413]">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                    Formality Rating (1 = Casual, 5 = Black Tie)
                  </label>
                  <select
                    value={formalityLevel}
                    onChange={(e) => setFormalityLevel(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                  >
                    <option value={1} className="bg-[#141413]">1 — Casual</option>
                    <option value={2} className="bg-[#141413]">2 — Smart Casual</option>
                    <option value={3} className="bg-[#141413]">3 — Business Casual</option>
                    <option value={4} className="bg-[#141413]">4 — Formal / Evening</option>
                    <option value={5} className="bg-[#141413]">5 — Black Tie</option>
                  </select>
                </div>
              </div>

              {/* Silhouette & Primary Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                    Silhouette Type
                  </label>
                  <select
                    value={silhouette}
                    onChange={(e) => setSilhouette(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                  >
                    <option value="slim" className="bg-[#141413]">Slim</option>
                    <option value="tailored" className="bg-[#141413]">Tailored</option>
                    <option value="relaxed" className="bg-[#141413]">Relaxed</option>
                    <option value="oversized" className="bg-[#141413]">Oversized</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                    Primary Garment Hex
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryHex}
                      onChange={(e) => setPrimaryHex(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryHex}
                      onChange={(e) => setPrimaryHex(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#9e5033]"
                    />
                  </div>
                </div>
              </div>

              {/* Unsupported Categories Warning */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Category Guardrail</span>
                </div>
                <p>
                  Unsupported categories ({UNSUPPORTED_CATEGORIES.join(', ')}) are automatically rejected at upload to maintain realistic fitting quality.
                </p>
              </div>
            </div>
          </div>

          {/* Validation Result & Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-serif text-white font-medium">
                Asset Health & Gating
              </h2>

              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <img
                  src={imageUrl}
                  alt="Garment Preview"
                  className="w-full h-full object-cover"
                />
                {validation && (
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        validation.isValid
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {validation.isValid ? 'Approved for Live VTON' : 'Rejected'}
                    </span>
                  </div>
                )}
              </div>

              {validation ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-white/60">Quality Readiness Score</span>
                    <span className="text-base font-serif font-bold text-white">
                      {validation.score} / 100
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Resolution Check (&gt;= 1024x1024)</span>
                      <span className={validation.checks.resolutionPassed ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                        {validation.resolution.width}x{validation.resolution.height}px
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Clean Isolated Background</span>
                      <span className={validation.checks.backgroundClean ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {validation.checks.backgroundClean ? 'Pass' : 'Notice'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Front-Facing View Orientation</span>
                      <span className={validation.checks.frontView ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                        {validation.checks.frontView ? 'Pass' : 'Skewed'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Category Permitted</span>
                      <span className="text-emerald-400 font-semibold">Supported</span>
                    </div>
                  </div>

                  {validation.warnings.length > 0 && (
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/70 space-y-1">
                      <span className="font-semibold text-amber-400 block">Advisories:</span>
                      {validation.warnings.map((w, idx) => (
                        <p key={idx}>• {w}</p>
                      ))}
                    </div>
                  )}

                  {validation.rejectionReasons.length > 0 && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
                      <span className="font-semibold text-rose-400 block">Rejection Reasons:</span>
                      {validation.rejectionReasons.map((r, idx) => (
                        <p key={idx}>• {r}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-white/40 text-xs">
                  Click "Run Intake Validation" to test this garment asset against production quality rules.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
