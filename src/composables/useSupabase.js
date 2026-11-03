// src/composables/useSupabase.js
import { ref, computed } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { createDataSnapshot, safeMergeCampaigns } from '../utils/dataProtection';

// Persistent LocalStorage config or Vite Env
const STORAGE_KEYS = {
  URL: 'metasync_supabase_url',
  KEY: 'metasync_supabase_key',
  META_TOKEN: 'metasync_meta_token',
  META_ACCOUNT: 'metasync_meta_account',
  GEMINI_KEY: 'metasync_gemini_key',
  TELEGRAM_TOKEN: 'metasync_telegram_token',
  TELEGRAM_CHAT: 'metasync_telegram_chat',
};

// Sanitizer: Memastikan tidak ada data sampel/dummy yang tersisa di cache
function sanitizeCampaigns(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(c => {
    const isMockId = c.id?.startsWith('a1111111') || c.id?.startsWith('a2222222') || c.id?.startsWith('a3333333') || c.id?.startsWith('c1111111') || c.id?.startsWith('c2222222') || c.id?.startsWith('c3333333');
    const isMockCmp = c.meta_campaign_id?.startsWith('cmp_test_8819201') || c.meta_campaign_id?.startsWith('cmp_scale1_9918234') || c.meta_campaign_id?.startsWith('cmp_scale2_7726315');
    const isMockName = c.name?.includes('Anti-Acne Clarifying') || c.name?.includes('Alpha Masculine') || c.name?.includes('Deep Exfoliating Back');
    return !isMockId && !isMockCmp && !isMockName;
  });
}

// Bersihkan juga default fake account ID jika ada
if (localStorage.getItem('metasync_meta_account') === 'act_fatherlab_live_01') {
  localStorage.removeItem('metasync_meta_account');
}

const supabaseUrl = ref(localStorage.getItem(STORAGE_KEYS.URL) || import.meta.env.VITE_SUPABASE_URL || '');
const supabaseKey = ref(localStorage.getItem(STORAGE_KEYS.KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '');

let supabaseInstance = null;

export function getSupabaseClient() {
  if (!supabaseUrl.value || !supabaseKey.value) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl.value, supabaseKey.value);
  }
  return supabaseInstance;
}

