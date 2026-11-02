-- ==============================================================================
-- METASYNC BY FATHERLAB - SEED DATA
-- Sample realistic Indonesian E-commerce Meta Ads data
-- ==============================================================================

-- 1. Insert Initial User
INSERT INTO public.users (id, email, full_name, telegram_chat_id, meta_ad_account_id)
VALUES (
    'c0a80101-0000-0000-0000-000000000001',
    'media_buyer@fatherlab.id',
    'FatherLab Lead Media Buyer',
    '619284710',
    'act_102938475612'
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert Campaigns (TEST, SCALE 1, SCALE 2)
-- TEST Campaign
INSERT INTO public.campaigns (id, user_id, name, base_price, cogs, status, meta_campaign_id, daily_budget)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'c0a80101-0000-0000-0000-000000000001',
    'TEST - Anti-Acne Clarifying Serum 30ml',
    149000.00,  -- Harga Jual
    38000.00,   -- HPP / COGS
    'test',
    'cmp_test_8819201',
    500000.00
) ON CONFLICT (id) DO NOTHING;

-- SCALE 1 Campaign (Winning Adset & LLA Audience)
INSERT INTO public.campaigns (id, user_id, name, base_price, cogs, status, meta_campaign_id, daily_budget)
VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'c0a80101-0000-0000-0000-000000000001',
    'SCALE 1 - Alpha Masculine Eau De Parfum 50ml',
    249000.00,  -- Harga Jual
    55000.00,   -- HPP / COGS
    'scale1',
    'cmp_scale1_9918234',
    2500000.00
) ON CONFLICT (id) DO NOTHING;

-- SCALE 2 Campaign (Final Scale & Full Budget Injection)
INSERT INTO public.campaigns (id, user_id, name, base_price, cogs, status, meta_campaign_id, daily_budget)
VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'c0a80101-0000-0000-0000-000000000001',
    'SCALE 2 - Deep Exfoliating Back Soap Bar',
    99000.00,   -- Harga Jual
    21000.00,   -- HPP / COGS
    'scale2',
    'cmp_scale2_7726315',
    7500000.00
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert Adsets
-- Adsets for TEST Campaign
INSERT INTO public.adsets (id, campaign_id, meta_adset_id, name, status, daily_budget)
VALUES 
(
    'b1111111-0001-0000-0000-000000000001',
    'a1111111-1111-1111-1111-111111111111',
    'adset_test_01',
    'Angle 1 - Dokter SpKK Testimonial (Broad)',
    'ACTIVE',
    250000.00
),
(
    'b1111111-0002-0000-0000-000000000002',
    'a1111111-1111-1111-1111-111111111111',
    'adset_test_02',
    'Angle 2 - Painful Breakout Solution (Interest Skincare)',
    'ACTIVE',
    250000.00
) ON CONFLICT (id) DO NOTHING;

-- Adsets for SCALE 1 Campaign
INSERT INTO public.adsets (id, campaign_id, meta_adset_id, name, status, daily_budget)
VALUES 
(
    'b2222222-0001-0000-0000-000000000001',
    'a2222222-2222-2222-2222-222222222222',
    'adset_scale1_01',
    'LLA 1% Purchase 180 Days (Indo Tier 1)',
    'ACTIVE',
    1250000.00
),
(
    'b2222222-0002-0000-0000-000000000002',
    'a2222222-2222-2222-2222-222222222222',
    'adset_scale1_02',
    'Stack Interest - Luxury Watch & Grooming',
    'ACTIVE',
    1250000.00
) ON CONFLICT (id) DO NOTHING;

