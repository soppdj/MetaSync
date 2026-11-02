// api/sync-meta.js
// Vercel Serverless Function: Real-time synchronization with Meta Graph API v20.0
// Fetches live campaigns, adsets, and today's insights, and upserts to Supabase.

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Allow POST and GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const action = body.action || 'sync';

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || body.supabaseUrl;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || body.supabaseKey;
  const META_TOKEN = body.metaToken || process.env.META_ACCESS_TOKEN;
  let AD_ACCOUNT_ID = body.metaAccount || process.env.META_AD_ACCOUNT_ID;

  if (AD_ACCOUNT_ID && !AD_ACCOUNT_ID.startsWith('act_')) {
    AD_ACCOUNT_ID = `act_${AD_ACCOUNT_ID}`;
  }

  // ACTION 1: TOGGLE CAMPAIGN STATUS (PAUSE / ACTIVATE DIRECTLY ON META)
  if (action === 'toggle_campaign_status') {
    const { campaignId, newStatus } = body;
    if (!campaignId || !newStatus) {
      return res.status(400).json({ error: 'Missing campaignId or newStatus' });
    }

    try {
      if (META_TOKEN && campaignId.startsWith('cmp_') === false) {
        // Call real Meta Graph API to update status
        const updateUrl = `https://graph.facebook.com/v20.0/${campaignId}?status=${newStatus}&access_token=${META_TOKEN}`;
        const updateRes = await fetch(updateUrl, { method: 'POST' });
        const updateJson = await updateRes.json();
        if (updateJson.error) {
          throw new Error(updateJson.error.message);
        }
      }

      return res.status(200).json({
        success: true,
        campaignId,
        newStatus,
        mode: META_TOKEN ? 'LIVE_META_API' : 'SIMULATED_LOCAL',
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  // ACTION 2: REAL-TIME SYNC
  const today = new Date().toISOString().split('T')[0];

  try {
    let metricsData = [];
    let liveCampaigns = [];

    // 1. If Meta credentials are provided, call Meta Graph API
    if (META_TOKEN && AD_ACCOUNT_ID) {
      // 1A. Fetch Campaign Objects (Status, Budget, Objective)
      const campUrl = `https://graph.facebook.com/v20.0/${AD_ACCOUNT_ID}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${META_TOKEN}&limit=50`;
      const campRes = await fetch(campUrl);
      const campJson = await campRes.json();

      if (campJson.data && Array.isArray(campJson.data)) {
        liveCampaigns = campJson.data.map(c => ({
          meta_campaign_id: c.id,
          name: c.name,
          status: c.status,
          effective_status: c.effective_status,
          objective: c.objective,
          daily_budget: c.daily_budget ? parseFloat(c.daily_budget) : 0,
        }));
      }

      // 1B. Fetch Today's Insights per AdSet
      const insightsUrl = `https://graph.facebook.com/v20.0/${AD_ACCOUNT_ID}/insights?fields=campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,actions,action_values&date_preset=today&level=adset&access_token=${META_TOKEN}&limit=100`;

      const metaResponse = await fetch(insightsUrl);
      const metaJson = await metaResponse.json();

      if (metaJson.error) {
        throw new Error(`Meta Graph API Error: ${metaJson.error.message}`);
      }

      if (metaJson.data && Array.isArray(metaJson.data)) {
        metricsData = metaJson.data.map(item => {
          const actions = item.actions || [];
          const actionValues = item.action_values || [];

          const getActionCount = (actionType) => {
            const found = actions.find(a => a.action_type === actionType);
            return found ? parseInt(found.value, 10) : 0;
          };

          const getActionValue = (actionType) => {
            const found = actionValues.find(a => a.action_type === actionType);
            return found ? parseFloat(found.value) : 0.0;
          };

          const lpv = getActionCount('landing_page_view');
          const atc = getActionCount('add_to_cart') || getActionCount('omni_add_to_cart');
          const ic = getActionCount('initiate_checkout') || getActionCount('omni_initiated_checkout');
          const purchases = getActionCount('purchase') || getActionCount('omni_purchase');
          const revenue = getActionValue('purchase') || getActionValue('omni_purchase');

          return {
            meta_adset_id: item.adset_id,
            meta_campaign_id: item.campaign_id,
            adset_name: item.adset_name,
            campaign_name: item.campaign_name,
            date: today,
            spend: parseFloat(item.spend || 0),
            impressions: parseInt(item.impressions || 0, 10),
            clicks: parseInt(item.clicks || 0, 10),
            reach: parseInt(item.reach || 0, 10),
            frequency: parseFloat(item.frequency || 1.0),
            cpc: parseFloat(item.cpc || 0),
            cpm: parseFloat(item.cpm || 0),
            ctr: parseFloat(item.ctr || 0),
            lpv,
            atc,
            ic,
            purchases,
            revenue
          };
        });
      }
    } else {
      // Dynamic live simulation mode with slight real-time traffic pulses
      const pulseClicks = Math.floor(Math.random() * 5);
      const pulseSpend = pulseClicks * 950;
      const pulsePurchases = Math.random() > 0.6 ? 1 : 0;
      const pulseRevenue = pulsePurchases * 149000;

      metricsData = [
        {
          meta_adset_id: 'adset_test_01',
          meta_campaign_id: 'cmp_test_8819201',
          date: today,
          spend: 250000.0 + pulseSpend,
          impressions: 9850 + pulseClicks * 35,
          clicks: 270 + pulseClicks,
          reach: 7250 + pulseClicks * 25,
          frequency: 1.36,
          lpv: 224 + Math.floor(pulseClicks * 0.8),
          atc: 94 + (pulsePurchases ? 2 : 0),
          ic: 32 + (pulsePurchases ? 1 : 0),
          purchases: 27 + pulsePurchases,
          revenue: 4023000.0 + pulseRevenue
        },
        {
          meta_adset_id: 'adset_test_02',
          meta_campaign_id: 'cmp_test_8819201',
          date: today,
          spend: 250000.0,
          impressions: 5100,
          clicks: 70,
          reach: 4300,
          frequency: 1.19,
          lpv: 44,
          atc: 11,
          ic: 4,
          purchases: 2,
          revenue: 298000.0
        },
        {
          meta_adset_id: 'adset_scale1_01',
          meta_campaign_id: 'cmp_scale1_9918234',
          date: today,
          spend: 1250000.0 + (pulseClicks * 1800),
          impressions: 46200 + (pulseClicks * 90),
          clicks: 1215 + (pulseClicks * 2),
          reach: 35200,
          frequency: 1.31,
          lpv: 1024,
          atc: 432,
          ic: 146,
          purchases: 123 + pulsePurchases,
          revenue: 30627000.0 + (pulsePurchases * 249000)
        },
        {
          meta_adset_id: 'adset_scale2_01',
          meta_campaign_id: 'cmp_scale2_7726315',
          date: today,
          spend: 7500000.0 + (pulseSpend * 4),
          impressions: 295000 + (pulseClicks * 500),
          clicks: 6800 + (pulseClicks * 10),
          reach: 180000,
          frequency: 1.64,
          lpv: 5750,
          atc: 2420,
          ic: 890,
          purchases: 742 + (pulsePurchases * 2),
          revenue: 73458000.0 + (pulsePurchases * 198000)
        }
      ];

      liveCampaigns = [
        {
          meta_campaign_id: 'cmp_test_8819201',
          name: 'TEST - Anti-Acne Clarifying Serum 30ml',
          status: 'ACTIVE',
          effective_status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: 500000
        },
        {
          meta_campaign_id: 'cmp_scale1_9918234',
          name: 'SCALE 1 - Alpha Masculine Eau De Parfum 50ml',
          status: 'ACTIVE',
          effective_status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: 2500000
        },
        {
          meta_campaign_id: 'cmp_scale2_7726315',
          name: 'SCALE 2 - Deep Exfoliating Back Soap Bar',
          status: 'ACTIVE',
          effective_status: 'ACTIVE',
          objective: 'OUTCOME_SALES',
          daily_budget: 7500000
        }
      ];
    }

    // 2. If Supabase credentials are configured, UPSERT into Supabase
    let upsertCount = 0;
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

      const { data: adsets, error: adsetError } = await supabase
        .from('adsets')
        .select('id, meta_adset_id, campaign_id');

      if (!adsetError && adsets && adsets.length > 0) {
        const adsetMap = new Map(adsets.map(a => [a.meta_adset_id, a.id]));

        const recordsToUpsert = [];
        for (const m of metricsData) {
          const internalAdsetId = adsetMap.get(m.meta_adset_id);
          if (internalAdsetId) {
            recordsToUpsert.push({
              adset_id: internalAdsetId,
              date: m.date,
              spend: m.spend,
              impressions: m.impressions,
              clicks: m.clicks,
              lpv: m.lpv,
              atc: m.atc,
              ic: m.ic,
              purchases: m.purchases,
              revenue: m.revenue,
              reach: m.reach,
              frequency: m.frequency,
              updated_at: new Date().toISOString()
            });
          }
        }

        if (recordsToUpsert.length > 0) {
          const { data: upserted, error: upsertErr } = await supabase
            .from('daily_metrics')
            .upsert(recordsToUpsert, { onConflict: 'adset_id,date' })
            .select();

          if (!upsertErr) {
            upsertCount = upserted?.length || recordsToUpsert.length;
          }
        }
      }
    }

    // Aggregate summary
    const totalSpend = metricsData.reduce((acc, m) => acc + (m.spend || 0), 0);
    const totalRevenue = metricsData.reduce((acc, m) => acc + (m.revenue || 0), 0);
    const totalPurchases = metricsData.reduce((acc, m) => acc + (m.purchases || 0), 0);
    const totalClicks = metricsData.reduce((acc, m) => acc + (m.clicks || 0), 0);
    const totalImpressions = metricsData.reduce((acc, m) => acc + (m.impressions || 0), 0);
    const overallRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const avgCpr = totalPurchases > 0 ? totalSpend / totalPurchases : 0;

    return res.status(200).json({
      success: true,
      mode: (META_TOKEN && AD_ACCOUNT_ID) ? 'LIVE_META_API' : 'SIMULATION_DEMO',
      account_id: AD_ACCOUNT_ID || 'act_fatherlab_demo_01',
      date: today,
      recordsProcessed: metricsData.length,
      recordsUpserted: upsertCount,
      summary: {
        totalSpend,
        totalRevenue,
        totalPurchases,
        totalClicks,
        totalImpressions,
        overallRoas,
        avgCpr
      },
      metrics: metricsData,
      liveCampaigns,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Sync Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
