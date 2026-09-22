import React from "react";
import { fittedStore } from "@/lib/db/store";
import { StudioDualPane } from "@/components/studio/StudioDualPane";

export default async function TryOnStudioPage() {
  const allProducts = await fittedStore.getProducts();
  const initialProduct = allProducts[0];

  return (
    <div className="flex-1 flex flex-col">
      <StudioDualPane
        initialProduct={initialProduct}
        allProducts={allProducts}
      />
    </div>
  );
}
