'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShoppingBag, ShieldCheck, Check, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import Script from 'next/script';

export default function DemoStorePage() {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Midnight Obsidian');
  const [isFittingRoomOpen, setIsFittingRoomOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const product = {
    id: 'prd_1',
    name: 'The Structured Wool Trench',
    brand: 'Atelier Haute',
    price: 680,
    currency: '$',
    category: 'outerwear',
    primaryImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&auto=format&fit=crop&q=80',
    description: 'Double-breasted trench tailored from heavyweight Italian virgin wool. Features architectural raglan shoulders, storm flap, and a detachable belt for customizable waist definition.',
    colors: [
      { name: 'Midnight Obsidian', hex: '#141413' },
      { name: 'Warm Terracotta', hex: '#9e5033' },
      { name: 'Raw Ivory', hex: '#e8ded1' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  };

  const handleLaunchFittingRoom = () => {
    if (typeof window !== 'undefined' && (window as any).StyleTryAI) {
      (window as any).StyleTryAI.open(product.id);
    } else {
      setIsFittingRoomOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfbf8] text-[#141413] font-sans antialiased selection:bg-[#9e5033] selection:text-white">
      {/* Include the StyleTry AI SDK Script */}
      <Script src="/widget/styletry.js" data-merchant-id="merch_atelier_haute" strategy="afterInteractive" />

      {/* Merchant Store Header */}
      <header className="border-b border-[#141413]/10 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/demo-store" className="text-xl font-serif font-bold tracking-tight text-[#141413]">
              ATELIER HAUTE
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-[#141413]/60 font-medium">
              <span className="text-[#141413]">Collection</span>
              <span>Tailoring</span>
              <span>Outerwear</span>
              <span>Editorial</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shopify / WooCommerce Demo Store</span>
            </div>

            <div className="relative p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer">
              <ShoppingBag className="w-5 h-5 text-[#141413]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#9e5033] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141413] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 flex items-center gap-3 animate-fade-in text-sm">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Product Detail Layout */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Product Media Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm">
              <img
                src={product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase text-[#141413] border border-black/5 shadow-sm">
                Virgin Wool 100%
              </div>
            </div>
          </div>

          {/* Product Purchase Actions & StyleTry AI Trigger */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#9e5033] font-semibold mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif text-[#141413] font-medium tracking-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-serif text-[#141413] mt-3">
                {product.currency}{product.price}
              </p>
            </div>

            <p className="text-sm text-[#141413]/70 leading-relaxed">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-[#141413]/60 font-semibold block">
                Color — <span className="text-[#141413]">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === c.name
                        ? 'border-[#9e5033] scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor === c.name && (
                      <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-[#141413]/60 font-semibold">
                  Select Size
                </label>
                <span className="text-xs text-[#9e5033] underline cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                      selectedSize === s
                        ? 'bg-[#141413] text-white border-[#141413] shadow-md'
                        : 'bg-white text-[#141413] border-neutral-200 hover:border-[#141413]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* StyleTry AI Embeddable Live Fitting Room Banner & Trigger */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#141413] to-[#262422] text-white shadow-xl space-y-4 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#9e5033]/30 text-[#9e5033]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
                    StyleTry AI Live Fitting Room
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  WebRTC Live
                </span>
              </div>

              <p className="text-xs text-white/70 leading-relaxed">
                See this garment rendered on your live camera feed with real-time pose tracking, lighting assessment, and explainable Style Match insights.
              </p>

              {/* Embeddable Trigger Button */}
              <button
                onClick={handleLaunchFittingRoom}
                data-styletry-trigger
                data-product-id={product.id}
                className="w-full py-3.5 px-6 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-white font-medium text-sm tracking-wide transition-all shadow-lg shadow-[#9e5033]/30 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>Try on Live with StyleTry AI</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center justify-between pt-1 text-[11px] text-white/50 border-t border-white/10">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  No video stored
                </span>
                <span>Camera stops on exit</span>
              </div>
            </div>

            {/* Standard Add to Cart */}
            <button
              onClick={() => {
                setCartCount((c) => c + 1);
                setToastMessage(`Added ${product.name} (Size ${selectedSize}) to bag`);
                setTimeout(() => setToastMessage(null), 3500);
              }}
              className="w-full py-4 px-6 rounded-xl bg-[#141413] hover:bg-black text-white font-medium text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag — {product.currency}{product.price}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Fallback Direct Modal (when SDK runs in local preview) */}
      {isFittingRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-5xl h-[85vh] bg-[#141413] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={`/widget/embed?merchant_id=merch_atelier_haute&product_id=${product.id}`}
              className="w-full h-full border-none"
              allow="camera; microphone; display-capture"
            />
          </div>
        </div>
      )}
    </div>
  );
}
