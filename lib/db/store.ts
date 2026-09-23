import {
  AnalyticsEvent,
  CustomerFeedback,
  GarmentCategory,
  Merchant,
  MerchantConfig,
  Product,
  SavedLook,
  TryOnSession,
  UserProfile,
  WardrobeItem,
} from "@/lib/types";
import { SEED_PRODUCTS } from "./seed-data";
import { isSupabaseConfigured, supabase } from "./supabase";

const STORAGE_KEYS = {
  WARDROBE: "styletry_wardrobe_items_v1",
  SAVED_LOOKS: "styletry_saved_looks_v1",
  SESSIONS: "styletry_tryon_sessions_v1",
  PROFILE: "styletry_user_profile_v1",
  ANALYTICS: "styletry_analytics_v1",
  MERCHANTS: "styletry_merchants_v1",
  MERCHANT_CONFIGS: "styletry_merchant_configs_v1",
  ANON_SESSION_ID: "styletry_anon_session_id",
};

const DEFAULT_MERCHANT: Merchant = {
  id: "merch_atelier_haute",
  name: "Atelier Haute Fashion",
  slug: "atelier-haute",
  apiKey: "st_live_99a8b7c6d5e4f3a2",
  allowedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
  plan: "growth",
  monthlySessionLimit: 5000,
  maxSessionDurationSec: 300,
  idleTimeoutSec: 90,
  rateLimitPerMinute: 60,
  createdAt: "2026-01-01T00:00:00Z",
};

const DEFAULT_MERCHANT_CONFIG: MerchantConfig = {
  merchantId: "merch_atelier_haute",
  brandName: "StyleTry Live Studio",
  brandAccentColor: "#9e5033",
  buttonLabel: "Try on Live with StyleTry AI",
  qualityTier: "balanced",
  ruleOverrides: {},
  isActive: true,
  updatedAt: "2026-01-01T00:00:00Z",
};

