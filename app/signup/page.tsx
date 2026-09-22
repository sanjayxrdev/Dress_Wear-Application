"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/db/supabase";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }
    }

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
            Create your curator profile
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Elena Vance"
              className="w-full px-3.5 py-2.5 border border-[#d6d2c8] bg-[#fcfbf8] text-xs focus:outline-none focus:border-[#141413] text-[#141413]"
            />
          </div>

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
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#141413] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 border border-[#d6d2c8] bg-[#fcfbf8] text-xs focus:outline-none focus:border-[#141413] text-[#141413]"
            />
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-[#7a7770]">
            <ShieldCheck className="w-4 h-4 text-[#9e5033] shrink-0 mt-0.5" />
            <span>
              By registering, you retain 100% rights to purge your photos and try-on
              history at any time.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#141413] hover:bg-[#282725] text-white text-xs uppercase tracking-[0.14em] font-semibold transition-colors mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="pt-4 border-t border-[#eeebe3] text-center">
          <p className="text-xs text-[#7a7770]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#9e5033] hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
