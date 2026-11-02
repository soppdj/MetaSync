-- ==============================================================================
-- METASYNC BY FATHERLAB - SUPABASE DATABASE SCHEMA
-- PostgreSQL schema for Meta Ads Management, Analytics & Creative Studio
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Single / Private User Profile for MetaSync)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT DEFAULT 'FatherLab Media Buyer',
    avatar_url TEXT,
    telegram_chat_id TEXT,
    meta_ad_account_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CAMPAIGNS TABLE
-- Status: 'test', 'scale1', 'scale2', 'paused'
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    base_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- Harga Jual Item (IDR)
    cogs NUMERIC(15, 2) NOT NULL DEFAULT 0.00,       -- HPP / Cost of Goods Sold (IDR)
    status TEXT NOT NULL CHECK (status IN ('test', 'scale1', 'scale2', 'paused', 'completed')) DEFAULT 'test',
    meta_campaign_id TEXT UNIQUE,
    objective TEXT DEFAULT 'OUTCOME_SALES',
    daily_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADSETS TABLE
-- Status: 'ACTIVE', 'PAUSED', 'ARCHIVED'
CREATE TABLE IF NOT EXISTS public.adsets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    meta_adset_id TEXT UNIQUE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    targeting_summary TEXT,
    bid_amount NUMERIC(15, 2) DEFAULT 0.00,
    daily_budget NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. DAILY METRICS TABLE (For historical charts, KPI engine, and reports)
CREATE TABLE IF NOT EXISTS public.daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adset_id UUID NOT NULL REFERENCES public.adsets(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    spend NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    impressions BIGINT NOT NULL DEFAULT 0,
    clicks BIGINT NOT NULL DEFAULT 0,
    lpv BIGINT NOT NULL DEFAULT 0,          -- Landing Page Views
    atc BIGINT NOT NULL DEFAULT 0,          -- Add To Cart
    ic BIGINT NOT NULL DEFAULT 0,           -- Initiate Checkout
    purchases BIGINT NOT NULL DEFAULT 0,    -- Total Completed Purchases
    revenue NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    reach BIGINT DEFAULT 0,
    frequency NUMERIC(6, 2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_adset_date UNIQUE (adset_id, date)
);

-- 5. CREATIVE ASSETS TABLE (For Creative Leaderboard)
CREATE TABLE IF NOT EXISTS public.creative_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adset_id UUID REFERENCES public.adsets(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    headline TEXT,
    primary_text TEXT,
    total_spend NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_clicks BIGINT NOT NULL DEFAULT 0,
    total_impressions BIGINT NOT NULL DEFAULT 0,
    total_purchases BIGINT NOT NULL DEFAULT 0,
    meta_creative_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. HYPNOWRITING LOGS TABLE (For AI Content Studio / Hypnowriting)
CREATE TABLE IF NOT EXISTS public.hypnowriting_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    prompt_context JSONB NOT NULL DEFAULT '{}'::jsonb, -- Includes product name, USP, target audience, angle
    generated_text TEXT NOT NULL,
    framework TEXT,                                    -- 'PAS', 'BAB', 'AIDA', 'Epiphany Bridge', '4U', or 'All 5'
    rating INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legacy alias table for backward compatibility
CREATE TABLE IF NOT EXISTS public.copywriting_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    prompt_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_text TEXT NOT NULL,
    framework TEXT,
    rating INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_adsets_campaign_id ON public.adsets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_adset_date ON public.daily_metrics(adset_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_creative_assets_adset ON public.creative_assets(adset_id);
CREATE INDEX IF NOT EXISTS idx_hypnowriting_campaign ON public.hypnowriting_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_copywriting_campaign ON public.copywriting_logs(campaign_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypnowriting_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copywriting_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users and public key (for desktop single-user setup) full access
CREATE POLICY "Full access for authenticated users" ON public.users FOR ALL USING (true);
CREATE POLICY "Full access for authenticated users" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Full access for authenticated users" ON public.adsets FOR ALL USING (true);
CREATE POLICY "Full access for authenticated users" ON public.daily_metrics FOR ALL USING (true);
CREATE POLICY "Full access for authenticated users" ON public.creative_assets FOR ALL USING (true);
CREATE POLICY "Full access for authenticated users" ON public.hypnowriting_logs FOR ALL USING (true);
CREATE POLICY "Full access for authenticated users" ON public.copywriting_logs FOR ALL USING (true);

-- Enable Realtime for Campaigns, Adsets, Daily Metrics
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.adsets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_metrics;
