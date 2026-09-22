-- Fitted Virtual Try-On Supabase Schema with Row Level Security (RLS)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  fit_preference TEXT DEFAULT 'tailored',
  preferred_size TEXT DEFAULT 'M',
  notifications_enabled BOOLEAN DEFAULT true,
  data_retention_days INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT NOT NULL,
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
  available_sizes TEXT[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  color TEXT NOT NULL,
  color_hex TEXT,
  size TEXT NOT NULL,
  stock INT DEFAULT 10,
  sku TEXT UNIQUE NOT NULL
);

-- 4. Try-On Sessions Table
CREATE TABLE IF NOT EXISTS tryon_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  product_brand TEXT,
  input_image_url TEXT NOT NULL,
  result_image_url TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  stage TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  processing_time_ms INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Saved Looks (Wardrobe) Table
CREATE TABLE IF NOT EXISTS saved_looks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  session_id TEXT REFERENCES tryon_sessions(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  input_image_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryon_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_looks ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products: anyone can read active products (catalog is public)
CREATE POLICY "Public read active products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Public read product variants" ON product_variants
  FOR SELECT USING (true);

-- Try-On Sessions: users can only read and manage their own sessions
CREATE POLICY "Users can view own try-on sessions" ON tryon_sessions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert try-on sessions" ON tryon_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own try-on sessions" ON tryon_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Saved Looks: users can only manage their own wardrobe
CREATE POLICY "Users can view own saved looks" ON saved_looks
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert saved looks" ON saved_looks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own saved looks" ON saved_looks
  FOR DELETE USING (auth.uid() = user_id);
