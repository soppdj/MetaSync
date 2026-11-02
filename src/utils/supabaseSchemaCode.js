// src/utils/supabaseSchemaCode.js
// Export string lengkap Schema SQL Supabase untuk disalin langsung di UI

export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- METASYNC BY FATHERLAB - MASTER SUPABASE DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ (Supabase Official)
-- ==============================================================================

-- 0. AKTIFKAN EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABEL: USERS
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

-- 2. TABEL: CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    base_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    cogs NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('test', 'scale1', 'scale2', 'paused', 'completed')) DEFAULT 'test',
    meta_campaign_id TEXT UNIQUE,
    objective TEXT DEFAULT 'OUTCOME_SALES',
    daily_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL: ADSETS
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

-- 4. TABEL: DAILY_METRICS
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adset_id UUID NOT NULL REFERENCES public.adsets(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    spend NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    lpv BIGINT NOT NULL DEFAULT 0,
    atc BIGINT NOT NULL DEFAULT 0,
    ic BIGINT NOT NULL DEFAULT 0,
    purchases BIGINT NOT NULL DEFAULT 0,
    revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reach BIGINT DEFAULT 0,
    frequency NUMERIC(6, 2) DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_adset_date UNIQUE (adset_id, date)
);

-- 5. TABEL: CREATIVE_ASSETS
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

-- 6. TABEL: HYPNOWRITING_LOGS & COPYWRITING_LOGS
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

-- 7. TABEL: REPORT_LEDGER
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

-- 8. TABEL: SYSTEM_SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INDEKS PERFORMA
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_adsets_campaign_id ON public.adsets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_adset_date ON public.daily_metrics(adset_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_creative_assets_adset ON public.creative_assets(adset_id);
CREATE INDEX IF NOT EXISTS idx_hypnowriting_campaign ON public.hypnowriting_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_report_ledger_date ON public.report_ledger(date DESC);

-- 10. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypnowriting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copywriting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

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

-- 11. SUPABASE REALTIME REPLICATION
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

-- 12. DATA SEED CONTOH KAMPANYE
INSERT INTO public.campaigns (id, name, base_price, cogs, status, meta_campaign_id, objective, daily_budget)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'TEST - Anti-Acne Clarifying Serum 30ml', 149000, 35000, 'test', 'cmp_test_8819201', 'OUTCOME_SALES', 500000),
    ('c2222222-2222-2222-2222-222222222222', 'SCALE 1 - Alpha Masculine Eau De Parfum 50ml', 249000, 52000, 'scale1', 'cmp_scale1_9918234', 'OUTCOME_SALES', 2500000),
    ('c3333333-3333-3333-3333-333333333333', 'SCALE 2 - Deep Exfoliating Back Soap Bar', 99000, 18000, 'scale2', 'cmp_scale2_7726315', 'OUTCOME_SALES', 7500000)
ON CONFLICT (id) DO UPDATE 
SET base_price = EXCLUDED.base_price, cogs = EXCLUDED.cogs;

INSERT INTO public.adsets (id, campaign_id, meta_adset_id, name, status, daily_budget)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'adset_test_01', 'Adset Broad - Skincare Indonesia 18-35', 'ACTIVE', 500000),
    ('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'adset_scale1_01', 'Adset Men Grooming & Lifestyle Big Cities', 'ACTIVE', 2500000),
    ('a3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'adset_scale2_01', 'Adset Body Care High Intent LAL 3%', 'ACTIVE', 7500000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.daily_metrics (adset_id, date, spend, impressions, clicks, lpv, atc, ic, purchases, revenue, reach, frequency)
VALUES
    ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE, 500000, 15000, 337, 265, 104, 35, 28, 4172000, 12500, 1.20),
    ('a2222222-2222-2222-2222-222222222222', CURRENT_DATE, 2500000, 87000, 2192, 1830, 765, 255, 210, 52290000, 71300, 1.22),
    ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE, 7500000, 260000, 7280, 6220, 2630, 847, 740, 73260000, 192500, 1.35)
ON CONFLICT (adset_id, date) DO UPDATE
SET spend = EXCLUDED.spend, purchases = EXCLUDED.purchases, revenue = EXCLUDED.revenue;
`;
