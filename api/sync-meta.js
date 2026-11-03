// api/sync-meta.js
// Vercel Serverless Function: Real-time synchronization with Meta Graph API v21.0
// Fetches live campaigns, adsets, and today's insights, assembles hierarchical data, and upserts to Supabase.

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

  // ACTION 0: TEST CONNECTION (SERVER-SIDE BYPASS BROWSER ADBLOCKERS)
  if (action === 'test_meta') {
    if (!META_TOKEN || !AD_ACCOUNT_ID) {
      return res.status(400).json({ success: false, error: 'Token atau Ad Account ID tidak lengkap.' });
    }
    try {
      const testUrl = `https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}?fields=name,account_status,currency,amount_spent,timezone_name&access_token=${META_TOKEN}`;
      const metaRes = await fetch(testUrl);
      const data = await metaRes.json();
      if (data.error) {
        return res.status(400).json({ success: false, error: data.error.message });
      }
      return res.status(200).json({
        success: true,
        accountName: data.name,
        currency: data.currency,
        account_status: data.account_status,
        timezone: data.timezone_name
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ACTION 1: TOGGLE CAMPAIGN STATUS (PAUSE / ACTIVATE DIRECTLY ON META)
  if (action === 'toggle_campaign_status') {
    const { campaignId, newStatus } = body;
    if (!campaignId || !newStatus) {
      return res.status(400).json({ error: 'Missing campaignId or newStatus' });
    }

    try {
      if (META_TOKEN && !campaignId.startsWith('cmp_')) {
        // Call real Meta Graph API v21.0 to update status
        const updateUrl = `https://graph.facebook.com/v21.0/${campaignId}?status=${newStatus}&access_token=${META_TOKEN}`;
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
    let rawCampaigns = [];
    let rawAdsets = [];

    // 1. If Meta credentials are provided, call Meta Graph API v21.0
    if (META_TOKEN && AD_ACCOUNT_ID) {
      // 1A. Fetch Campaign Objects
      const campUrl = `https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${META_TOKEN}&limit=50`;
      const campRes = await fetch(campUrl);
      const campJson = await campRes.json();

      if (campJson.data && Array.isArray(campJson.data)) {
        rawCampaigns = campJson.data;
      }

      // 1B. Fetch Adsets
      try {
        const adsetUrl = `https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/adsets?fields=id,campaign_id,name,status,effective_status,daily_budget,lifetime_budget&access_token=${META_TOKEN}&limit=100`;
        const adsetRes = await fetch(adsetUrl);
        const adsetJson = await adsetRes.json();
        if (adsetJson.data && Array.isArray(adsetJson.data)) {
          rawAdsets = adsetJson.data;
        }
      } catch (e) {
        console.warn('Adsets fetch warning:', e);
      }

      // 1C. Fetch Today's Insights per AdSet
      try {
        const insightsUrl = `https://graph.facebook.com/v21.0/${AD_ACCOUNT_ID}/insights?fields=campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,actions,action_values&date_preset=today&level=adset&access_token=${META_TOKEN}&limit=100`;
        const metaResponse = await fetch(insightsUrl);
        const metaJson = await metaResponse.json();

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
              return found ? parseFloat(found.value) : 0;
            };

            const purchases = getActionCount('purchase') || getActionCount('omni_purchase') || 0;
            const revenue = getActionValue('purchase') || getActionValue('omni_purchase') || 0;

            return {
              campaign_id: item.campaign_id,
              campaign_name: item.campaign_name,
              adset_id: item.adset_id,
              adset_name: item.adset_name,
              spend: parseFloat(item.spend || 0),
              impressions: parseInt(item.impressions || 0, 10),
              clicks: parseInt(item.clicks || 0, 10),
              reach: parseInt(item.reach || 0, 10),
              frequency: parseFloat(item.frequency || 1.0),
              lpv: getActionCount('landing_page_view'),
              atc: getActionCount('add_to_cart'),
              ic: getActionCount('initiate_checkout'),
              purchases,
              revenue
            };
          });
        }
      } catch (e) {
        console.warn('Insights fetch warning:', e);
      }
    }

    // 2. Assemble Full Hierarchical Campaign Objects
    const assembledCampaigns = rawCampaigns.map(camp => {
      let stage = 'test';
      const lowerName = (camp.name || '').toLowerCase();
      if (lowerName.includes('scale 2') || lowerName.includes('scale2') || lowerName.includes('tahap 3')) {
        stage = 'scale2';
      } else if (lowerName.includes('scale 1') || lowerName.includes('scale1') || lowerName.includes('scale') || lowerName.includes('tahap 2')) {
        stage = 'scale1';
      } else {
        stage = 'test';
      }

      const matchingAdsets = rawAdsets.filter(a => a.campaign_id === camp.id);
      let adsetsList = [];

      if (matchingAdsets.length > 0) {
        adsetsList = matchingAdsets.map(a => {
          const m = metricsData.find(item => item.adset_id === a.id) || {};
          return {
            id: a.id,
            meta_adset_id: a.id,
            name: a.name || `AdSet ${a.id}`,
            status: a.status || (a.effective_status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED'),
            daily_budget: a.daily_budget ? parseFloat(a.daily_budget) : (camp.daily_budget ? parseFloat(camp.daily_budget) : 0),
            metrics: {
              spend: Number(m.spend || 0),
              impressions: Number(m.impressions || 0),
              clicks: Number(m.clicks || 0),
              lpv: Number(m.lpv || 0),
              atc: Number(m.atc || 0),
              ic: Number(m.ic || 0),
              purchases: Number(m.purchases || 0),
              revenue: Number(m.revenue || 0),
              reach: Number(m.reach || 0),
              frequency: Number(m.frequency || 1.0)
            }
          };
        });
      } else {
        const m = metricsData.find(item => item.campaign_id === camp.id) || {};
        adsetsList = [{
          id: `adset_${camp.id}`,
          meta_adset_id: `adset_${camp.id}`,
          name: `${camp.name} - AdSet Utama`,
          status: (camp.status === 'ACTIVE' || camp.effective_status === 'ACTIVE') ? 'ACTIVE' : 'PAUSED',
          daily_budget: camp.daily_budget ? parseFloat(camp.daily_budget) : 0,
          metrics: {
            spend: Number(m.spend || 0),
            impressions: Number(m.impressions || 0),
            clicks: Number(m.clicks || 0),
            lpv: Number(m.lpv || 0),
            atc: Number(m.atc || 0),
            ic: Number(m.ic || 0),
            purchases: Number(m.purchases || 0),
            revenue: Number(m.revenue || 0),
            reach: Number(m.reach || 0),
            frequency: Number(m.frequency || 1.0)
          }
        }];
      }

      return {
        id: camp.id,
        meta_campaign_id: camp.id,
        name: camp.name,
        status: stage,
        meta_status: camp.status || camp.effective_status || 'ACTIVE',
        effective_status: camp.effective_status || camp.status || 'ACTIVE',
        objective: camp.objective || 'OUTCOME_SALES',
        daily_budget: camp.daily_budget ? parseFloat(camp.daily_budget) : (camp.lifetime_budget ? parseFloat(camp.lifetime_budget) : 500000),
        base_price: 150000,
        cogs: 50000,
        created_at: camp.start_time || new Date().toISOString(),
        adsets: adsetsList
      };
    });

    // 3. Optional Supabase Upsert
    if (SUPABASE_URL && SUPABASE_KEY && assembledCampaigns.length > 0) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        for (const camp of assembledCampaigns) {
          let campDbId = null;
          const { data: existingCamp } = await supabase
            .from('campaigns')
            .select('id')
            .eq('meta_campaign_id', camp.meta_campaign_id)
            .maybeSingle();

          if (existingCamp) {
            campDbId = existingCamp.id;
            await supabase.from('campaigns').update({
              name: camp.name,
              daily_budget: camp.daily_budget,
              updated_at: new Date().toISOString()
            }).eq('id', campDbId);
          } else {
            campDbId = crypto.randomUUID();
            await supabase.from('campaigns').insert([{
              id: campDbId,
              name: camp.name,
              meta_campaign_id: camp.meta_campaign_id,
              status: camp.status,
              daily_budget: camp.daily_budget,
              base_price: camp.base_price,
              cogs: camp.cogs
            }]);
          }

          for (const ad of camp.adsets) {
            let adsetDbId = null;
            const { data: existingAdset } = await supabase
              .from('adsets')
              .select('id')
              .eq('meta_adset_id', ad.meta_adset_id)
              .maybeSingle();

            if (existingAdset) {
              adsetDbId = existingAdset.id;
              await supabase.from('adsets').update({
                name: ad.name,
                status: ad.status,
                daily_budget: ad.daily_budget,
                updated_at: new Date().toISOString()
              }).eq('id', adsetDbId);
            } else {
              adsetDbId = crypto.randomUUID();
              await supabase.from('adsets').insert([{
                id: adsetDbId,
                campaign_id: campDbId,
                meta_adset_id: ad.meta_adset_id,
                name: ad.name,
                status: ad.status,
                daily_budget: ad.daily_budget
              }]);
            }

            await supabase.from('daily_metrics').upsert({
              adset_id: adsetDbId,
              date: today,
              spend: ad.metrics.spend,
              impressions: ad.metrics.impressions,
              clicks: ad.metrics.clicks,
              lpv: ad.metrics.lpv,
              atc: ad.metrics.atc,
              ic: ad.metrics.ic,
              purchases: ad.metrics.purchases,
              revenue: ad.metrics.revenue,
              reach: ad.metrics.reach,
              frequency: ad.metrics.frequency,
              updated_at: new Date().toISOString()
            }, { onConflict: 'adset_id,date' });
          }
        }
      } catch (dbErr) {
        console.warn('Supabase upsert warning:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      mode: META_TOKEN ? 'LIVE_META_API (v21.0)' : 'OFFLINE',
      account_id: AD_ACCOUNT_ID,
      recordsProcessed: metricsData.length,
      campaigns: assembledCampaigns,
      metrics: metricsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      mode: 'ERROR'
    });
  }
}
