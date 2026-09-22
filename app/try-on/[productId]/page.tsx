import React from "react";
import { notFound } from "next/navigation";
import { fittedStore } from "@/lib/db/store";
import { StudioDualPane } from "@/components/studio/StudioDualPane";

interface TryOnWithProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function TryOnWithProductPage({
  params,
}: TryOnWithProductPageProps) {
  const { productId } = await params;
  const allProducts = await fittedStore.getProducts();
  const selectedProduct = allProducts.find((p) => p.id === productId);

  if (!selectedProduct) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col">
      <StudioDualPane
        initialProduct={selectedProduct}
        allProducts={allProducts}
      />
    </div>
  );
}
