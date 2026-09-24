'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { LiveARFittingRoom } from './LiveARFittingRoom';

interface TryOnClientViewProps {
  initialProduct: Product;
  allProducts: Product[];
}

export function TryOnClientView({
  initialProduct,
  allProducts,
}: TryOnClientViewProps) {
  return (
    <div className="flex-1 flex flex-col relative w-full h-[calc(100vh-4.5rem)] bg-[#141413] text-[#fcfbf8] overflow-hidden">
      <LiveARFittingRoom
        initialProduct={initialProduct}
        allProducts={allProducts}
        isFloating={false}
        onClose={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/shop';
          }
        }}
      />
    </div>
  );
}
