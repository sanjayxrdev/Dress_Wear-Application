import { GarmentCategory, Product, SavedLook, TryOnSession, UserProfile } from "@/lib/types";
import { SEED_PRODUCTS } from "./seed-data";
import { isSupabaseConfigured, supabase } from "./supabase";

const STORAGE_KEYS = {
  WARDROBE: "fitted_saved_looks_v1",
  SESSIONS: "fitted_tryon_sessions_v1",
  PROFILE: "fitted_user_profile_v1",
};

const DEFAULT_PROFILE: UserProfile = {
  id: "usr_guest_curator",
  email: "guest.curator@fitted.editorial",
  name: "Editorial Guest",
  fitPreference: "tailored",
  preferredSize: "M",
  notificationsEnabled: true,
  tryOnDataRetentionDays: 30,
};

// Safe localStorage access for SSR
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
        });
      } catch (err) {
        console.warn("Supabase recordSession error:", err);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fitted-history-updated"));
    }
  },

  async getSessions(): Promise<TryOnSession[]> {
    return getLocalItem<TryOnSession[]>(STORAGE_KEYS.SESSIONS, []);
  },

  // WARDROBE (SAVED LOOKS)
  async saveLook(look: SavedLook): Promise<void> {
    const currentWardrobe = getLocalItem<SavedLook[]>(STORAGE_KEYS.WARDROBE, []);
    // Prevent duplicate saves of identical session/product
    const exists = currentWardrobe.some(
      (item) => item.sessionId === look.sessionId && item.productId === look.productId
    );
    if (!exists) {
      const updated = [look, ...currentWardrobe];
      setLocalItem(STORAGE_KEYS.WARDROBE, updated);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from("saved_looks").insert({
            id: look.id,
            session_id: look.sessionId,
            product_id: look.productId,
            product_name: look.productName,
            product_brand: look.productBrand,
            product_price: look.productPrice,
            category: look.category,
            input_image_url: look.inputImageUrl,
            result_image_url: look.resultImageUrl,
            notes: look.notes,
          });
        } catch (err) {
          console.warn("Supabase saveLook error:", err);
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("fitted-wardrobe-updated"));
      }
    }
  },

  async getSavedLooks(): Promise<SavedLook[]> {
    return getLocalItem<SavedLook[]>(STORAGE_KEYS.WARDROBE, []);
  },

  async removeSavedLook(id: string): Promise<void> {
    const current = getLocalItem<SavedLook[]>(STORAGE_KEYS.WARDROBE, []);
    const updated = current.filter((look) => look.id !== id);
    setLocalItem(STORAGE_KEYS.WARDROBE, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("saved_looks").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase removeSavedLook error:", err);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fitted-wardrobe-updated"));
    }
  },

  // PRIVACY: DELETE MY DATA
  async deleteAllUserData(): Promise<{ deletedSessions: number; deletedLooks: number }> {
    const sessions = getLocalItem<TryOnSession[]>(STORAGE_KEYS.SESSIONS, []);
    const looks = getLocalItem<SavedLook[]>(STORAGE_KEYS.WARDROBE, []);

    setLocalItem(STORAGE_KEYS.SESSIONS, []);
    setLocalItem(STORAGE_KEYS.WARDROBE, []);

    if (typeof window !== "undefined") {
      sessionStorage.clear();
      window.dispatchEvent(new CustomEvent("fitted-wardrobe-updated"));
      window.dispatchEvent(new CustomEvent("fitted-history-updated"));
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
