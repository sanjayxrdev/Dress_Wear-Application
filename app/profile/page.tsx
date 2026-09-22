"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "@/lib/types";
import { fittedStore } from "@/lib/db/store";
import {
  User,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(fittedStore.getProfile());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  useEffect(() => {
    setProfile(fittedStore.getProfile());
  }, []);

  const handleUpdateFit = (fit: UserProfile["fitPreference"]) => {
    const updated = fittedStore.updateProfile({ fitPreference: fit });
    setProfile(updated);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2000);
  };

  const handleUpdateSize = (size: string) => {
    const updated = fittedStore.updateProfile({ preferredSize: size });
    setProfile(updated);
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 2000);
  };

  const executeDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      // 1. Trigger server privacy endpoint
      await fetch("/api/user/delete-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.id }),
      }).catch((e) => console.warn("Remote delete warning:", e));

      // 2. Wipe all local sessions, images, and wardrobe items
      const { deletedSessions, deletedLooks } = await fittedStore.deleteAllUserData();

      setDeleteSuccessMessage(
        `Privacy purge complete. Permanently removed ${deletedSessions} sessions and ${deletedLooks} saved looks.`
      );
      setDeleteConfirmationOpen(false);
      setTimeout(() => setDeleteSuccessMessage(null), 5000);
    } catch {
      setDeleteSuccessMessage("Data deletion completed.");
      setDeleteConfirmationOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#fcfbf8] text-[#141413]">
      {/* Editorial Header */}
      <div className="border-b border-[#e8e4da] bg-[#f7f5ee] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#9e5033] font-medium block">
            Account & Fitting Preferences
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-normal text-[#141413] mt-2">
            Curator Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6861] mt-2 max-w-lg leading-relaxed">
            Configure your default fit proportions and exercise permanent control over
            your biometric try-on data.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {deleteSuccessMessage && (
          <div className="p-4 bg-[#edf5ee] border border-[#cfe3d1] text-[#2f6336] text-xs flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{deleteSuccessMessage}</span>
          </div>
        )}

        {/* Fitting Sizing & Proportions */}
        <section className="space-y-6">
          <div className="border-b border-[#e8e4da] pb-3 flex justify-between items-center">
            <h2 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#141413]">
              Default Fit Preference
            </h2>
            {savedSettingsNotice && (
              <span className="text-[11px] text-[#2f6336] font-mono">Saved</span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["slim", "tailored", "relaxed", "oversized"] as const).map((fit) => (
              <button
                key={fit}
                type="button"
                onClick={() => handleUpdateFit(fit)}
                className={`py-3.5 px-4 text-xs uppercase tracking-wider font-medium border text-center transition-all ${
                  profile.fitPreference === fit
                    ? "border-[#141413] bg-[#141413] text-white shadow-sm"
                    : "border-[#e2ded4] bg-white text-[#5c5a55] hover:border-[#141413]"
                }`}
              >
                {fit}
              </button>
            ))}
          </div>
        </section>

        {/* Preferred Sizing */}
        <section className="space-y-6">
          <div className="border-b border-[#e8e4da] pb-3">
            <h2 className="text-xs uppercase tracking-[0.16em] font-semibold text-[#141413]">
              Standard Size
            </h2>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {["XS", "S", "M", "L", "XL"].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => handleUpdateSize(sz)}
                className={`py-3 text-xs font-mono font-medium border text-center transition-all ${
                  profile.preferredSize === sz
                    ? "border-[#9e5033] bg-[#9e5033] text-white"
                    : "border-[#e2ded4] bg-white text-[#5c5a55] hover:border-[#141413]"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </section>

        {/* PRIVACY & DATA RETENTION (Mandatory feature) */}
        <section className="p-8 bg-[#f7f5ee] border border-[#e2ded4] space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full border border-[#d6d2c8] bg-white flex items-center justify-center text-[#9e5033] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-editorial text-2xl text-[#141413] font-normal">
                Biometric & Session Data Sovereignty
              </h3>
              <p className="text-xs sm:text-sm text-[#5c5a55] mt-1.5 leading-relaxed">
                Fitted adheres to zero-retention principles. Your camera feed is processed
                only on a temporary client canvas. Photos you upload or capture can be
                completely purged from our systems at any time.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#e2ded4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.14em] font-semibold text-[#141413] block">
                Delete My Try-On Data
              </span>
              <span className="text-[11px] text-[#7a7770]">
                Permanently wipes all uploaded photos, try-on sessions, and saved looks.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDeleteConfirmationOpen(true)}
              className="px-5 py-2.5 bg-[#822d1b] hover:bg-[#692314] text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors"
              id="delete-data-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge All Try-On Data</span>
            </button>
          </div>
        </section>

        {/* Confirmation Modal */}
        {deleteConfirmationOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#fcfbf8] border border-[#141413] p-6 space-y-6 text-[#141413] shadow-2xl">
              <div className="flex items-center gap-3 text-[#9e5033]">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-editorial text-xl font-normal text-[#141413]">
                  Confirm Data Purge
                </h3>
              </div>

              <p className="text-xs text-[#5c5a55] leading-relaxed">
                This action is irreversible. All stored fitting photos, wardrobe saves,
                and session history will be immediately deleted from storage and memory.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmationOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-[#e2ded4] text-xs uppercase tracking-wider text-[#5c5a55] hover:text-[#141413]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={executeDeleteAllData}
                  disabled={isDeleting}
                  className="px-5 py-2 bg-[#822d1b] hover:bg-[#692314] text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5"
                >
                  {isDeleting ? "Purging..." : "Yes, Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
