"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, ShoppingBag, Bookmark, History, User, Menu, X, Store, Gauge } from "lucide-react";
import { fittedStore } from "@/lib/db/store";

export function Navbar() {
  const pathname = usePathname();
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCount = async () => {
      const looks = await fittedStore.getSavedLooks();
      setWardrobeCount(looks.length);
    };
    updateCount();

    const handleUpdate = () => updateCount();
    window.addEventListener("styletry-saved-looks-updated", handleUpdate);
    return () => window.removeEventListener("styletry-saved-looks-updated", handleUpdate);
  }, []);

  const navLinks = [
    { href: "/shop", label: "Catalog" },
    { href: "/try-on", label: "Fitting Room", highlight: true },
    { href: "/demo-store", label: "Storefront Demo" },
    { href: "/admin", label: "Merchant Admin" },
    { href: "/wardrobe", label: "Wardrobe", badge: wardrobeCount > 0 ? wardrobeCount : undefined },
    { href: "/history", label: "Sessions" },
  ];

  const isStudioRoute = pathname.startsWith("/try-on") || pathname.startsWith("/admin");

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 border-b ${
        isStudioRoute
          ? "bg-[#141413]/95 text-[#fcfbf8] border-white/10"
          : "bg-[#fcfbf8]/95 text-[#141413] border-[#e8e4da]"
      } backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="group flex flex-col items-start focus:outline-none"
            id="nav-logo"
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-serif text-2xl sm:text-3xl font-medium tracking-tight transition-transform duration-300 group-hover:scale-[1.01] ${
                  isStudioRoute ? "text-[#fcfbf8]" : "text-[#141413]"
                }`}
              >
                StyleTry <span className="text-[#9e5033]">AI</span>
              </span>
            </div>
            <span
              className={`text-[9px] uppercase tracking-[0.26em] font-sans font-medium -mt-1 ${
                isStudioRoute ? "text-white/40" : "text-[#7a7770]"
              }`}
            >
              Live E-Commerce Fitting Room
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium tracking-[0.14em] uppercase">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/shop"
                ? pathname.startsWith("/shop") || pathname.startsWith("/product")
                : pathname === link.href || (link.href === "/try-on" && pathname.startsWith("/try-on"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1.5 transition-colors duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? isStudioRoute
                      ? "text-[#ffffff] font-semibold"
                      : "text-[#141413] font-semibold"
                    : isStudioRoute
                    ? "text-white/60 hover:text-white"
                    : "text-[#5c5a55] hover:text-[#141413]"
                }`}
              >
                {link.label}
                {link.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[9px] rounded-full font-mono ${
                      isStudioRoute
                        ? "bg-[#9e5033] text-white"
                        : "bg-[#141413] text-white"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1.5px] ${
                      isStudioRoute ? "bg-[#9e5033]" : "bg-[#141413]"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/try-on"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 bg-[#9e5033] hover:bg-[#864228] text-white rounded-lg shadow-sm"
            id="nav-try-on-cta"
          >
            Launch Fitting Room
          </Link>

          <Link
            href="/profile"
            aria-label="Profile & Privacy"
            className={`p-2 transition-colors duration-150 ${
              isStudioRoute
                ? "text-white/60 hover:text-white"
                : "text-[#5c5a55] hover:text-[#141413]"
            }`}
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-current"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-t px-6 py-6 space-y-4 ${
            isStudioRoute ? "bg-[#141413] border-white/10" : "bg-[#fcfbf8] border-[#e6e2d8]"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-sm uppercase tracking-wider"
            >
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-[#9e5033] text-white">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-4 border-t border-current/10">
            <Link
              href="/try-on"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 bg-[#9e5033] text-white text-xs uppercase tracking-widest font-semibold rounded-lg"
            >
              Launch Fitting Room
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
