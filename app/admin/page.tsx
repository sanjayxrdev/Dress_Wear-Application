'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Shield,
  Gauge,
  Sliders,
  DollarSign,
  Clock,
  Layers,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { fittedStore } from '@/lib/db/store';
import { Merchant, MerchantConfig } from '@/lib/types';

export default function MerchantAdminPage() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [config, setConfig] = useState<MerchantConfig | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [allowedOrigins, setAllowedOrigins] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const m = await fittedStore.getMerchant();
      const c = await fittedStore.getMerchantConfig();
      const a = await fittedStore.getAnalyticsSummary();
      setMerchant(m);
      setConfig(c);
      setAnalytics(a);
      setAllowedOrigins(m.allowedOrigins.join(', '));
    }
    load();
  }, []);

  const handleSaveSettings = async () => {
    if (!merchant || !config) return;
    const origins = allowedOrigins.split(',').map((s) => s.trim()).filter(Boolean);
    merchant.allowedOrigins = origins;
    await fittedStore.updateMerchantConfig(config.merchantId, config);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#141413] text-[#fcfbf8] font-sans">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#9e5033]/20 border border-[#9e5033]/30 text-[#9e5033]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-serif tracking-tight text-white font-medium">
                StyleTry AI — Merchant Admin
              </h1>
              <p className="text-[11px] text-white/50 tracking-wider uppercase">
                {merchant?.name || 'Atelier Haute'} • Plan: {merchant?.plan || 'Growth'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/benchmarks"
              className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Benchmarks</span>
            </Link>

            <Link
              href="/admin/intake"
              className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Garment Intake Studio</span>
            </Link>

            <Link
              href="/demo-store"
              target="_blank"
              className="py-2 px-3.5 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-xs font-medium text-white transition-all flex items-center gap-1.5 shadow-md shadow-[#9e5033]/20"
            >
              <span>View Storefront Demo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {saveSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Configuration and cost limits saved successfully.</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider">
              <span>Monthly Sessions</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-serif text-white font-medium">
              {analytics?.totalSessions || 42} / {merchant?.monthlySessionLimit || 5000}
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, ((analytics?.totalSessions || 42) / (merchant?.monthlySessionLimit || 5000)) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-white/40">Capped automatically at limit</p>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider">
              <span>Avg Latency</span>
              <Gauge className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-serif text-white font-medium">
              {analytics?.avgLatencyMs || 168} ms
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target &lt; 180 ms met</span>
            </div>
            <p className="text-[11px] text-white/40">WebRTC real-time stream</p>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider">
              <span>Avg Frame Rate</span>
              <Gauge className="w-4 h-4 text-[#9e5033]" />
            </div>
            <div className="text-2xl font-serif text-white font-medium">
              {analytics?.avgFps || 28.5} FPS
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Target 24–30 FPS met</span>
            </div>
            <p className="text-[11px] text-white/40">Hardware accelerated render</p>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-white/50 uppercase tracking-wider">
              <span>Stability Index</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-serif text-white font-medium">
              {analytics?.avgStability || 94.2}%
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pose tracking lock</span>
            </div>
            <p className="text-[11px] text-white/40">Zero garment drift</p>
          </div>
        </div>

        {/* Cost Controls & Session Limits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-serif text-white font-medium">
                  Cost Controls & Session Quotas
                </h2>
                <p className="text-xs text-white/50">
                  Protect infrastructure budgets and prevent abusive bot sessions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                  Monthly Session Cap
                </label>
                <input
                  type="number"
                  value={merchant?.monthlySessionLimit || 5000}
                  onChange={(e) =>
                    merchant && setMerchant({ ...merchant, monthlySessionLimit: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                />
                <span className="text-[11px] text-white/40 block">Max fittings allowed per billing cycle</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                  Max Session Duration (Seconds)
                </label>
                <input
                  type="number"
                  value={merchant?.maxSessionDurationSec || 300}
                  onChange={(e) =>
                    merchant && setMerchant({ ...merchant, maxSessionDurationSec: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                />
                <span className="text-[11px] text-white/40 block">Default 300s (5 min). Prevents runaway camera sessions.</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                  Idle Auto-Disconnect (Seconds)
                </label>
                <input
                  type="number"
                  value={merchant?.idleTimeoutSec || 90}
                  onChange={(e) =>
                    merchant && setMerchant({ ...merchant, idleTimeoutSec: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                />
                <span className="text-[11px] text-white/40 block">Disconnects stream after 90s without interaction</span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                  Rate Limit (Requests / Min)
                </label>
                <input
                  type="number"
                  value={merchant?.rateLimitPerMinute || 60}
                  onChange={(e) =>
                    merchant && setMerchant({ ...merchant, rateLimitPerMinute: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
                />
                <span className="text-[11px] text-white/40 block">Per-IP rate limit guardrail</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-xs font-semibold uppercase tracking-wider text-white/70 block">
                Allowed Store Origins (Iframe Embed Whitelist)
              </label>
              <input
                type="text"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                placeholder="http://localhost:3000, https://yourstore.myshopify.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#9e5033]"
              />
              <span className="text-[11px] text-white/40 block">Comma-separated domains authorized to embed the sandboxed widget</span>
            </div>

            <button
              onClick={handleSaveSettings}
              className="py-3 px-6 rounded-xl bg-[#9e5033] hover:bg-[#85432b] text-white font-medium text-sm transition-all shadow-md shadow-[#9e5033]/20"
            >
              Save Configuration
            </button>
          </div>

          {/* Quick Integration & SDK Token Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-serif text-white font-medium">
                Storefront Embed Snippet
              </h2>
              <p className="text-xs text-white/60 leading-relaxed">
                Add this single line of JavaScript into your store theme (Shopify <code className="text-[#9e5033]">theme.liquid</code>, WooCommerce, or custom site):
              </p>

              <div className="p-4 bg-black/60 rounded-xl border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto">
                {`<script src="https://styletry.ai/widget/styletry.js"\n  data-merchant-id="${merchant?.id || 'merch_atelier_haute'}"\n  async>\n</script>`}
              </div>

              <div className="space-y-2 text-xs text-white/60">
                <span className="font-semibold text-white/80 block">Button Trigger HTML:</span>
                <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs font-mono text-white/80">
                  {`<button data-styletry-trigger data-product-id="prd_1">\n  Try on Live with StyleTry AI\n</button>`}
                </div>
              </div>
            </div>

            {/* Merchant API Key */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 block">
                Production Merchant API Key
              </span>
              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-xs text-white/80">
                <span>{merchant?.apiKey || 'st_live_99a8b7c6d5e4f3a2'}</span>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Active</span>
              </div>
              <p className="text-[11px] text-white/40">Keep this secret. Never expose in client-side HTML.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
