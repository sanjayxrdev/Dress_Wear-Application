import Link from "next/link";
import { fittedStore } from "@/lib/db/store";
import { ProductCard } from "@/components/shop/ProductCard";
import { Sparkles, Camera, Sliders, ShieldCheck, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const products = await fittedStore.getProducts();
  const showcaseProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col bg-[#fcfbf8]">
      {/* 1. Editorial Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col justify-center border-b border-[#e8e4da] px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
          {/* Hero Typography & Intentional Asymmetry */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#e2ded4] bg-[#f5f3ec] text-[11px] uppercase tracking-[0.2em] font-sans font-medium text-[#7d7a73]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9e5033]" />
              Commercial Virtual Try-On
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.05] tracking-tight text-[#141413]">
              See it on you <br />
              <span className="italic font-light">before you buy.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#5c5a55] max-w-xl font-sans leading-relaxed">
              Photorealistic neural garment transfer engineered for serious apparel.
              Accurate drape, fabric weight, and silhouette alignment — never a sticker overlay.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/try-on"
                className="px-8 py-4 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-all duration-200 shadow-sm flex items-center gap-2"
                id="hero-try-on-cta"
              >
                <Sparkles className="w-4 h-4 text-[#9e5033]" />
                <span>Try It On Now</span>
              </Link>

              <Link
                href="/shop"
                className="px-8 py-4 bg-transparent hover:bg-[#f0ede6] text-[#141413] text-xs uppercase tracking-[0.16em] font-semibold border border-[#141413] transition-all duration-200 flex items-center gap-2"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Hero Editorial Imagery - Uncropped Fashion Anchor */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#e8e4da] border border-[#d6d2c8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                alt="Editorial Virtual Try-On Fitting"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#141413]/85 backdrop-blur-md text-white border border-white/10">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#9e5033] block">
                  Signature Transfer Model
                </span>
                <p className="text-xs font-editorial italic mt-1">
                  Architectural Wool Overcoat rendered with authentic seam physics & ambient shadow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Minimal Editorial Manifesto & Core Principles Bar */}
      <section className="border-b border-[#e8e4da] bg-[#f7f5ee] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] uppercase tracking-[0.16em] text-[#7d7a73]">
          <div>1. ZERO PERMANENT WEBCAM STORAGE</div>
          <div>2. NEURAL DRAPE & FOLD ALIGNMENT</div>
          <div>3. SWAP LOOKS WITHOUT RESTART</div>
          <div>4. INSTANT ONE-CLICK DATA DELETION</div>
        </div>
      </section>

      {/* 3. Featured Collection Showcase (Immediate Product Engagement) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-[#e8e4da]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#9e5033] font-medium block">
              Curated Garments
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413] mt-2 font-normal">
              Available for immediate try-on.
            </h2>
          </div>

          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.14em] font-medium text-[#141413] hover:text-[#9e5033] flex items-center gap-1 transition-colors"
          >
            <span>View Full Catalog ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {showcaseProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Honest 3-Step Process (How The Studio Works) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-b border-[#e8e4da]">
        <div className="mb-14 text-left">
          <span className="text-xs uppercase tracking-[0.2em] text-[#9e5033] font-medium block">
            How The Studio Works
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#141413] mt-2 font-normal">
            Precision garment transfer in three deliberate steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-[#f7f5ee] border border-[#e8e4da] flex flex-col justify-between">
            <div>
              <span className="font-editorial text-4xl text-[#9e5033] block">01</span>
              <h3 className="text-sm uppercase tracking-[0.16em] font-semibold text-[#141413] mt-4">
                Select Your Garment
              </h3>
              <p className="text-xs text-[#5c5a55] mt-3 leading-relaxed">
                Choose from our curated collection of structured tailoring, heavyweight outerwear, fluid silks, and artisan knitwear.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#e2ded4] text-[10px] uppercase tracking-wider text-[#8c8982]">
              Standardized reference cuts
            </div>
          </div>

          <div className="p-8 bg-[#f7f5ee] border border-[#e8e4da] flex flex-col justify-between">
            <div>
              <span className="font-editorial text-4xl text-[#9e5033] block">02</span>
              <h3 className="text-sm uppercase tracking-[0.16em] font-semibold text-[#141413] mt-4">
                Frame Or Upload Your Photo
              </h3>
              <p className="text-xs text-[#5c5a55] mt-3 leading-relaxed">
                Use your webcam with our real-time silhouette guide and lighting sensor, or upload an existing high-res portrait.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#e2ded4] text-[10px] uppercase tracking-wider text-[#8c8982]">
              Canvas advisory evaluation
            </div>
          </div>

          <div className="p-8 bg-[#f7f5ee] border border-[#e8e4da] flex flex-col justify-between">
            <div>
              <span className="font-editorial text-4xl text-[#9e5033] block">03</span>
              <h3 className="text-sm uppercase tracking-[0.16em] font-semibold text-[#141413] mt-4">
                Compare, Switch & Curate
              </h3>
              <p className="text-xs text-[#5c5a55] mt-3 leading-relaxed">
                Inspect every fold with our interactive Before/After split slider. Switch between coats and suits without re-uploading your photo.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-[#e2ded4] text-[10px] uppercase tracking-wider text-[#8c8982]">
              Persistent wardrobe saving
            </div>
          </div>
        </div>
      </section>

      {/* 5. Privacy Guarantee Note (Honest & Explicit) */}
      <section className="bg-[#f2efe6] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-full border border-[#d6d2c8] flex items-center justify-center text-[#9e5033]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-2xl text-[#141413] font-normal">
            Privacy is a core architectural feature.
          </h3>
          <p className="text-xs sm:text-sm text-[#5c5a55] max-w-2xl mx-auto leading-relaxed">
            We never retain raw webcam video streams. Images submitted for virtual fitting
            can be permanently purged at any time with a single click in your profile. No
            tracking beacons, no biometric data resale.
          </p>
          <div className="pt-2">
            <Link
              href="/profile"
              className="text-xs uppercase tracking-[0.14em] text-[#9e5033] hover:underline font-semibold"
            >
              Review Data Retention Controls →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
