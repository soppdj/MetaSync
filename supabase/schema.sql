-- ==============================================================================
-- METASYNC BY FATHERLAB - MASTER SUPABASE DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ (Supabase Official)
-- Keterangan: Skema lengkap untuk manajemen iklan Meta Ads, metrik real-time,
-- analitik telemetri, creative leaderboard, content studio, dan ledger laporan.
-- Siap dijalankan langsung di Supabase Dashboard -> SQL Editor.
-- ==============================================================================

-- 0. AKTIFKAN EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABEL: USERS & PROFIL PENGGUNA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT DEFAULT 'FatherLab Media Buyer',
    avatar_url TEXT,
    telegram_chat_id TEXT,
    meta_ad_account_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABEL: CAMPAIGNS (KAMPANYE IKLAN & HARGA PRODUK)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    base_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,  -- Harga Jual Produk (IDR)
    cogs NUMERIC(15, 2) NOT NULL DEFAULT 0.00,        -- HPP Produk (IDR)
    status TEXT NOT NULL CHECK (status IN ('test', 'scale1', 'scale2', 'paused', 'completed')) DEFAULT 'test',
    meta_campaign_id TEXT UNIQUE,
    objective TEXT DEFAULT 'OUTCOME_SALES',
    daily_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABEL: ADSETS (GRUP IKLAN META)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.adsets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    meta_adset_id TEXT UNIQUE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    targeting_summary TEXT,
    bid_amount NUMERIC(15, 2) DEFAULT 0.00,
    daily_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABEL: DAILY_METRICS (METRIK HARIAN & TELEMETRI REAL-TIME)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adset_id UUID NOT NULL REFERENCES public.adsets(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    spend NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    lpv BIGINT NOT NULL DEFAULT 0,          -- Landing Page Views
    atc BIGINT NOT NULL DEFAULT 0,          -- Add To Cart
    ic BIGINT NOT NULL DEFAULT 0,           -- Initiate Checkout
    purchases BIGINT NOT NULL DEFAULT 0,    -- Total Purchases / Conversions
    revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reach BIGINT DEFAULT 0,
    frequency NUMERIC(6, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_adset_date UNIQUE (adset_id, date)
);

-- ==============================================================================
-- 5. TABEL: CREATIVE_ASSETS (CREATIVE LEADERBOARD)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.creative_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adset_id UUID REFERENCES public.adsets(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT,
    thumbnail_url TEXT,
    headline TEXT,
    primary_text TEXT,
    total_spend NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_clicks BIGINT NOT NULL DEFAULT 0,
    total_impressions BIGINT NOT NULL DEFAULT 0,
    total_purchases BIGINT NOT NULL DEFAULT 0,
    meta_creative_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABEL: HYPNOWRITING_LOGS & COPYWRITING_LOGS (CONTENT STUDIO AI)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hypnowriting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    prompt_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_text TEXT NOT NULL,
    framework TEXT,
    rating INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.copywriting_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    prompt_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_text TEXT NOT NULL,
    framework TEXT,
    rating INT DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABEL: REPORT_LEDGER (BUKU BESAR FINANSIAL & LAPORAN HARIAN)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.report_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    ic INT DEFAULT 0,
    purchases INT DEFAULT 0,
    revenue NUMERIC(15, 2) DEFAULT 0.00,
    today_spent NUMERIC(15, 2) DEFAULT 0.00,
    nett_profit NUMERIC(15, 2) DEFAULT 0.00,
    roi NUMERIC(6, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABEL: SYSTEM_SETTINGS (PENGATURAN API & SISTEM)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. INDEKS PERFORMA QUERY CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_adsets_campaign_id ON public.adsets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_adset_date ON public.daily_metrics(adset_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_creative_assets_adset ON public.creative_assets(adset_id);
CREATE INDEX IF NOT EXISTS idx_hypnowriting_campaign ON public.hypnowriting_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_report_ledger_date ON public.report_ledger(date DESC);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) - PERMISIF UNTUK KUNCI ANON & AUTHENTICATED
-- ==============================================================================
-- Mengaktifkan RLS agar aman namun mengizinkan akses penuh untuk antarmuka web
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypnowriting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copywriting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Buat policy bebas (Full Access) untuk pengguna umum (anon) dan authenticated
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'campaigns', 'adsets', 'daily_metrics', 'creative_assets', 'hypnowriting_logs', 'copywriting_logs', 'report_ledger', 'system_settings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable full access for all users" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Enable full access for all users" ON public.%I FOR ALL TO public, anon, authenticated USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- 11. SUPABASE REALTIME REPLICATION (AKTIFKAN UNTUK TABEL UTAMA)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.adsets;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_metrics;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.report_ledger;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 12. PEMBERSIHAN OTOMATIS DATA SAMPLE / DUMMY (HANYA SISAKAN DATA REAL)
-- ==============================================================================
-- Menghapus data contoh/sample lama agar database hanya menyimpan data riil pengguna
DELETE FROM public.campaigns 
WHERE id IN ('c1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333')
   OR meta_campaign_id IN ('cmp_test_8819201', 'cmp_scale1_9918234', 'cmp_scale2_7726315')
   OR name ILIKE '%Anti-Acne Clarifying Serum%'
   OR name ILIKE '%Alpha Masculine Eau De Parfum%'
   OR name ILIKE '%Deep Exfoliating Back Soap Bar%';

-- ==============================================================================
-- SELESAI: Skema Master MetaSync Supabase Siap Digunakan (Murni Data Real)
-- ==============================================================================
