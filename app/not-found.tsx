import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[70vh] flex items-center justify-center px-6 py-20 bg-[#fcfbf8] text-[#141413]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-[#9e5033]/10 text-[#9e5033] border border-[#9e5033]/20">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest font-semibold text-[#9e5033]">
            404 Error • Page Not Found
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight">
            The Piece You Seek Has Shifted
          </h1>
          <p className="text-sm text-[#141413]/60 leading-relaxed">
            The page or garment you are looking for may have been archived, moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-[#9e5033]/20"
          >
            Explore Collection
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#141413]/15 hover:bg-[#141413]/5 text-[#141413] text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
