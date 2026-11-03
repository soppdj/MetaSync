// src/utils/metaApi.js
// Direct Browser-to-Meta Graph API v21.0 Engine (With CORS Support & AdBlocker Fallback)
// Memungkinkan sinkronisasi langsung ke Meta Ads dan pembentukan struktur kampanye hierarkis lengkap

export async function fetchDirectMetaSync(token, accountId, supabaseClient = null) {
  if (!token || !accountId) {
    throw new Error('Access Token atau Ad Account ID belum diisi.');
  }

  let cleanAccount = accountId.trim();
  if (!cleanAccount.startsWith('act_')) {
    cleanAccount = `act_${cleanAccount}`;
  }
  const cleanToken = token.trim();

  let rawCampaigns = [];
  let rawAdsets = [];
  let rawInsights = [];

  // 1. Ambil Kampanye, AdSets, dan Insights dari Meta Graph API v21.0
  try {
    // 1A. Fetch Campaigns
    const campUrl = `https://graph.facebook.com/v21.0/${cleanAccount}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${cleanToken}&limit=50`;
    const campRes = await fetch(campUrl);
    const campJson = await campRes.json();

    if (campJson.error) {
      throw new Error(`Meta Graph API: ${campJson.error.message}`);
    }
    rawCampaigns = campJson.data || [];

    // 1B. Fetch AdSets
    try {
      const adsetUrl = `https://graph.facebook.com/v21.0/${cleanAccount}/adsets?fields=id,campaign_id,name,status,effective_status,daily_budget,lifetime_budget&access_token=${cleanToken}&limit=100`;
      const adsetRes = await fetch(adsetUrl);
      const adsetJson = await adsetRes.json();
      if (!adsetJson.error) {
        rawAdsets = adsetJson.data || [];
      }
    } catch (adsetErr) {
      console.warn('Gagal memuat adsets langsung, melanjutkan dengan fallback:', adsetErr);
    }

    // 1C. Fetch Today's Insights per AdSet
    try {
      const insightsUrl = `https://graph.facebook.com/v21.0/${cleanAccount}/insights?fields=campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,actions,action_values&date_preset=today&level=adset&access_token=${cleanToken}&limit=100`;
      const insightsRes = await fetch(insightsUrl);
      const insightsJson = await insightsRes.json();
      if (!insightsJson.error) {
        rawInsights = insightsJson.data || [];
      }
    } catch (insightErr) {
      console.warn('Gagal memuat insights langsung:', insightErr);
    }

  } catch (netErr) {
    // Browser AdBlocker atau CORS error -> Otomatis alihkan (relay) ke serverless backend
    console.warn('Direct fetch ke Meta Graph API diblokir browser/adblocker, mencoba backend relay:', netErr);
    try {
      const relayRes = await fetch('/api/sync-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          metaToken: cleanToken,
          metaAccount: cleanAccount,
          supabaseUrl: localStorage.getItem('metasync_supabase_url') || '',
          supabaseKey: localStorage.getItem('metasync_supabase_key') || ''
        })
      });
      if (relayRes.ok) {
        const relayData = await relayRes.json();
        return relayData;
      }
    } catch (relayErr) {
      console.warn('Backend relay juga gagal:', relayErr);
    }
    throw netErr;
  }

  // 2. Parse Insights Metrik
  const metricsData = rawInsights.map(item => {
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

  // 3. Gabungkan Menjadi Struktur Kampanye Hierarkis Lengkap
  const assembledCampaigns = rawCampaigns.map(camp => {
    // Map stage kanban: 'test' | 'scale1' | 'scale2'
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
      // Jika adsets tidak terambil, gunakan insight atau default adset
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

  // 4. Jika Supabase client tersedia, lakukan upsert sinkronisasi ke tabel Supabase
  if (supabaseClient && assembledCampaigns.length > 0) {
    try {
      const today = new Date().toISOString().split('T')[0];
      for (const camp of assembledCampaigns) {
        let campDbId = null;
        const { data: existingCamp } = await supabaseClient
          .from('campaigns')
          .select('id')
          .eq('meta_campaign_id', camp.meta_campaign_id)
          .maybeSingle();

        if (existingCamp) {
          campDbId = existingCamp.id;
          await supabaseClient.from('campaigns').update({
            name: camp.name,
            daily_budget: camp.daily_budget,
            updated_at: new Date().toISOString()
          }).eq('id', campDbId);
        } else {
          campDbId = crypto.randomUUID();
          await supabaseClient.from('campaigns').insert([{
            id: campDbId,
            name: camp.name,
            meta_campaign_id: camp.meta_campaign_id,
            status: camp.status,
            daily_budget: camp.daily_budget,
            base_price: camp.base_price,
            cogs: camp.cogs
          }]);
        }

        // Upsert adsets
        for (const ad of camp.adsets) {
          let adsetDbId = null;
          const { data: existingAdset } = await supabaseClient
            .from('adsets')
            .select('id')
            .eq('meta_adset_id', ad.meta_adset_id)
            .maybeSingle();

          if (existingAdset) {
            adsetDbId = existingAdset.id;
            await supabaseClient.from('adsets').update({
              name: ad.name,
              status: ad.status,
              daily_budget: ad.daily_budget,
              updated_at: new Date().toISOString()
            }).eq('id', adsetDbId);
          } else {
            adsetDbId = crypto.randomUUID();
            await supabaseClient.from('adsets').insert([{
              id: adsetDbId,
              campaign_id: campDbId,
              meta_adset_id: ad.meta_adset_id,
              name: ad.name,
              status: ad.status,
              daily_budget: ad.daily_budget
            }]);
          }

          // Upsert daily_metrics
          await supabaseClient.from('daily_metrics').upsert({
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
      console.warn('Upsert Supabase warning (tetap disimpan ke state & cache lokal):', dbErr);
    }
  }

  return {
    success: true,
    mode: 'LIVE_META_API (Direct Graph v21.0)',
    account_id: cleanAccount,
    recordsProcessed: metricsData.length,
    campaigns: assembledCampaigns,
    metrics: metricsData,
    timestamp: new Date().toISOString()
  };
}
