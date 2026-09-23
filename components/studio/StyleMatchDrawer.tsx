'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ChevronRight,
  X,
  Scissors,
} from 'lucide-react';
import { StyleMatchResult } from '@/lib/style-engine/scorer';
import { SizeFitAssessment } from '@/lib/style-engine/fit-calculator';
import { Product } from '@/lib/types';

interface StyleMatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  styleMatch: StyleMatchResult | null;
  sizeFit: SizeFitAssessment | null;
  stylistExplanation?: string;
  product: Product;
}

export function StyleMatchDrawer({
  isOpen,
  onClose,
  styleMatch,
  sizeFit,
  stylistExplanation,
  product,
}: StyleMatchDrawerProps) {
  const [showRuleTables, setShowRuleTables] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="style-drawer-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#141413] border-l border-white/10 shadow-2xl flex flex-col text-white animate-slide-left font-sans"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#9e5033]/20 border border-[#9e5033]/30 text-[#9e5033]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 id="style-drawer-title" className="text-base font-serif font-medium text-white tracking-tight">
              Explainable Style Match
            </h2>
            <p className="text-[11px] text-white/50 tracking-wider uppercase">
              Deterministic Scoring Engine
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9e5033] transition-colors cursor-pointer"
          aria-label="Close Drawer"
          title="Close Drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Style Match Hero Score Card */}
        {styleMatch && (
          <div className="p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-white/50 font-semibold">
                {styleMatch.label}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                {styleMatch.confidenceScore}% Confidence
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-serif font-medium text-white">
                {styleMatch.overallScore}
              </span>
              <span className="text-xl font-serif text-white/40">/ 100</span>
              <span className="ml-auto text-xs text-emerald-400 font-medium">
                {styleMatch.overallScore >= 85 ? 'Strong Pairing' : 'Harmonious Match'}
              </span>
            </div>

            {/* Editorial Stylist Explanation (LLM wording only) */}
            {stylistExplanation && (
              <p className="text-xs text-white/80 leading-relaxed italic border-t border-white/10 pt-3">
                &ldquo;{stylistExplanation}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* 6-Dimension Breakdown */}
        {styleMatch && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Dimensional Breakdown
              </h3>
              <button
                onClick={() => setShowRuleTables(!showRuleTables)}
                className="text-[11px] text-[#9e5033] hover:underline flex items-center gap-1"
              >
                <span>{showRuleTables ? 'Hide Rules' : 'View Rule Tables'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(styleMatch.dimensions).map(([key, dim]) => (
                <div
                  key={key}
                  className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium text-white/90">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    {dim.status === 'known' ? (
                      <span className="font-mono text-emerald-400 font-semibold">
                        {dim.score} / 100
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                        Unknown (Weight Renormalized)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 leading-normal">
                    {dim.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Physical Size Fit vs Visual Try-On Separation Card */}
        <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/90">
              Physical Sizing vs. Visual Try-On
            </h3>
          </div>

          {sizeFit?.status === 'recommended' ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-300">
                <span>Recommended Size:</span>
                <span className="font-bold text-white text-sm font-mono">
                  {sizeFit.recommendedSize}
                </span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                {sizeFit.explanation}
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5 text-xs text-amber-200/90">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <ShieldAlert className="w-4 h-4" />
                <span>Physical Sizing Disclaimer</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/70">
                {sizeFit?.disclaimer ||
                  'Visual try-on cannot guarantee physical sizing. Measurements or brand size chart required for physical recommendation.'}
              </p>
            </div>
          )}
        </div>

        {/* Rule Tables Drawer Modal */}
        {showRuleTables && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-xs space-y-3 text-white/70">
            <span className="font-semibold text-white block">Published Mathematical Rules:</span>
            <p>
              • <strong>Color Harmony:</strong> CIE76 LAB ΔE = sqrt(ΔL² + Δa² + Δb²). Monochromatic contrast (&lt; 18) and balanced contrast (40–85) score &gt; 90.
            </p>
            <p>
              • <strong>Confidence:</strong> f(completeness, pose) = (known_weights × 0.7) + (pose_quality × 0.3).
            </p>
            <p>
              • <strong>Formality Matrix:</strong> Compatibility scale from Casual (1) to Black Tie (5).
            </p>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-white/10 bg-black/40 text-center text-[11px] text-white/40">
        Neutral styling algorithm • Compliant with DPDP Act & GDPR
      </div>
    </div>
  );
}
