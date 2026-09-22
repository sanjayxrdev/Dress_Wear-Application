import Link from "next/link";
import { ShieldCheck, Camera, Sparkles, RefreshCw } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#e8e4da] bg-[#f7f6f0] text-[#141413] mt-auto">
      {/* Guarantees Strip */}
      <div className="border-b border-[#e8e4da] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="flex items-start gap-3.5">
            <div className="p-2 border border-[#e2ded4] bg-[#fcfbf8] text-[#9e5033]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#141413]">
                Zero Camera Storage
              </h4>
              <p className="text-xs text-[#5c5a55] mt-1 leading-relaxed">
                Live webcam video is processed in local memory. Only explicit snapshots are analyzed for garment transfer.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 border border-[#e2ded4] bg-[#fcfbf8] text-[#9e5033]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#141413]">
                Precision Fabric Transfer
              </h4>
              <p className="text-xs text-[#5c5a55] mt-1 leading-relaxed">
                Realistic neural garment transfer preserving real silhouettes, garment weight, and ambient lighting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2 border border-[#e2ded4] bg-[#fcfbf8] text-[#9e5033]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.14em] font-semibold text-[#141413]">
                Permanent Data Deletion
              </h4>
              <p className="text-xs text-[#5c5a55] mt-1 leading-relaxed">
                Purge your photos and session history at any moment via the Profile privacy dashboard with one click.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <span className="font-editorial text-2xl tracking-tight block">FITTED</span>
          <p className="text-xs text-[#7a7770] tracking-wide mt-1">
            Commercial Neural Apparel Try-On Engine.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.14em] text-[#5c5a55]">
          <Link href="/shop" className="hover:text-[#141413] transition-colors">
            Collection
          </Link>
          <Link href="/try-on" className="hover:text-[#141413] transition-colors">
            Try-On Studio
          </Link>
          <Link href="/wardrobe" className="hover:text-[#141413] transition-colors">
            Wardrobe
          </Link>
          <Link href="/history" className="hover:text-[#141413] transition-colors">
            History
          </Link>
          <Link href="/profile" className="hover:text-[#141413] transition-colors">
            Privacy & Profile
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-[#e8e4da] flex justify-between items-center text-[11px] text-[#8c8982]">
        <span>© {new Date().getFullYear()} Fitted Technologies Inc.</span>
        <span>Editorial Edition 2.4</span>
      </div>
    </footer>
  );
}
