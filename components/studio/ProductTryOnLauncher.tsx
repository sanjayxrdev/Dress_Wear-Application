'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '@/lib/types';
import { LiveARFittingRoom } from './LiveARFittingRoom';
import { Sparkles, ShoppingBag } from 'lucide-react';

interface ProductTryOnLauncherProps {
  product: Product;
  allProducts: Product[];
}

export function ProductTryOnLauncher({
  product,
  allProducts,
}: ProductTryOnLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTryOnSupported = product.tryOnAsset?.hasValidAsset !== false;
  const disabledReason = product.tryOnAsset?.disabledReason || 'Asset pending 3D validation';

  return (
    <>
      <div className="space-y-3 pt-4 border-t border-[#e8e4da]">
        <button
          type="button"
          onClick={() => {
            if (isTryOnSupported) setIsOpen(true);
          }}
          disabled={!isTryOnSupported}
          className={`w-full py-4 text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
            isTryOnSupported
              ? 'bg-[#9e5033] hover:bg-[#864228] text-white cursor-pointer'
              : 'bg-[#9e5033]/40 text-white/70 cursor-not-allowed'
          }`}
          id="product-try-on-cta"
          title={!isTryOnSupported ? disabledReason : 'Launch Live Camera Virtual Fitting Room'}
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isTryOnSupported ? 'Try It On Yourself' : `Try-On Unavailable (${disabledReason})`}
          </span>
        </button>

        <button
          type="button"
          className="w-full py-3.5 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add To Cart • ${product.price}</span>
        </button>
      </div>

      {/* Floating draggable Live AR Fitting Room window portalled to document.body */}
      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <LiveARFittingRoom
          initialProduct={product}
          allProducts={allProducts}
          isFloating={true}
          onClose={() => setIsOpen(false)}
        />,
        document.body
      )}
    </>
  );
}
