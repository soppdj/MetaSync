// src/utils/mockData.js
// Realistic Initial State / Demo Data for FatherLab Meta Ads

export const INITIAL_CAMPAIGNS = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'TEST - Anti-Acne Clarifying Serum 30ml',
    base_price: 149000,
    cogs: 38000,
    status: 'test',
    meta_campaign_id: 'cmp_test_8819201',
    daily_budget: 500000,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    adsets: [
      {
        id: 'b1111111-0001-0000-0000-000000000001',
        name: 'Angle 1 - Dokter SpKK Testimonial (Broad)',
        meta_adset_id: 'adset_test_01',
        status: 'ACTIVE',
        daily_budget: 250000,
        metrics: {
          spend: 250000,
          impressions: 9800,
          clicks: 265,
          lpv: 220,
          atc: 92,
          ic: 31,
          purchases: 26,
          revenue: 3874000,
          reach: 7200,
          frequency: 1.36
        }
      },
      {
        id: 'b1111111-0002-0000-0000-000000000002',
        name: 'Angle 2 - Painful Breakout Solution (Interest Skincare)',
        meta_adset_id: 'adset_test_02',
        status: 'ACTIVE',
        daily_budget: 250000,
        metrics: {
          spend: 250000,
          impressions: 5200,
          clicks: 72,
          lpv: 45,
          atc: 12,
          ic: 4,
          purchases: 2,
          revenue: 298000,
          reach: 4400,
          frequency: 1.18
        }
      }
    ]
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    name: 'SCALE 1 - Alpha Masculine Eau De Parfum 50ml',
    base_price: 249000,
    cogs: 55000,
    status: 'scale1',
    meta_campaign_id: 'cmp_scale1_9918234',
    daily_budget: 2500000,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    adsets: [
      {
        id: 'b2222222-0001-0000-0000-000000000001',
        name: 'LLA 1% Purchase 180 Days (Indo Tier 1)',
        meta_adset_id: 'adset_scale1_01',
        status: 'ACTIVE',
        daily_budget: 1250000,
        metrics: {
          spend: 1250000,
          impressions: 46000,
          clicks: 1210,
          lpv: 1020,
          atc: 430,
          ic: 145,
          purchases: 122,
          revenue: 30378000,
          reach: 35000,
          frequency: 1.31
        }
      },
      {
        id: 'b2222222-0002-0000-0000-000000000002',
        name: 'Stack Interest - Luxury Watch & Grooming',
        meta_adset_id: 'adset_scale1_02',
        status: 'ACTIVE',
        daily_budget: 1250000,
        metrics: {
          spend: 1250000,
          impressions: 41000,
          clicks: 980,
          lpv: 810,
          atc: 335,
          ic: 110,
          purchases: 88,
          revenue: 21912000,
          reach: 31000,
          frequency: 1.32
        }
      }
    ]
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: 'SCALE 2 - Deep Exfoliating Back Soap Bar',
    base_price: 99000,
    cogs: 21000,
    status: 'scale2',
    meta_campaign_id: 'cmp_scale2_7726315',
    daily_budget: 7500000,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    adsets: [
      {
        id: 'b3333333-0001-0000-0000-000000000001',
        name: 'CBO - Winning Advantage+ Audience All Gender 21-45',
        meta_adset_id: 'adset_scale2_01',
        status: 'ACTIVE',
        daily_budget: 5000000,
        metrics: {
          spend: 5000000,
          impressions: 178000,
          clicks: 4820,
          lpv: 4100,
          atc: 1720,
          ic: 550,
          purchases: 465,
          revenue: 46035000,
          reach: 128000,
          frequency: 1.39
        }
      },
      {
        id: 'b3333333-0002-0000-0000-000000000002',
        name: 'Retargeting 30 Days (ATC & IC Non-Buyer)',
        meta_adset_id: 'adset_scale2_02',
        status: 'ACTIVE',
        daily_budget: 2500000,
        metrics: {
          spend: 2500000,
          impressions: 89000,
          clicks: 2650,
          lpv: 2280,
          atc: 980,
          ic: 320,
          purchases: 275,
          revenue: 27225000,
          reach: 62000,
          frequency: 1.43
        }
      }
    ]
  }
];

export const INITIAL_CREATIVE_ASSETS = [
  {
    id: 'c1111111-0001-0000-0000-000000000001',
    adset_name: 'Angle 1 - Dokter SpKK Testimonial',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    headline: 'Bekas Jerawat Hitam Hilang dalam 14 Hari',
    primary_text: 'Rahasia formulasi Niacinamide 10% + Tranexamic Acid murni tanpa efek purging perih.',
    total_spend: 750000,
    total_clicks: 2850,
    total_impressions: 95000,
    total_purchases: 68
  },
  {
    id: 'c2222222-0002-0000-0000-000000000002',
    adset_name: 'LLA 1% Purchase 180 Days',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
    headline: 'Aroma Mewah Pria Karismatik Tahan 18 Jam',
    primary_text: 'Kombinasi Bergamot Calabrian, Amberwood, & Warm Tonka yang bikin wanita menoleh 2x.',
    total_spend: 2800000,
    total_clicks: 7600,
    total_impressions: 290000,
    total_purchases: 172
  },
  {
    id: 'c3333333-0003-0000-0000-000000000003',
    adset_name: 'CBO - Winning Advantage+',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1608248597359-0092d64024b8?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1608248597359-0092d64024b8?auto=format&fit=crop&w=400&q=80',
    headline: 'Punggung Mulus Bebas Jerawat Sebelum Liburan Pantai',
    primary_text: 'Sabun batang sulfur aktif 5% dengan scrub walnut halus yang rontokkan komedo punggung seketika.',
    total_spend: 4200000,
    total_clicks: 9800,
    total_impressions: 380000,
    total_purchases: 390
  },
  {
    id: 'c4444444-0004-0000-0000-000000000004',
    adset_name: 'Angle 2 - Painful Breakout Solution',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    thumbnail_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    headline: 'Promo Bundling Beli 1 Gratis 1 Terbatas Hari Ini',
    primary_text: 'Khusus 50 pembeli pertama checkout sekarang berhak mendapatkan voucher gratis ongkir.',
    total_spend: 650000,
    total_clicks: 580,
    total_impressions: 55000,
    total_purchases: 5
  }
];

export const HISTORICAL_CHART_DATA = [
  { date: '23 Okt', spend: 6200000, revenue: 78000000, netProfit: 46800000, roas: 12.58, cpr: 11200 },
  { date: '24 Okt', spend: 6800000, revenue: 84500000, netProfit: 51200000, roas: 12.42, cpr: 11050 },
  { date: '25 Okt', spend: 7100000, revenue: 91200000, netProfit: 55800000, roas: 12.84, cpr: 10800 },
  { date: '26 Okt', spend: 7400000, revenue: 96000000, netProfit: 58900000, roas: 12.97, cpr: 10600 },
  { date: '27 Okt', spend: 7900000, revenue: 102400000, netProfit: 62400000, roas: 12.96, cpr: 10550 },
  { date: '28 Okt', spend: 8100000, revenue: 105800000, netProfit: 64500000, roas: 13.06, cpr: 10400 },
  { date: 'Hari Ini', spend: 10500000, revenue: 109447000, netProfit: 67200000, roas: 10.42, cpr: 10800 },
];
