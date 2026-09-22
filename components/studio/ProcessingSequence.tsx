"use client";

import React from "react";
import { TryOnStage } from "@/lib/types";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProcessingSequenceProps {
  currentStage: TryOnStage;
  stageMessage?: string;
  percent?: number;
}

const STAGES: { id: TryOnStage; title: string; subtitle: string }[] = [
  {
    id: "analyzing",
    title: "1. Analyzing Composition",
    subtitle: "Evaluating posture, ambient illumination & body silhouette",
  },
  {
    id: "segmenting",
    title: "2. Garment Segmentation",
    subtitle: "Isolating garment geometry & structural seam boundaries",
  },
  {
    id: "synthesizing",
    title: "3. Neural Drape Synthesis",
    subtitle: "Simulating fabric gravity, folds & directional shadows",
  },
  {
    id: "finalizing",
    title: "4. Final Rendering",
    subtitle: "Refining texture fidelity and photorealistic blend",
  },
];

export function ProcessingSequence({
  currentStage,
  stageMessage,
  percent = 30,
}: ProcessingSequenceProps) {
  const getStageIndex = (stage: TryOnStage): number => {
    switch (stage) {
      case "analyzing":
        return 0;
      case "segmenting":
        return 1;
      case "synthesizing":
        return 2;
      case "finalizing":
        return 3;
      case "completed":
        return 4;
      default:
        return -1;
    }
  };

  const activeIndex = getStageIndex(currentStage);

  return (
    <div className="w-full aspect-[3/4] bg-[#141413] border border-[#2a2927] p-8 flex flex-col justify-between text-[#f5f4ef]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#282725] pb-4">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#9e5033] font-medium">
            Virtual Try-On Engine
          </span>
          <span className="text-xs font-mono text-[#8c8982]">{percent}%</span>
        </div>

        {/* Dynamic Status Callout */}
        <div className="mt-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-[#9e5033] animate-spin shrink-0" />
          <p className="text-sm font-editorial italic text-[#f0eee6]">
            {stageMessage || "Synthesizing realistic garment transfer..."}
          </p>
        </div>
      </div>

      {/* Sequential Milestone Checklist */}
      <div className="space-y-4 my-auto">
        {STAGES.map((s, idx) => {
          const isDone = activeIndex > idx;
          const isCurrent = activeIndex === idx;

          return (
            <div
              key={s.id}
              className={`p-3 border transition-colors duration-300 ${
                isCurrent
                  ? "border-[#9e5033] bg-[#9e5033]/10"
                  : isDone
                  ? "border-[#2e3d30] bg-[#1a241b]/20"
                  : "border-[#222120] opacity-40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-sans uppercase tracking-[0.14em] ${
                    isCurrent
                      ? "text-[#f5f4ef] font-semibold"
                      : isDone
                      ? "text-[#9ec4a2]"
                      : "text-[#8c8982]"
                  }`}
                >
                  {s.title}
                </span>

                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#9ec4a2]" />}
                {isCurrent && <Loader2 className="w-3.5 h-3.5 text-[#9e5033] animate-spin" />}
              </div>

              <p className="text-[11px] text-[#7d7a73] mt-1 leading-snug">
                {s.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Meter Bar */}
      <div>
        <div className="w-full h-1 bg-[#222120] overflow-hidden">
          <div
            className="h-full bg-[#9e5033] transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="block mt-2 text-[9px] uppercase tracking-[0.2em] text-[#6b6861] text-right">
          Processing server pipeline
        </span>
      </div>
    </div>
  );
}