-- Adsets for SCALE 2 Campaign
INSERT INTO public.adsets (id, campaign_id, meta_adset_id, name, status, daily_budget)
VALUES 
(
    'b3333333-0001-0000-0000-000000000001',
    'a3333333-3333-3333-3333-333333333333',
    'adset_scale2_01',
    'CBO - Winning Advantage+ Audience All Gender 21-45',
    'ACTIVE',
    5000000.00
),
(
    'b3333333-0002-0000-0000-000000000002',
    'a3333333-3333-3333-3333-333333333333',
    'adset_scale2_02',
    'Retargeting 30 Days (ATC & IC Non-Buyer)',
    'ACTIVE',
    2500000.00
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert Daily Metrics (Today & Past 7 Days)
-- Data for TEST adset 1 (Great CTR, Low CPR -> WINNING -> Ready to auto-move to SCALE 1)
INSERT INTO public.daily_metrics (adset_id, date, spend, impressions, clicks, lpv, atc, ic, purchases, revenue, reach, frequency)
VALUES 
(
    'b1111111-0001-0000-0000-000000000001',
    CURRENT_DATE,
    250000.00,
    9800,
    265, -- CTR = 2.70% (> 2.0%)
    220, -- LC to LPV = 83% (> 80%)
    92,  -- LPV to ATC = 41.8% (> 40%)
    31,  -- ATC to IC = 33.7% (> 30%)
    26,  -- Closing Rate = 83.8% (> 82%) | CPR = Rp 9.615 (Target Rp 37.250) -> WINNER!
    3874000.00,
    7200,
    1.36
),
(
    'b1111111-0002-0000-0000-000000000002',
    CURRENT_DATE,
    250000.00,
    5200,
    72,  -- CTR = 1.38% (< 2.0%)
    45,  -- LC to LPV = 62.5% (< 80%)
    12,  -- LPV to ATC = 26.6% (< 40%)
    4,   -- ATC to IC = 33%
    2,   -- CPR = Rp 125.000 (Target 37.250) -> CANDIDATE FOR KILL BADGE!
    298000.00,
    4400,
    1.18
) ON CONFLICT (adset_id, date) DO NOTHING;

-- Data for SCALE 1 adsets
INSERT INTO public.daily_metrics (adset_id, date, spend, impressions, clicks, lpv, atc, ic, purchases, revenue, reach, frequency)
VALUES 
(
    'b2222222-0001-0000-0000-000000000001',
    CURRENT_DATE,
    1250000.00,
    46000,
    1210, -- CTR = 2.63%
    1020, -- LC to LPV = 84.3%
    430,  -- LPV to ATC = 42.1%
    145,  -- ATC to IC = 33.7%
    122,  -- CPR = Rp 10.245 (Target 25% x 249k = 62.250)
    30378000.00,
    35000,
    1.31
),
(
    'b2222222-0002-0000-0000-000000000002',
    CURRENT_DATE,
    1250000.00,
    41000,
    980,
    810,
    335,
    110,
    88,
    21912000.00,
    31000,
    1.32
) ON CONFLICT (adset_id, date) DO NOTHING;

-- Data for SCALE 2 adsets
INSERT INTO public.daily_metrics (adset_id, date, spend, impressions, clicks, lpv, atc, ic, purchases, revenue, reach, frequency)
VALUES 
(
    'b3333333-0001-0000-0000-000000000001',
    CURRENT_DATE,
    5000000.00,
    178000,
    4820,
    4100,
    1720,
    550,
    465,  -- CPR = Rp 10.752 (Target 25% x 99k = 24.750)
    46035000.00,
    128000,
    1.39
),
(
    'b3333333-0002-0000-0000-000000000002',
    CURRENT_DATE,
    2500000.00,
    89000,
    2650,
    2280,
    980,
    320,
    275,
    27225000.00,
    62000,
    1.43
) ON CONFLICT (adset_id, date) DO NOTHING;

-- 5. Insert Creative Assets (for Leaderboard)
INSERT INTO public.creative_assets (id, adset_id, type, url, thumbnail_url, headline, primary_text, total_spend, total_clicks, total_impressions, total_purchases)
VALUES 
(
    'c1111111-0001-0000-0000-000000000001',
    'b1111111-0001-0000-0000-000000000001',
    'video',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    'Bekas Jerawat Hitam Hilang dalam 14 Hari',
    'Rahasia formulasi Niacinamide 10% + Tranexamic Acid murni tanpa efek purging perih.',
    750000.00,
    2850,
    95000, -- CTR: 3.0%
    68     -- CPR: Rp 11.029 (Rank #1 Winner)
),
(
    'c2222222-0002-0000-0000-000000000002',
    'b2222222-0001-0000-0000-000000000001',
    'video',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
    'Aroma Mewah Pria Karismatik Tahan 18 Jam',
    'Kombinasi Bergamot Calabrian, Amberwood, & Warm Tonka yang bikin wanita menoleh 2x.',
    2800000.00,
    7600,
    290000, -- CTR: 2.62%
    172     -- CPR: Rp 16.279 (Rank #2 Winner)
),
(
    'c3333333-0003-0000-0000-000000000003',
    'b3333333-0001-0000-0000-000000000001',
    'image',
    'https://images.unsplash.com/photo-1608248597359-0092d64024b8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608248597359-0092d64024b8?auto=format&fit=crop&w=400&q=80',
    'Punggung Mulus Bebas Jerawat Sebelum Liburan Pantai',
    'Sabun batang sulfur aktif 5% dengan scrub walnut halus yang rontokkan komedo punggung seketika.',
    4200000.00,
    9800,
    380000, -- CTR: 2.57%
    390     -- CPR: Rp 10.769 (Rank #3)
),
(
    'c4444444-0004-0000-0000-000000000004',
    'b1111111-0002-0000-0000-000000000002',
    'image',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    'Promo Bundling Beli 1 Gratis 1 Terbatas Hari Ini',
    'Khusus 50 pembeli pertama checkout sekarang berhak mendapatkan voucher gratis ongkir.',
    650000.00,
    580,
    55000,  -- CTR: 1.05% (< 2.0%)
    5       -- CPR: Rp 130.000 (Low performer)
) ON CONFLICT (id) DO NOTHING;

-- 6. Insert Sample Copywriting Log
INSERT INTO public.copywriting_logs (id, campaign_id, prompt_context, generated_text, framework)
VALUES (
    'd1111111-0001-0000-0000-000000000001',
    'a1111111-1111-1111-1111-111111111111',
    '{"product": "Anti-Acne Clarifying Serum", "audience": "Pria & Wanita 20-35 tahun frustasi noda jerawat membandel", "usp": "Niacinamide 10% + Tranexamic 3% tanpa perih"}'::jsonb,
    '## 1. PAS (Problem-Agitate-Solution) + Pattern Interrupt Hook
**Hook**: *Stop tutupi bekas jerawat pakai concealer tebal tiap mau meeting kantor!*

**Problem**: Anda sudah habis jutaan rupiah coba berbagai serum viral, tapi noda hitam bekas jerawat masih nongkrong di pipi?
**Agitate**: Yang bikin frustasi, makin ditutupi makeup tebal, pori-pori makin tersumbat dan memicu jerawat batu baru yang lebih meradang. Rasa percaya diri turun drastis saat diajak video call mendadak tanpa filter.
**Solution**: Temukan FatherLab Clarifying Serum. Diformulasikan dengan Clinical-Grade Niacinamide 10% dan Tranexamic Acid 3%, bekerja memudarkan hiperpigmentasi langsung di sumber melanin tanpa rasa perih terbakar.',
    'PAS'
) ON CONFLICT (id) DO NOTHING;
