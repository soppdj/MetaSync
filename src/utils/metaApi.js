// src/utils/metaApi.js
// Direct Browser-to-Meta Graph API v21.0 Engine (With CORS Support)
// Memungkinkan sinkronisasi langsung ke Meta Ads tanpa bergantung pada serverless proxy

export async function fetchDirectMetaSync(token, accountId, supabaseClient = null) {
  if (!token || !accountId) {
    throw new Error('Access Token atau Ad Account ID belum diisi.');
  }

  let cleanAccount = accountId.trim();
  if (!cleanAccount.startsWith('act_')) {
    cleanAccount = `act_${cleanAccount}`;
  }
  const cleanToken = token.trim();

  // 1. Ambil daftar kampanye aktif/terbaru dari Meta Ads
  const campUrl = `https://graph.facebook.com/v21.0/${cleanAccount}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${cleanToken}&limit=50`;
  const campRes = await fetch(campUrl);
  const campJson = await campRes.json();

  if (campJson.error) {
    throw new Error(`Meta Graph API: ${campJson.error.message}`);
  }

  const liveCampaigns = (campJson.data || []).map(c => ({
    meta_campaign_id: c.id,
    name: c.name,
    status: c.status,
    effective_status: c.effective_status,
    objective: c.objective,
    daily_budget: c.daily_budget ? parseFloat(c.daily_budget) : 0,
  }));

  // 2. Ambil metrik hari ini (Today's Insights) per AdSet
  const insightsUrl = `https://graph.facebook.com/v21.0/${cleanAccount}/insights?fields=campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,reach,frequency,cpc,cpm,ctr,actions,action_values&date_preset=today&level=adset&access_token=${cleanToken}&limit=100`;
  const insightsRes = await fetch(insightsUrl);
  const insightsJson = await insightsRes.json();

  if (insightsJson.error) {
    throw new Error(`Meta Insights Error: ${insightsJson.error.message}`);
  }

  const rawInsights = insightsJson.data || [];

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

  // 3. Jika Supabase client tersedia, lakukan upsert ke tabel Supabase
  if (supabaseClient) {
    try {
      const today = new Date().toISOString().split('T')[0];
      for (const m of metricsData) {
        // Cek atau buat adset di Supabase
        const { data: existingAdset } = await supabaseClient
          .from('adsets')
          .select('id')
          .eq('meta_adset_id', m.adset_id)
          .maybeSingle();

        if (existingAdset) {
          await supabaseClient.from('daily_metrics').upsert({
            adset_id: existingAdset.id,
            date: today,
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
          }, { onConflict: 'adset_id,date' });
        }
      }
    } catch (dbErr) {
      console.warn('Gagal upsert langsung ke Supabase (akan disimpan ke cache lokal):', dbErr);
    }
  }

  return {
    success: true,
    mode: 'LIVE_META_API (Direct Graph v21.0)',
    account_id: cleanAccount,
    recordsProcessed: metricsData.length,
    campaigns: liveCampaigns,
    metrics: metricsData,
    timestamp: new Date().toISOString()
  };
}
