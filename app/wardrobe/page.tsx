"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SavedLook } from "@/lib/types";
import { fittedStore } from "@/lib/db/store";
import { formatPrice } from "@/lib/utils";
import {
  Bookmark,
  Sparkles,
  Download,
  Share2,
  Trash2,
  ArrowRight,
  Sliders,
} from "lucide-react";

export default function WardrobePage() {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadWardrobe = async () => {
    setLoading(true);
    const saved = await fittedStore.getSavedLooks();
    setLooks(saved);
    setLoading(false);
  };

  useEffect(() => {
    loadWardrobe();
    const handleUpdate = () => loadWardrobe();
    window.addEventListener("fitted-wardrobe-updated", handleUpdate);
    return () => window.removeEventListener("fitted-wardrobe-updated", handleUpdate);
  }, []);

  const handleDelete = async (id: string) => {
    await fittedStore.removeSavedLook(id);
    setLooks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleDownload = (imageUrl: string, title: string) => {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `fitted-${title.toLowerCase().replace(/\s+/g, "-")}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = (lookId: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedId(lookId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="flex-1 bg-[#fcfbf8] text-[#141413]">
      {/* Editorial Header */}
      <div className="border-b border-[#e8e4da] bg-[#f7f5ee] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9e5033] font-medium block">
              Curated Wardrobe
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#141413] mt-2">
              Saved Looks
            </h1>
            <p className="text-xs sm:text-sm text-[#6b6861] mt-2 max-w-lg leading-relaxed">
              Your personalized try-on fittings. Review how different silhouettes,
              fabrics, and colors look on you.
            </p>
          </div>

          <Link
            href="/try-on"
            className="px-5 py-2.5 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.14em] font-semibold flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9e5033]" />
            <span>Try On More Looks</span>
          </Link>
        </div>
      </div>

      {/* Wardrobe Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="py-24 text-center text-xs uppercase tracking-widest text-[#8c8982]">
            Loading saved looks...
          </div>
        ) : looks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {looks.map((look) => (
              <div
                key={look.id}
                className="flex flex-col bg-[#fcfbf8] border border-[#e8e5dc] overflow-hidden group"
              >
                {/* Result Image */}
                <div className="relative aspect-[3/4] bg-[#161615] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={look.resultImageUrl}
                    alt={look.productName}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  />

                  {/* Brand Tag Top Left */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#141413]/85 text-[#fcfbf8] text-[10px] uppercase tracking-[0.18em] font-medium backdrop-blur-sm border border-white/10">
                    {look.productBrand}
                  </div>

                  {/* Date Badge Top Right */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#141413]/70 text-[#c4c0b6] text-[9px] uppercase tracking-wider font-mono backdrop-blur-sm">
                    {new Date(look.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-editorial text-lg text-[#141413] leading-snug">
                        {look.productName}
                      </h3>
                      <span className="text-xs font-mono font-medium text-[#141413] shrink-0 mt-0.5">
                        {formatPrice(look.productPrice)}
                      </span>
                    </div>

                    <span className="text-[10px] uppercase tracking-[0.16em] text-[#8c8982] block mt-1">
                      Category: {look.category}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-[#eeebe3] flex items-center justify-between gap-2">
                    <Link
                      href={`/try-on/${look.productId}`}
                      className="text-xs uppercase tracking-[0.12em] font-semibold text-[#9e5033] hover:text-[#864228] flex items-center gap-1 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Re-Open in Studio</span>
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(look.resultImageUrl, look.productName)}
                        title="Download look"
                        className="p-1.5 text-[#7a7770] hover:text-[#141413] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(look.id)}
                        title="Share look link"
                        className="p-1.5 text-[#7a7770] hover:text-[#141413] transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(look.id)}
                        title="Remove from wardrobe"
                        className="p-1.5 text-[#7a7770] hover:text-[#9e5033] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Wardrobe State */
          <div className="max-w-md mx-auto py-20 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border border-[#e2ded4] flex items-center justify-center text-[#9e5033]">
              <Bookmark className="w-5 h-5" />
            </div>
            <h2 className="font-editorial text-2xl font-normal text-[#141413]">
              Your wardrobe is currently empty.
            </h2>
            <p className="text-xs text-[#6b6861] leading-relaxed">
              Launch the Try-On Studio with any garment, capture or upload your photo, and
              tap &ldquo;Save Look&rdquo; to store your fittings here.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/shop"
                className="px-6 py-3 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Browse Garments
              </Link>
              <Link
                href="/try-on"
                className="px-6 py-3 bg-[#9e5033] hover:bg-[#864228] text-white text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Open Studio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
