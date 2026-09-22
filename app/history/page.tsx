"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TryOnSession } from "@/lib/types";
import { fittedStore } from "@/lib/db/store";
import { History, Sparkles, Clock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<TryOnSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    const data = await fittedStore.getSessions();
    setSessions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
    const handleUpdate = () => loadSessions();
    window.addEventListener("fitted-history-updated", handleUpdate);
    return () => window.removeEventListener("fitted-history-updated", handleUpdate);
  }, []);

  return (
    <div className="flex-1 bg-[#fcfbf8] text-[#141413]">
      {/* Editorial Header */}
      <div className="border-b border-[#e8e4da] bg-[#f7f5ee] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#9e5033] font-medium block">
              Audit & Execution Log
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#141413] mt-2">
              Try-On Sessions
            </h1>
            <p className="text-xs sm:text-sm text-[#6b6861] mt-2 max-w-lg leading-relaxed">
              Chronological log of neural virtual fittings generated across your
              sessions, including latency, model provenance, and status.
            </p>
          </div>

          <Link
            href="/try-on"
            className="px-5 py-2.5 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.14em] font-semibold flex items-center gap-2 transition-colors shadow-sm self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9e5033]" />
            <span>Launch New Fitting</span>
          </Link>
        </div>
      </div>

      {/* Sessions Table / List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="py-24 text-center text-xs uppercase tracking-widest text-[#8c8982]">
            Loading session logs...
          </div>
        ) : sessions.length > 0 ? (
          <div className="border border-[#e8e4da] bg-white divide-y divide-[#eeebe3]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#faf9f5] transition-colors"
              >
                {/* Left: Thumbnail & Session Info */}
                <div className="flex items-center gap-4">
                  {/* Result or Garment Preview */}
                  <div className="w-14 h-18 bg-[#161615] overflow-hidden shrink-0 border border-[#e2ded4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={session.resultImageUrl || session.garmentImageUrl}
                      alt={session.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#141413]">
                        {session.productName}
                      </span>
                      <span className="text-[10px] text-[#7d7a73] font-mono">
                        ({session.productBrand})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-[#7a7770]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#9e5033]" />
                        {new Date(session.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {new Date(session.createdAt).toLocaleDateString()}
                      </span>

                      <span>•</span>

                      <span className="font-mono text-[#8c8982]">
                        Model: {session.model} ({session.provider})
                      </span>

                      {session.processingTimeMs && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[#8c8982]">
                            Latency: {(session.processingTimeMs / 1000).toFixed(1)}s
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status & Action */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest font-mono font-medium ${
                      session.status === "completed"
                        ? "bg-[#edf5ee] text-[#2f6336] border border-[#cfe3d1]"
                        : "bg-[#fbedea] text-[#9e3a24] border border-[#f5cdc4]"
                    }`}
                  >
                    {session.status === "completed" ? (
                      <CheckCircle2 className="w-3 h-3 text-[#2f6336]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-[#9e3a24]" />
                    )}
                    <span>{session.status}</span>
                  </span>

                  <Link
                    href={`/try-on/${session.productId}`}
                    className="px-3 py-1.5 bg-[#141413] hover:bg-[#282725] text-white text-[11px] uppercase tracking-wider font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>Re-Fit</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty History State */
          <div className="max-w-md mx-auto py-20 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border border-[#e2ded4] flex items-center justify-center text-[#9e5033]">
              <History className="w-5 h-5" />
            </div>
            <h2 className="font-editorial text-2xl font-normal text-[#141413]">
              No past sessions recorded yet.
            </h2>
            <p className="text-xs text-[#6b6861] leading-relaxed">
              Whenever you execute a virtual try-on in the studio, the session parameters,
              latency, and output are logged here for review.
            </p>
            <div className="pt-4">
              <Link
                href="/try-on"
                className="px-6 py-3 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-wider font-semibold transition-colors inline-block"
              >
                Launch Studio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
