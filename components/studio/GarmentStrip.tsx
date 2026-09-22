"use client";

import React from "react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Check } from "lucide-react";

interface GarmentStripProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  isProcessing?: boolean;
}

export function GarmentStrip({
  products,
  selectedProduct,
  onSelectProduct,
  isProcessing = false,
}: GarmentStripProps) {
  return (
    <div className="w-full bg-[#161615] border-t border-[#262523] p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#f5f4ef]">
            Switch Garment
          </span>
          <span className="text-[10px] text-[#7d7a73] font-sans">
            (Instant transfer • Preserves active photo)
          </span>
        </div>
        <span className="text-[10px] text-[#8c8982] uppercase tracking-wider font-mono">
          {products.length} garments available
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {products.map((product) => {
          const isSelected = product.id === selectedProduct.id;

          return (
            <button
              key={product.id}
              type="button"
              disabled={isProcessing}
              onClick={() => onSelectProduct(product)}
              className={`shrink-0 flex items-center gap-3 p-2 border transition-all text-left group ${
                isSelected
                  ? "border-[#9e5033] bg-[#221c19]"
                  : "border-[#282725] bg-[#1a1918] hover:border-[#3d3b37] hover:bg-[#201f1e]"
              } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Product Thumbnail */}
              <div className="relative w-14 h-18 bg-[#121211] overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-[#9e5033] rounded-full flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="pr-3">
                <span className="text-[9px] uppercase tracking-[0.16em] text-[#8c8982] block">
                  {product.brand}
                </span>
                <h5 className="text-xs text-[#f5f4ef] font-medium max-w-[130px] truncate mt-0.5">
                  {product.name}
                </h5>
                <span className="text-xs font-mono text-[#dedbd2] block mt-1">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