export function useSupabase() {
  const rawCached = localStorage.getItem('metasync_campaigns_cache');
  let parsedCached = [];
  try {
    parsedCached = rawCached ? JSON.parse(rawCached) : [];
  } catch (e) {
    parsedCached = [];
  }
  const initialClean = sanitizeCampaigns(parsedCached);
  localStorage.setItem('metasync_campaigns_cache', JSON.stringify(initialClean));

  const campaigns = ref(initialClean);
  const creativeAssets = ref([]);
  const isConnected = ref(Boolean(supabaseUrl.value && supabaseKey.value));
  const isLoading = ref(false);
  const error = ref(null);

  // Save Settings to LocalStorage
  const updateSettings = (config) => {
    if (config.supabaseUrl !== undefined) {
      supabaseUrl.value = config.supabaseUrl;
      localStorage.setItem(STORAGE_KEYS.URL, config.supabaseUrl);
    }
    if (config.supabaseKey !== undefined) {
      supabaseKey.value = config.supabaseKey;
      localStorage.setItem(STORAGE_KEYS.KEY, config.supabaseKey);
    }
    if (config.metaToken !== undefined) localStorage.setItem(STORAGE_KEYS.META_TOKEN, config.metaToken);
    if (config.metaAccount !== undefined) localStorage.setItem(STORAGE_KEYS.META_ACCOUNT, config.metaAccount);
    if (config.geminiKey !== undefined) localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, config.geminiKey);
    if (config.telegramToken !== undefined) localStorage.setItem(STORAGE_KEYS.TELEGRAM_TOKEN, config.telegramToken);
    if (config.telegramChat !== undefined) localStorage.setItem(STORAGE_KEYS.TELEGRAM_CHAT, config.telegramChat);

    supabaseInstance = null;
    isConnected.value = Boolean(supabaseUrl.value && supabaseKey.value);
  };

  const getSavedSettings = () => ({
    supabaseUrl: supabaseUrl.value,
    supabaseKey: supabaseKey.value,
    metaToken: localStorage.getItem(STORAGE_KEYS.META_TOKEN) || '',
    metaAccount: localStorage.getItem(STORAGE_KEYS.META_ACCOUNT) || '',
    geminiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || '',
    telegramToken: localStorage.getItem(STORAGE_KEYS.TELEGRAM_TOKEN) || '',
    telegramChat: localStorage.getItem(STORAGE_KEYS.TELEGRAM_CHAT) || '',
  });

  // Fetch campaigns with nested adsets and metrics
  const fetchCampaigns = async () => {
    const client = getSupabaseClient();
    if (!client) {
      // Return cached/mock data
      return campaigns.value;
    }

    try {
      isLoading.value = true;
      const { data, error: fetchErr } = await client
        .from('campaigns')
        .select(`
          *,
          adsets (
            *,
            daily_metrics (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (data && data.length > 0) {
        // Filter out legacy sample campaigns that might have been seeded to Supabase
        const cleanRemote = data.filter(camp => {
          const isSample = camp.meta_campaign_id === 'cmp_test_8819201' || 
                           camp.meta_campaign_id === 'cmp_scale1_9918234' || 
                           camp.meta_campaign_id === 'cmp_scale2_7726315' ||
                           camp.name?.includes('Anti-Acne Clarifying') ||
                           camp.name?.includes('Alpha Masculine') ||
                           camp.name?.includes('Deep Exfoliating Back');
          return !isSample;
        });

        // Background cleanup of sample rows in Supabase
        client.from('campaigns').delete().in('meta_campaign_id', ['cmp_test_8819201', 'cmp_scale1_9918234', 'cmp_scale2_7726315']).then(() => {}).catch(() => {});

        // Transform Supabase structure into convenient format
        const incoming = cleanRemote.map(camp => ({
          ...camp,
          base_price: Number(camp.base_price || 0),
          cogs: Number(camp.cogs || 0),
          adsets: (camp.adsets || []).map(ad => {
            // Aggregate today's or latest metrics
            const latestMetric = ad.daily_metrics?.[ad.daily_metrics.length - 1] || {};
            return {
              ...ad,
              metrics: {
                spend: Number(latestMetric.spend || 0),
                impressions: Number(latestMetric.impressions || 0),
                clicks: Number(latestMetric.clicks || 0),
                lpv: Number(latestMetric.lpv || 0),
                atc: Number(latestMetric.atc || 0),
                ic: Number(latestMetric.ic || 0),
                purchases: Number(latestMetric.purchases || 0),
                revenue: Number(latestMetric.revenue || 0),
                reach: Number(latestMetric.reach || 0),
                frequency: Number(latestMetric.frequency || 1.0)
              }
            };
          })
        }));
        
        // Anti-Reset Sentinel: Safe Merge to protect locally created campaigns
        campaigns.value = sanitizeCampaigns(safeMergeCampaigns(campaigns.value, incoming));
        localStorage.setItem('metasync_campaigns_cache', JSON.stringify(campaigns.value));
        createDataSnapshot('Auto-Sync Merge');
      } else {
        // Jika Supabase kosong, pertahankan campaigns yang sudah dimuat dari Meta Ads via localStorage
        campaigns.value = sanitizeCampaigns(campaigns.value);
        localStorage.setItem('metasync_campaigns_cache', JSON.stringify(campaigns.value));
      }
      return campaigns.value;
    } catch (err) {
      console.warn('Supabase fetch failed, fallback to local state:', err);
      error.value = err.message;
      return campaigns.value;
    } finally {
      isLoading.value = false;
    }
  };

  // Ingest Live Meta Campaigns Directly (Bypasses empty Supabase DB dependency)
  const ingestLiveMetaCampaigns = (incomingCampaigns) => {
    if (!Array.isArray(incomingCampaigns) || incomingCampaigns.length === 0) return;

    const currentList = [...campaigns.value];
    const merged = incomingCampaigns.map(inc => {
      const existing = currentList.find(c => 
        (c.meta_campaign_id && c.meta_campaign_id === inc.meta_campaign_id) || 
        c.id === inc.id
      );
      if (existing) {
        return {
          ...inc,
          id: existing.id || inc.id,
          base_price: (existing.base_price && existing.base_price > 0) ? existing.base_price : inc.base_price,
          cogs: (existing.cogs !== undefined && existing.cogs > 0) ? existing.cogs : inc.cogs,
          status: (existing.status && ['test', 'scale1', 'scale2', 'paused'].includes(existing.status)) ? existing.status : inc.status,
        };
      }
      return inc;
    });

    // Pertahankan campaign lokal yang belum ada di Meta
    const nonMetaLocal = currentList.filter(c => 
      !incomingCampaigns.some(inc => inc.meta_campaign_id === c.meta_campaign_id || inc.id === c.id) &&
      c.meta_campaign_id?.startsWith('cmp_') && 
      !c.meta_campaign_id?.startsWith('cmp_test_8819201')
    );

    const finalList = sanitizeCampaigns([...merged, ...nonMetaLocal]);
    campaigns.value = finalList;
    localStorage.setItem('metasync_campaigns_cache', JSON.stringify(finalList));
    createDataSnapshot('Live Meta Ads Direct Ingest');
    return finalList;
  };

  // Create Campaign
  const createCampaign = async (newCamp) => {
    const client = getSupabaseClient();
    const campObj = {
      id: crypto.randomUUID(),
      name: newCamp.name,
      base_price: Number(newCamp.base_price),
      cogs: Number(newCamp.cogs),
      status: newCamp.status || 'test',
      meta_campaign_id: `cmp_${Date.now()}`,
      daily_budget: Number(newCamp.daily_budget || 500000),
      created_at: new Date().toISOString(),
      adsets: [
        {
          id: crypto.randomUUID(),
          name: `${newCamp.name} - Ad Set 1`,
          meta_adset_id: `adset_${Date.now()}`,
          status: 'ACTIVE',
          daily_budget: Number(newCamp.daily_budget || 500000),
          metrics: {
            spend: 0,
            impressions: 0,
            clicks: 0,
            lpv: 0,
            atc: 0,
            ic: 0,
            purchases: 0,
            revenue: 0,
            reach: 0,
            frequency: 1.0
          }
        }
      ]
    };

    if (client) {
      try {
        const { error: insErr } = await client.from('campaigns').insert([{
          id: campObj.id,
          name: campObj.name,
          base_price: campObj.base_price,
          cogs: campObj.cogs,
          status: campObj.status,
          meta_campaign_id: campObj.meta_campaign_id,
          daily_budget: campObj.daily_budget,
        }]);
        if (insErr) console.error('Insert campaign error:', insErr);
      } catch (e) {
        console.error(e);
      }
    }

    campaigns.value.unshift(campObj);
    localStorage.setItem('metasync_campaigns_cache', JSON.stringify(campaigns.value));
    createDataSnapshot(`Campaign Created: ${campObj.name}`);
    return campObj;
  };

  // Move Campaign Status (e.g. test -> scale1 -> scale2)
  const updateCampaignStatus = async (campaignId, newStatus) => {
    const idx = campaigns.value.findIndex(c => c.id === campaignId);
    if (idx !== -1) {
      campaigns.value[idx].status = newStatus;
      localStorage.setItem('metasync_campaigns_cache', JSON.stringify(campaigns.value));
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('campaigns').update({ status: newStatus }).eq('id', campaignId);
      } catch (e) {
        console.error('Update status failed in Supabase:', e);
      }
    }
  };

  // Pause / Kill AdSet
  const pauseAdset = async (campaignId, adsetId) => {
    const camp = campaigns.value.find(c => c.id === campaignId);
    if (camp) {
      const ad = camp.adsets.find(a => a.id === adsetId || a.meta_adset_id === adsetId);
      if (ad) {
        ad.status = 'PAUSED';
        localStorage.setItem('metasync_campaigns_cache', JSON.stringify(campaigns.value));
      }
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('adsets').update({ status: 'PAUSED' }).eq('id', adsetId);
      } catch (e) {
        console.error('Pause adset error:', e);
      }
    }
  };

  // Save Hypnowriting logs (auto-saved to hypnowriting_logs table in Supabase)
  const saveHypnowritingLog = async (logData) => {
    // 1. Local caching protection (Anti-Loss)
    try {
      const cached = JSON.parse(localStorage.getItem('metasync_hypnowriting_cache') || '[]');
      cached.unshift({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...logData
      });
      localStorage.setItem('metasync_hypnowriting_cache', JSON.stringify(cached.slice(0, 30)));
      createDataSnapshot('Hypnowriting Generated');
    } catch (e) {
      console.warn('Local hypnowriting caching warning:', e);
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = [{
          campaign_id: logData.campaign_id || null,
          prompt_context: logData.prompt_context,
          generated_text: logData.generated_text,
          framework: logData.framework || 'All 5',
        }];

        // Insert into hypnowriting_logs primary table
        const { error: err1 } = await client.from('hypnowriting_logs').insert(payload);
        if (err1) {
          // Fallback to copywriting_logs if table has not been migrated yet
          await client.from('copywriting_logs').insert(payload);
        }
      } catch (e) {
        console.error('Error saving hypnowriting log:', e);
      }
    }
  };

  // Dynamic Historical Chart Data calculated strictly from real campaigns
  const historicalChartData = computed(() => {
    if (!campaigns.value || campaigns.value.length === 0) {
      return [
        { date: 'Hari Ini', spend: 0, revenue: 0, netProfit: 0, roas: 0, cpr: 0 }
      ];
    }

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalPurchases = 0;

    campaigns.value.forEach(c => {
      (c.adsets || []).forEach(a => {
        totalSpend += Number(a.metrics?.spend || 0);
        totalRevenue += Number(a.metrics?.revenue || 0);
        totalPurchases += Number(a.metrics?.purchases || 0);
      });
    });

    const netProfit = totalRevenue - totalSpend;
    const roas = totalSpend > 0 ? Number((totalRevenue / totalSpend).toFixed(2)) : 0;
    const cpr = totalPurchases > 0 ? Math.round(totalSpend / totalPurchases) : 0;

    return [
      { date: 'Hari Ini', spend: totalSpend, revenue: totalRevenue, netProfit, roas, cpr }
    ];
  });

  const saveCopywritingLog = saveHypnowritingLog;

  return {
    campaigns,
    creativeAssets,
    historicalChartData,
    isConnected,
    isLoading,
    error,
    fetchCampaigns,
    ingestLiveMetaCampaigns,
    createCampaign,
    updateCampaignStatus,
    pauseAdset,
    saveHypnowritingLog,
    saveCopywritingLog,
    updateSettings,
    getSavedSettings,
    getSupabaseClient
  };
}
