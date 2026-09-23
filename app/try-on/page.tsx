import React from "react";
import { fittedStore } from "@/lib/db/store";
import { TryOnClientView } from "@/components/studio/TryOnClientView";

export default async function TryOnStudioPage() {
  const allProducts = await fittedStore.getProducts();
  const initialProduct = allProducts[0];

  return (
    <div className="flex-1 flex flex-col">
      <TryOnClientView
        initialProduct={initialProduct}
        allProducts={allProducts}
      />
    </div>
  );
}
