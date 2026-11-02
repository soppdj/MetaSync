// src/composables/useSupabase.js
import { ref } from 'vue';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_CAMPAIGNS, INITIAL_CREATIVE_ASSETS, HISTORICAL_CHART_DATA } from '../utils/mockData';
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

const supabaseUrl = ref(localStorage.getItem(STORAGE_KEYS.URL) || import.meta.env.VITE_SUPABASE_URL || '');
const supabaseKey = ref(localStorage.getItem(STORAGE_KEYS.KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '');

let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseUrl.value || !supabaseKey.value) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl.value, supabaseKey.value);
  }
  return supabaseInstance;
}

export function useSupabase() {
  const campaigns = ref(JSON.parse(localStorage.getItem('metasync_campaigns_cache') || 'null') || INITIAL_CAMPAIGNS);
  const creativeAssets = ref(INITIAL_CREATIVE_ASSETS);
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
        // Transform Supabase structure into convenient format
        const incoming = data.map(camp => ({
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
        campaigns.value = safeMergeCampaigns(campaigns.value, incoming);
        localStorage.setItem('metasync_campaigns_cache', JSON.stringify(campaigns.value));
        createDataSnapshot('Auto-Sync Merge');
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

  const saveCopywritingLog = saveHypnowritingLog;

  return {
    campaigns,
    creativeAssets,
    historicalChartData: HISTORICAL_CHART_DATA,
    isConnected,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaignStatus,
    pauseAdset,
    saveHypnowritingLog,
    saveCopywritingLog,
    updateSettings,
    getSavedSettings
  };
}
