"use client";

import React from "react";
import { GarmentCategory } from "@/lib/types";

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All Works" },
  { id: "outerwear", label: "Outerwear" },
  { id: "tailoring", label: "Tailoring" },
  { id: "tops", label: "Silk & Shirts" },
  { id: "dresses", label: "Dresses" },
  { id: "knitwear", label: "Knitwear" },
];

export function CategoryFilter({
  activeCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 border-b border-[#e8e4da] scrollbar-none">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.14em] font-medium whitespace-nowrap transition-colors relative ${
              isActive
                ? "text-[#141413] font-semibold"
                : "text-[#7a7770] hover:text-[#141413]"
            }`}
          >
            {cat.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#141413]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
