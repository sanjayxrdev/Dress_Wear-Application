"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { fittedStore } from "@/lib/db/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { CategoryFilter } from "@/components/shop/CategoryFilter";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const all = await fittedStore.getProducts();
      setProducts(all);
      setLoading(false);
    };
    loadProducts();
  }, []);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="flex-1 bg-[#fcfbf8] text-[#141413]">
      {/* Editorial Header */}
      <div className="border-b border-[#e8e4da] bg-[#f7f5ee] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9e5033] font-medium block">
              Permanent Collection 2026
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#141413] mt-2">
              The Apparel Catalog
            </h1>
            <p className="text-xs sm:text-sm text-[#6b6861] mt-2 max-w-lg leading-relaxed">
              Every garment is mapped for photorealistic neural virtual try-on. Tap
              any piece to test it on your personal silhouette.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/try-on"
              className="px-5 py-2.5 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.14em] font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#9e5033]" />
              <span>Open Blank Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Category Tab Filter */}
        <div className="flex items-center justify-between">
          <CategoryFilter
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
          <span className="text-xs font-mono text-[#8c8982] hidden sm:inline">
            {filteredProducts.length} pieces
          </span>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs uppercase tracking-widest text-[#8c8982]">
            Loading catalog...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-[#7d7a73] space-y-3">
            <p className="text-sm font-editorial italic">
              No garments found for this category.
            </p>
            <button
              onClick={() => setActiveCategory("all")}
              className="px-4 py-2 bg-[#141413] text-white text-xs uppercase tracking-wider"
            >
              View All Garments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
