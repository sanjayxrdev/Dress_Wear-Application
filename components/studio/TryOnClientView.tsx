'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { LiveARFittingRoom } from './LiveARFittingRoom';
import { StudioDualPane } from './StudioDualPane';
import { Sparkles, Camera, Sliders } from 'lucide-react';
import Link from 'next/link';

interface TryOnClientViewProps {
  initialProduct: Product;
  allProducts: Product[];
}

export function TryOnClientView({
  initialProduct,
  allProducts,
}: TryOnClientViewProps) {
  const [viewMode, setViewMode] = useState<'live_ar' | 'snapshot_studio'>('live_ar');
  const [selectedProduct, setSelectedProduct] = useState<Product>(initialProduct);

  return (
    <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-4.5rem)] bg-[#141413] text-[#fcfbf8] overflow-hidden">
      {/* Top Experience Selector */}
      <div className="absolute top-3 left-4 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => setViewMode('live_ar')}
          className={`py-1.5 px-3 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            viewMode === 'live_ar'
              ? 'bg-[#9e5033] text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live AR Fitting Room</span>
        </button>

        <button
          onClick={() => setViewMode('snapshot_studio')}
          className={`py-1.5 px-3 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            viewMode === 'snapshot_studio'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Studio Comparison</span>
        </button>
      </div>

      {viewMode === 'live_ar' ? (
        <LiveARFittingRoom
          initialProduct={selectedProduct}
          allProducts={allProducts}
          isFloating={false}
          onClose={() => setViewMode('snapshot_studio')}
        />
      ) : (
        <StudioDualPane
          initialProduct={selectedProduct}
          allProducts={allProducts}
        />
      )}
    </div>
  );
}
