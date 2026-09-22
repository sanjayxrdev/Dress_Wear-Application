"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Sparkles, ArrowUpRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex flex-col bg-[#fcfbf8] border border-[#e8e5dc] hover:border-[#cfcbc0] transition-colors duration-300">
      {/* Product Image Stage */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f0ede6]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center editorial-img-reveal"
        />

        {/* Brand Tag Top Left */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#fcfbf8]/90 backdrop-blur-sm text-[10px] uppercase tracking-[0.18em] font-medium text-[#141413] border border-[#e2dfd7]">
          {product.brand}
        </div>

        {/* Hover Quick Try-On Overlay Bar */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
          <Link
            href={`/try-on/${product.id}`}
            className="w-full py-2.5 px-4 bg-[#fcfbf8] hover:bg-white text-[#141413] text-xs uppercase tracking-[0.14em] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9e5033]" />
            <span>Try It On Now</span>
          </Link>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/product/${product.id}`}
              className="font-editorial text-lg text-[#141413] hover:text-[#9e5033] transition-colors leading-snug"
            >
              {product.name}
            </Link>
            <span className="text-sm font-mono font-medium text-[#141413] shrink-0 mt-0.5">
              {formatPrice(product.price, product.currency)}
            </span>
          </div>

          <p className="text-xs text-[#6b6861] mt-1.5 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Bottom Specs & Actions */}
        <div className="mt-4 pt-3 border-t border-[#eeebe3] flex items-center justify-between text-xs">
          {/* Color swatches */}
          <div className="flex items-center gap-1.5">
            {product.availableColors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-3 h-3 rounded-full border border-black/20"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.availableColors.length > 3 && (
              <span className="text-[10px] text-[#8c8982]">
                +{product.availableColors.length - 3}
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.id}`}
            className="text-[11px] uppercase tracking-[0.14em] text-[#7d7a73] hover:text-[#141413] flex items-center gap-0.5 transition-colors font-medium"
          >
            <span>Specs</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
