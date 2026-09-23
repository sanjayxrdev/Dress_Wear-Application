'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Non-blocking reporting of client errors
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center px-6 py-20 bg-[#fcfbf8] text-[#141413]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest font-semibold text-rose-600">
            System Notice
          </p>
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            An Unexpected Disruption Occurred
          </h1>
          <p className="text-sm text-[#141413]/60 leading-relaxed">
            The studio encountered a temporary issue while rendering. Your camera stream and personal preferences remain protected.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-[#9e5033]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#141413]/15 hover:bg-[#141413]/5 text-[#141413] text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
