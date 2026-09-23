'use client';

import React, { useState } from 'react';
import { ShieldCheck, Video, Cpu, Lock, CheckCircle2, X } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onConsent: () => void;
  onDecline: () => void;
  brandName?: string;
}

export function ConsentModal({
  isOpen,
  onConsent,
  onDecline,
  brandName = 'StyleTry AI',
}: ConsentModalProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#141413] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
        <button
          onClick={onDecline}
          className="absolute top-5 right-5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#9e5033]/20 border border-[#9e5033]/40 rounded-xl text-[#9e5033]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif tracking-tight text-[#fcfbf8]">
              Camera Privacy & Fitting Consent
            </h2>
            <p className="text-xs text-white/50 tracking-wide uppercase">
              Powered by {brandName}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6 text-sm text-white/80 leading-relaxed">
          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <Video className="w-5 h-5 text-[#9e5033] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Real-Time Fitting Feed</span>
              Live video is streamed exclusively to the VTON processing pipeline for real-time garment warping. <strong className="text-white">No raw video is ever stored or saved.</strong>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">On-Device Look Quality Monitor</span>
              Pose boundaries, ambient lighting, and motion blur are analyzed 100% locally on your browser. Zero frames are uploaded for quality gating.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Instant Camera Termination & Rights</span>
              Your camera stops immediately when you exit. You have full self-serve rights to delete your try-on history at any time in compliance with DPDP Act & GDPR.
            </div>
          </div>
        </div>

        <div className="p-3 bg-black/40 rounded-xl border border-white/5 mb-6 text-xs text-white/60">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 rounded border-white/30 text-[#9e5033] focus:ring-[#9e5033]"
            />
            <span>
              I consent to temporary camera access for live virtual fitting. I understand I can revoke permissions and delete my data at any time.
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConsent}
            disabled={!acknowledged}
            className="flex-1 py-3 px-4 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#9e5033]/25"
          >
            <CheckCircle2 className="w-4 h-4" />
            Start Fitting Room
          </button>
        </div>
      </div>
    </div>
  );
}
