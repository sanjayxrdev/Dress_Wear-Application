import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fittedStore } from "@/lib/db/store";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fittedStore.getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1 bg-[#fcfbf8] text-[#141413]">
      {/* Breadcrumbs */}
      <div className="border-b border-[#e8e4da] px-4 sm:px-6 lg:px-8 py-3.5 bg-[#f7f5ee]">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#7a7770]">
          <Link href="/shop" className="hover:text-[#141413] transition-colors">
            Collection
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#a8a59e]" />
          <span className="capitalize">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#a8a59e]" />
          <span className="text-[#141413] font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Main Detail Section: Asymmetric Photography + Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Large Imagery & Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[3/4] bg-[#f0ede6] border border-[#e2ded4] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.primaryImage}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute top-4 left-4 px-3 py-1 bg-[#fcfbf8]/90 text-[10px] uppercase tracking-[0.18em] font-medium border border-[#e2ded4]">
                {product.brand}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.gallery.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-[3/4] bg-[#f0ede6] border border-[#e2ded4] overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Specs, Size & Try-On CTAs */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-[#9e5033] font-semibold block">
                {product.brand}
              </span>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#141413] mt-2 font-normal">
                {product.name}
              </h1>
              <p className="text-xl font-mono text-[#141413] font-medium mt-3">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5c5a55] leading-relaxed">
              {product.description}
            </p>

            {/* Color Swatches */}
            <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-[0.14em] font-semibold text-[#141413] block">
                Colorways
              </span>
              <div className="flex items-center gap-3">
                {product.availableColors.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="flex items-center gap-2 p-2 border border-[#e2ded4] bg-[#fcfbf8] hover:border-[#141413] transition-colors text-xs"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-[11px] uppercase tracking-wider">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-[0.14em] font-semibold text-[#141413]">
                  Select Sizing
                </span>
                <span className="text-[#8c8982] uppercase tracking-wider text-[11px]">
                  True to form fit
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="py-3 border border-[#e2ded4] bg-[#fcfbf8] text-xs font-mono font-medium hover:border-[#141413] hover:bg-[#141413] hover:text-white transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* PRIMARY CTA: Launch Virtual Try-On Studio with this Product */}
            <div className="space-y-3 pt-4 border-t border-[#e8e4da]">
              <Link
                href={`/try-on/${product.id}`}
                className="w-full py-4 bg-[#9e5033] hover:bg-[#864228] text-white text-xs uppercase tracking-[0.18em] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                id="product-try-on-cta"
              >
                <Sparkles className="w-4 h-4" />
                <span>Try It On Yourself</span>
              </Link>

              <button
                type="button"
                className="w-full py-3.5 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add To Cart • {formatPrice(product.price, product.currency)}</span>
              </button>
            </div>

            {/* Editorial Material & Fit Disclosure Box */}
            <div className="p-6 bg-[#f7f5ee] border border-[#e8e4da] space-y-4 text-xs">
              <div>
                <span className="uppercase tracking-wider font-semibold text-[#141413] block">
                  Material Composition
                </span>
                <p className="text-[#5c5a55] mt-1">{product.material}</p>
              </div>

              <div className="pt-3 border-t border-[#e2ded4]">
                <span className="uppercase tracking-wider font-semibold text-[#141413] block">
                  Silhouette & Fit
                </span>
                <p className="text-[#5c5a55] mt-1">{product.fit}</p>
              </div>

              <div className="pt-3 border-t border-[#e2ded4]">
                <span className="uppercase tracking-wider font-semibold text-[#141413] block">
                  Care Instructions
                </span>
                <p className="text-[#5c5a55] mt-1">{product.care}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
