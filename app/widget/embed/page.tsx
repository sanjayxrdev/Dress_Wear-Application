'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { fittedStore } from '@/lib/db/store';
import { Product } from '@/lib/types';
import { CameraCapture } from '@/components/studio/CameraCapture';
import { StyleMatchDrawer } from '@/components/studio/StyleMatchDrawer';
import { ConsentModal } from '@/components/privacy/ConsentModal';
import { ShieldCheck, Sparkles, X } from 'lucide-react';

function EmbedFittingRoomContent() {
  const searchParams = useSearchParams();
  const merchantId = searchParams.get('merchant_id') || 'merch_atelier_haute';
  const initialProductId = searchParams.get('product_id') || 'prd_1';

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasConsent, setHasConsent] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    async function loadData() {
      const products = await fittedStore.getProducts();
      setAllProducts(products);
      const matched = products.find((p) => p.id === initialProductId) || products[0];
      setProduct(matched);

      // Notify parent store window that widget is ready
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage(
          {
            type: 'STYLETRY_READY',
            merchantId,
            productId: matched?.id,
          },
          '*'
        );
      }
    }
    loadData();

    // Listen for postMessage from host e-commerce page (Shopify / WooCommerce)
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'STYLETRY_SET_PRODUCT' && data.productId) {
        fittedStore.getProductById(data.productId).then((p) => {
          if (p) setProduct(p);
        });
      } else if (data.type === 'STYLETRY_CLOSE') {
        setSessionActive(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [merchantId, initialProductId]);

  const handleStartSession = () => {
    if (!hasConsent) {
      setIsConsentModalOpen(true);
    } else {
      setSessionActive(true);
    }
  };

  const handleConsentApproved = () => {
    setHasConsent(true);
    setIsConsentModalOpen(false);
    setSessionActive(true);
  };

  const handleClose = () => {
    setSessionActive(false);
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'STYLETRY_CLOSE' }, '*');
    }
  };

  const handleAddToCart = () => {
    if (product && typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage(
        {
          type: 'STYLETRY_ADD_TO_CART',
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            size: product.availableSizes?.[0] || 'M',
          },
        },
        '*'
      );
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#141413] text-[#fcfbf8] overflow-hidden flex flex-col font-sans select-none">
      {/* Demo Mode Banner if active */}
      {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
        <div className="bg-[#9e5033]/90 text-white text-[11px] font-medium tracking-widest uppercase text-center py-1 border-b border-[#9e5033]/30">
          Demo, not live AI
        </div>
      )}

      {/* Widget Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-white/90">
            StyleTry AI Live
          </span>
          {product && (
            <span className="text-xs text-white/40 hidden sm:inline">
              — {product.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Exit Fitting Room"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        {sessionActive ? (
          <div className="flex-1 relative h-full flex flex-col">
            <CameraCapture
              onCapture={() => {}}
              onClose={handleClose}
              selectedGarment={
                product
                  ? {
                      id: product.id,
                      name: product.name,
                      category: product.category,
                      imageUrl: product.tryOnReferenceImage || product.primaryImage,
                      price: product.price,
                    }
                  : undefined
              }
              garmentList={allProducts.map((p) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                imageUrl: p.tryOnReferenceImage || p.primaryImage,
                price: p.price,
              }))}
              onSelectGarment={(g) => {
                const matched = allProducts.find((p) => p.id === g.id);
                if (matched) setProduct(matched);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-black/20 to-black/80">
            <div className="max-w-md space-y-6">
              <div className="inline-flex p-4 rounded-2xl bg-[#9e5033]/20 border border-[#9e5033]/30 text-[#9e5033] mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-serif tracking-tight text-[#fcfbf8]">
                Live AI Fitting Room
              </h1>
              <p className="text-sm text-white/70 leading-relaxed">
                See <span className="text-white font-medium">{product?.name || 'this garment'}</span> rendered on your live camera feed in real-time, accompanied by explainable Style Match insights.
              </p>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left text-xs text-white/60 space-y-2">
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Privacy First Architecture</span>
                </div>
                <p>
                  Zero video recorded. On-device pose & lighting validation. Camera stops automatically on exit.
                </p>
              </div>

              <button
                onClick={handleStartSession}
                className="w-full py-3.5 px-6 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-white font-medium text-sm tracking-wide transition-all shadow-lg shadow-[#9e5033]/30 flex items-center justify-center gap-2"
              >
                <span>Launch Camera Fitting Room</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onConsent={handleConsentApproved}
        onDecline={() => setIsConsentModalOpen(false)}
        brandName="StyleTry AI"
      />
    </div>
  );
}

export default function EmbedFittingRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-[#141413] flex items-center justify-center text-white/50 text-sm">
          Loading StyleTry AI Fitting Room...
        </div>
      }
    >
      <EmbedFittingRoomContent />
    </Suspense>
  );
}