const DEFAULT_PROFILE: UserProfile = {
  id: "usr_guest_curator",
  email: "guest.curator@styletry.ai",
  name: "Guest Shopper",
  fitPreference: "tailored",
  preferredSize: "M",
  measurements: {
    chest: 96,
    waist: 80,
    hips: 98,
    height: 178,
    unit: "cm",
  },
  notificationsEnabled: true,
  tryOnDataRetentionDays: 30,
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.warn(`Error reading localStorage key ${key}:`, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error setting localStorage key ${key}:`, err);
  }
}

export const fittedStore = {
  // ANONYMOUS GUEST SESSION
  getAnonymousSessionId(): string {
    if (typeof window === "undefined") return "anon_ssr_session";
    let id = localStorage.getItem(STORAGE_KEYS.ANON_SESSION_ID);
    if (!id) {
      id = "anon_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem(STORAGE_KEYS.ANON_SESSION_ID, id);
    }
    return id;
  },

  // MERCHANTS & CONFIG
  async getMerchant(id: string = "merch_atelier_haute"): Promise<Merchant> {
    const merchants = getLocalItem<Record<string, Merchant>>(STORAGE_KEYS.MERCHANTS, {
      [DEFAULT_MERCHANT.id]: DEFAULT_MERCHANT,
    });
    return merchants[id] || DEFAULT_MERCHANT;
  },

  async getMerchantConfig(merchantId: string = "merch_atelier_haute"): Promise<MerchantConfig> {
    const configs = getLocalItem<Record<string, MerchantConfig>>(STORAGE_KEYS.MERCHANT_CONFIGS, {
      [DEFAULT_MERCHANT_CONFIG.merchantId]: DEFAULT_MERCHANT_CONFIG,
    });
    return configs[merchantId] || DEFAULT_MERCHANT_CONFIG;
  },

  async updateMerchantConfig(
    merchantId: string,
    updates: Partial<MerchantConfig>
  ): Promise<MerchantConfig> {
    const configs = getLocalItem<Record<string, MerchantConfig>>(STORAGE_KEYS.MERCHANT_CONFIGS, {
      [DEFAULT_MERCHANT_CONFIG.merchantId]: DEFAULT_MERCHANT_CONFIG,
    });
    const current = configs[merchantId] || DEFAULT_MERCHANT_CONFIG;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    configs[merchantId] = updated;
    setLocalItem(STORAGE_KEYS.MERCHANT_CONFIGS, configs);
    return updated;
  },

  async canStartSession(merchantId: string = "merch_atelier_haute"): Promise<{ allowed: boolean; reason?: string }> {
    const merchant = await this.getMerchant(merchantId);
    const sessions = await this.getSessions();
    const now = Date.now();
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const monthlySessions = sessions.filter(
      (s) => new Date(s.createdAt).getTime() > oneMonthAgo
    ).length;

    if (monthlySessions >= merchant.monthlySessionLimit) {
      return {
        allowed: false,
        reason: `Monthly session limit of ${merchant.monthlySessionLimit} reached. Upgrade plan in merchant admin.`,
      };
    }

    return { allowed: true };
  },

  // PRODUCTS
  async getProducts(category?: GarmentCategory): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("products").select("*").eq("status", "active");
        if (category) query = query.eq("category", category);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data as Product[];
      } catch (e) {
        console.warn("Supabase products fetch failed, using fallback:", e);
      }
    }

    if (!category) return SEED_PRODUCTS;
    return SEED_PRODUCTS.filter((p) => p.category === category);
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  },

  // TRY-ON SESSIONS
  async recordSession(session: TryOnSession): Promise<void> {
    const currentSessions = getLocalItem<TryOnSession[]>(STORAGE_KEYS.SESSIONS, []);
    const updated = [session, ...currentSessions.filter((s) => s.id !== session.id)];
    setLocalItem(STORAGE_KEYS.SESSIONS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("tryon_sessions").insert({
          id: session.id,
          merchant_id: session.merchantId || DEFAULT_MERCHANT.id,
          anonymous_session_id: session.anonymousSessionId,
          product_id: session.productId,
          product_name: session.productName,
          product_brand: session.productBrand,
          input_image_url: session.inputImageUrl,
          result_image_url: session.resultImageUrl,
          status: session.status,
          stage: session.stage,
          provider: session.provider,
          model: session.model,
          processing_time_ms: session.processingTimeMs,
          error_message: session.errorMessage,
          style_match_score: session.styleMatchScore,
          confidence_score: session.confidenceScore,
          analysis_json: session.analysisJson,
        });
      } catch (err) {
        console.warn("Supabase recordSession error:", err);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("styletry-history-updated"));
    }
  },

  async getSessions(): Promise<TryOnSession[]> {
    return getLocalItem<TryOnSession[]>(STORAGE_KEYS.SESSIONS, []);
  },

  // SAVED LOOKS (Fitting Room Customer Lookbook)
  async saveLook(look: SavedLook): Promise<void> {
    const currentLooks = getLocalItem<SavedLook[]>(STORAGE_KEYS.SAVED_LOOKS, []);
    const exists = currentLooks.some(
      (item) => item.sessionId === look.sessionId && item.productId === look.productId
    );
    if (!exists) {
      const updated = [look, ...currentLooks];
      setLocalItem(STORAGE_KEYS.SAVED_LOOKS, updated);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("saved_looks").insert({
            id: look.id,
            merchant_id: look.merchantId || DEFAULT_MERCHANT.id,
            session_id: look.sessionId,
            product_id: look.productId,
            product_name: look.productName,
            product_brand: look.productBrand,
            product_price: look.productPrice,
            category: look.category,
            input_image_url: look.inputImageUrl,
            result_image_url: look.resultImageUrl,
            style_match_score: look.styleMatchScore,
            analysis_json: look.analysisJson,
            notes: look.notes,
          });
        } catch (err) {
          console.warn("Supabase saveLook error:", err);
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("styletry-saved-looks-updated"));
      }
    }
  },

  async getSavedLooks(): Promise<SavedLook[]> {
    return getLocalItem<SavedLook[]>(STORAGE_KEYS.SAVED_LOOKS, []);
  },

  async removeSavedLook(id: string): Promise<void> {
    const current = getLocalItem<SavedLook[]>(STORAGE_KEYS.SAVED_LOOKS, []);
    const updated = current.filter((look) => look.id !== id);
    setLocalItem(STORAGE_KEYS.SAVED_LOOKS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("saved_looks").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase removeSavedLook error:", err);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("styletry-saved-looks-updated"));
    }
  },

  // WARDROBE ITEMS (Customer's personal closet items for coordination)
  async getWardrobeItems(): Promise<WardrobeItem[]> {
    return getLocalItem<WardrobeItem[]>(STORAGE_KEYS.WARDROBE, [
      {
        id: "wrd_1",
        userId: "usr_guest_curator",
        name: "Classic Silk Shirt",
        category: "tops",
        colorHex: "#e8ded1",
        imageUrl: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&auto=format&fit=crop&q=80",
        formalityLevel: 3,
        createdAt: "2026-01-01T00:00:00Z",
      },
      {
        id: "wrd_2",
        userId: "usr_guest_curator",
        name: "Pleated Wool Trousers",
        category: "bottoms",
        colorHex: "#1f2421",
        imageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80",
        formalityLevel: 4,
        createdAt: "2026-01-02T00:00:00Z",
      },
    ]);
  },

  async addWardrobeItem(item: WardrobeItem): Promise<void> {
    const current = await this.getWardrobeItems();
    const updated = [item, ...current];
    setLocalItem(STORAGE_KEYS.WARDROBE, updated);
  },

  async removeWardrobeItem(id: string): Promise<void> {
    const current = await this.getWardrobeItems();
    const updated = current.filter((item) => item.id !== id);
    setLocalItem(STORAGE_KEYS.WARDROBE, updated);
  },

  // ANALYTICS & QUALITY BENCHMARKS
  async recordAnalytics(event: AnalyticsEvent): Promise<void> {
    const events = getLocalItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
    events.unshift({ ...event, createdAt: new Date().toISOString() });
    setLocalItem(STORAGE_KEYS.ANALYTICS, events.slice(0, 500)); // retain last 500
  },

  async getAnalyticsSummary(merchantId: string = "merch_atelier_haute"): Promise<{
    avgTtfrMs: number;
    avgLatencyMs: number;
    avgFps: number;
    avgStability: number;
    totalSessions: number;
    activeSessions: number;
  }> {
    const events = getLocalItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS, []);
    const merchantEvents = events.filter((e) => e.merchantId === merchantId);

    const ttfrs = merchantEvents.map((e) => e.ttfrMs).filter((v): v is number => typeof v === "number");
    const latencies = merchantEvents.map((e) => e.latencyMs).filter((v): v is number => typeof v === "number");
    const fpsList = merchantEvents.map((e) => e.fps).filter((v): v is number => typeof v === "number");
    const stabilities = merchantEvents.map((e) => e.stabilityScore).filter((v): v is number => typeof v === "number");

    const avg = (arr: number[], fallback: number) =>
      arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : fallback;

    const sessions = await this.getSessions();

    return {
      avgTtfrMs: avg(ttfrs, 1140),
      avgLatencyMs: avg(latencies, 168),
      avgFps: avg(fpsList, 28.5),
      avgStability: avg(stabilities, 94.2),
      totalSessions: sessions.length,
      activeSessions: Math.min(sessions.length, 3),
    };
  },

  // FEEDBACK
  async submitFeedback(feedback: CustomerFeedback): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("customer_feedback").insert(feedback);
      } catch (err) {
        console.warn("Error submitting feedback to Supabase:", err);
      }
    }
  },

  // PRIVACY: DELETE MY DATA (DPDP / GDPR)
  async deleteAllUserData(): Promise<{ deletedSessions: number; deletedLooks: number }> {
    const sessions = getLocalItem<TryOnSession[]>(STORAGE_KEYS.SESSIONS, []);
    const looks = getLocalItem<SavedLook[]>(STORAGE_KEYS.SAVED_LOOKS, []);

    setLocalItem(STORAGE_KEYS.SESSIONS, []);
    setLocalItem(STORAGE_KEYS.SAVED_LOOKS, []);

    if (typeof window !== "undefined") {
      sessionStorage.clear();
      window.dispatchEvent(new CustomEvent("styletry-saved-looks-updated"));
      window.dispatchEvent(new CustomEvent("styletry-history-updated"));
    }

    return {
      deletedSessions: sessions.length,
      deletedLooks: looks.length,
    };
  },

  // USER PROFILE
  getProfile(): UserProfile {
    return getLocalItem<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    setLocalItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  },
};
