"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/db/supabase";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

    // Redirect to studio or wardrobe
    router.push("/try-on");
  };

  const handleGuestLogin = () => {
    router.push("/try-on");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#fcfbf8] px-4 py-16">
      <div className="max-w-md w-full border border-[#e8e4da] bg-white p-8 sm:p-10 space-y-8 shadow-sm">
        <div className="text-center space-y-2">
          <span className="font-editorial text-3xl font-normal text-[#141413] block">
            FITTED
          </span>
          <p className="text-xs uppercase tracking-[0.16em] text-[#7a7770]">
            Sign in to access your wardrobe
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#fbedea] border border-[#f5cdc4] text-[#9e3a24] text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#141413] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="curator@editorial.fashion"
              className="w-full px-3.5 py-2.5 border border-[#d6d2c8] bg-[#fcfbf8] text-xs focus:outline-none focus:border-[#141413] text-[#141413]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#141413]">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 border border-[#d6d2c8] bg-[#fcfbf8] text-xs focus:outline-none focus:border-[#141413] text-[#141413]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.14em] font-semibold transition-colors mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Guest Pass */}
        <div className="pt-4 border-t border-[#eeebe3] text-center space-y-4">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 border border-[#e2ded4] hover:border-[#141413] bg-[#f7f5ee] text-xs uppercase tracking-wider text-[#141413] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#9e5033]" />
            <span>Continue as Guest Curator</span>
          </button>

          <p className="text-xs text-[#7a7770]">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#9e5033] hover:underline font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
