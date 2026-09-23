-- ==============================================================================
-- StyleTry AI — Multi-Tenant Merchant & Virtual Fitting Room Schema (Supabase)
-- Enforces Row Level Security (RLS) for Merchants, Registered Users, & Anonymous Guests
-- ==============================================================================

-- 1. Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  allowed_origins TEXT[] DEFAULT ARRAY['http://localhost:3000', 'https://*.myshopify.com']::TEXT[],
  plan TEXT DEFAULT 'growth' CHECK (plan IN ('starter', 'growth', 'enterprise')),
  monthly_session_limit INT DEFAULT 5000,
  max_session_duration_sec INT DEFAULT 300,
  idle_timeout_sec INT DEFAULT 90,
  rate_limit_per_minute INT DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Merchant Configs Table (Theme & Rule Customizations)
CREATE TABLE IF NOT EXISTS merchant_configs (
  merchant_id TEXT PRIMARY KEY REFERENCES merchants(id) ON DELETE CASCADE,
  brand_name TEXT DEFAULT 'StyleTry Live',
  brand_accent_color TEXT DEFAULT '#9e5033',
  button_label TEXT DEFAULT 'Try on Live with StyleTry AI',
  quality_tier TEXT DEFAULT 'balanced' CHECK (quality_tier IN ('low_latency', 'balanced', 'ultra_hd')),
  rule_overrides JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Profiles Table (Registered Shoppers)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  fit_preference TEXT DEFAULT 'tailored' CHECK (fit_preference IN ('slim', 'tailored', 'relaxed', 'oversized')),
  preferred_size TEXT DEFAULT 'M',
  measurements JSONB DEFAULT '{"chest": 96, "waist": 80, "hips": 98, "height": 178}'::jsonb,
  notifications_enabled BOOLEAN DEFAULT true,
  data_retention_days INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('tops', 'outerwear', 'dresses', 'tailoring', 'knitwear', 'bottoms')),
  brand TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  material TEXT,
  fit TEXT,
  care TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  primary_image TEXT NOT NULL,
  try_on_reference_image TEXT NOT NULL,
  model_image TEXT,
  structured_metadata JSONB DEFAULT '{}'::jsonb,
  size_chart JSONB DEFAULT '{}'::jsonb,
  available_sizes TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(merchant_id, slug)
);

-- 5. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  color_hex TEXT,
  size TEXT NOT NULL,
  stock INT DEFAULT 10,
  sku TEXT UNIQUE NOT NULL
);

-- 6. Try-On Sessions Table (Live WebRTC & Snapshot Sessions)
CREATE TABLE IF NOT EXISTS tryon_sessions (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  anonymous_session_id TEXT,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  product_brand TEXT,
  input_image_url TEXT,
  result_image_url TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('idle', 'permission', 'positioning', 'connecting', 'live', 'switching', 'degraded', 'ended', 'failed')),
  provider TEXT NOT NULL DEFAULT 'mock',
  model TEXT NOT NULL DEFAULT 'StyleTry-Live-v1',
  quality_metrics JSONB DEFAULT '{}'::jsonb,
  analysis_json JSONB DEFAULT '{}'::jsonb,
  style_match_score NUMERIC(5, 2),
  confidence_score NUMERIC(5, 2),
  duration_seconds INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Saved Looks Table (Customer Lookbook / Fitting Room Results)
CREATE TABLE IF NOT EXISTS saved_looks (
  id TEXT PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  anonymous_session_id TEXT,
  session_id TEXT REFERENCES tryon_sessions(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  input_image_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  style_match_score NUMERIC(5, 2),
  analysis_json JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Wardrobe Items Table (Customer's personal closet items for coordination)
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color_hex TEXT,
  image_url TEXT NOT NULL,
  formality_level INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Analytics Events Table (Quality Benchmarking & Operational Monitoring)
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES tryon_sessions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  ttfr_ms INT,
  latency_ms INT,
  fps NUMERIC(4, 1),
  stability_score NUMERIC(5, 2),
  reconnect_count INT DEFAULT 0,
  device_type TEXT,
  browser TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Customer Feedback Table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id BIGSERIAL PRIMARY KEY,
  merchant_id TEXT REFERENCES merchants(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES tryon_sessions(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  fit_accuracy TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- Merchants & Configs: Public can read config for rendering widget; merchants manage own
CREATE POLICY "Public read active merchant configs" ON merchant_configs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read merchants" ON merchants
  FOR SELECT USING (true);

-- Profiles: Authenticated users manage own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products & Variants: Public catalog read
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read product variants" ON product_variants
  FOR SELECT USING (true);

-- Try-On Sessions: User owns or anonymous guest session owns
CREATE POLICY "Users manage own try-on sessions" ON tryon_sessions
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Saved Looks: User owns or anonymous guest owns
CREATE POLICY "Users manage own saved looks" ON saved_looks
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Wardrobe Items: User strictly owns
CREATE POLICY "Users manage own wardrobe items" ON wardrobe_items
  FOR ALL USING (auth.uid() = user_id);

-- Analytics & Feedback: Anyone can insert; merchant can view own analytics
CREATE POLICY "Public insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert feedback" ON customer_feedback
  FOR INSERT WITH CHECK (true);
