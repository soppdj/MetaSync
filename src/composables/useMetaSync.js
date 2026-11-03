// src/composables/useMetaSync.js
import { ref, onMounted, onUnmounted } from 'vue';
import { fetchDirectMetaSync } from '../utils/metaApi';

const isSyncing = ref(false);
const lastSyncedAt = ref(localStorage.getItem('metasync_last_synced') || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
const syncMessage = ref('');
const syncStatus = ref('idle'); // 'idle' | 'success' | 'error'
const syncMode = ref(localStorage.getItem('metasync_meta_token') ? 'LIVE_META_API' : 'OFFLINE');
const accountId = ref(localStorage.getItem('metasync_meta_account') || 'Belum Terhubung');

// Real-Time Polling & Countdown Controls
const autoSyncInterval = ref(Number(localStorage.getItem('metasync_poll_interval')) || 20); // 20 seconds by default
const countdown = ref(autoSyncInterval.value);
const isRealtimeActive = ref(true);

// Date Range Controls
const selectedDateRange = ref(localStorage.getItem('metasync_date_preset') || 'today');
const customDateRange = ref(JSON.parse(localStorage.getItem('metasync_custom_date') || '{"since":"","until":""}'));

// Audience Regional & Platform Breakdown State
const audienceRegions = ref(JSON.parse(localStorage.getItem('metasync_audience_regions') || '[]'));
const platformBreakdown = ref(JSON.parse(localStorage.getItem('metasync_platform_breakdown') || '{"instagram":{"percentage":65,"spend":0,"impressions":0,"clicks":0,"purchases":0},"facebook":{"percentage":35,"spend":0,"impressions":0,"clicks":0,"purchases":0}}'));
const ageGenderDemographics = ref(JSON.parse(localStorage.getItem('metasync_age_gender') || '{"gender":{"female":56,"male":44},"ageBrackets":[{"age":"18-24","percentage":16},{"age":"25-34","percentage":42,"isCore":true},{"age":"35-44","percentage":28},{"age":"45-54","percentage":10},{"age":"55+","percentage":4}],"topDemographic":"Wanita, 25-34 Tahun"}'));

// Live Telemetry Event Logs
const syncLogs = ref([
  {
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: 'SYSTEM',
    message: 'Meta Marketing Graph API v21.0 Dual-Engine Telemetry Stream Initialized'
  }
]);

// Central Event Bus for sync callbacks to ensure any trigger updates state everywhere
const syncListeners = new Set();

let timerInterval = null;

export function useMetaSync(onSyncSuccess) {
  if (typeof onSyncSuccess === 'function') {
    syncListeners.add(onSyncSuccess);
  }
  
  const addLog = (message, type = 'SYNC') => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    syncLogs.value.unshift({ time, type, message });
    if (syncLogs.value.length > 30) {
      syncLogs.value.pop();
    }
  };

  const setDateRange = (preset, range = null) => {
    selectedDateRange.value = preset;
    localStorage.setItem('metasync_date_preset', preset);
    if (range) {
      customDateRange.value = range;
      localStorage.setItem('metasync_custom_date', JSON.stringify(range));
    }
    addLog(`Rentang tanggal diubah ke: [${preset.toUpperCase()}]`, 'ACTION');
    triggerSync({ datePreset: preset, timeRange: range || customDateRange.value });
  };

  const triggerSync = async (options = {}) => {
    if (isSyncing.value) return;

    isSyncing.value = true;
    syncStatus.value = 'idle';
    syncMessage.value = 'Menghubungkan ke Meta Graph API v21.0...';

    const savedToken = localStorage.getItem('metasync_meta_token') || '';
    const savedAccount = localStorage.getItem('metasync_meta_account') || '';
    const activePreset = options.datePreset || selectedDateRange.value;
    const activeRange = options.timeRange || customDateRange.value;

    let successData = null;

    // 1. JIKA ADA KREDENSIAL META, JALANKAN DIRECT BROWSER-TO-META GRAPH v21.0 (CORS SUPPORTED)
    if (savedToken && savedAccount) {
      try {
        addLog(`Menghubungkan ke Meta Graph API v21.0 (${savedAccount}) [${activePreset}]...`, 'NETWORK');
        // Direct browser client fetch (Paling responsif & tidak butuh serverless node)
        successData = await fetchDirectMetaSync(savedToken, savedAccount, null, activePreset, activeRange);
        addLog(`Meta Graph sync live berhasil! ${successData.recordsProcessed || 0} unit telemetri termutakhir.`, 'SUCCESS');
      } catch (directErr) {
        console.warn('Direct Meta sync error, mencoba serverless fallback:', directErr);
        // Fallback coba serverless function jika tersedia
        try {
          const response = await fetch('/api/sync-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'sync',
              metaToken: savedToken,
              metaAccount: savedAccount,
              datePreset: activePreset,
              timeRange: activeRange
            })
          });
          if (response.ok) {
            successData = await response.json();
            addLog(`Meta sync via Serverless Function berhasil!`, 'SUCCESS');
          }
        } catch (srvErr) {
          console.warn('Serverless sync failed as well:', srvErr);
        }
      }
    }

    // 2. EVALUASI HASIL SINKRONISASI
    if (successData) {
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      lastSyncedAt.value = timeStr;
      localStorage.setItem('metasync_last_synced', timeStr);
      syncStatus.value = 'success';
      syncMode.value = successData.mode || 'LIVE_META_API';
      accountId.value = successData.account_id || savedAccount;
      syncMessage.value = `Sinkronisasi live Meta berhasil (${successData.recordsProcessed || 0} records)`;
      
      // Simpan audience breakdown jika ada
      if (successData.audienceRegions && Array.isArray(successData.audienceRegions)) {
        audienceRegions.value = successData.audienceRegions;
        localStorage.setItem('metasync_audience_regions', JSON.stringify(successData.audienceRegions));
      }
      if (successData.platformBreakdown) {
        platformBreakdown.value = successData.platformBreakdown;
        localStorage.setItem('metasync_platform_breakdown', JSON.stringify(successData.platformBreakdown));
      }
      if (successData.ageGenderDemographics) {
        ageGenderDemographics.value = successData.ageGenderDemographics;
        localStorage.setItem('metasync_age_gender', JSON.stringify(successData.ageGenderDemographics));
      }

      syncListeners.forEach(listener => {
        try {
          listener(successData);
        } catch (lErr) {
          console.error('Sync listener callback error:', lErr);
        }
      });
    } else {
      // OFFLINE / BELUM TERHUBUNG (Murni data real, tidak menyuntikkan simulasi)
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      lastSyncedAt.value = timeStr;
      syncStatus.value = savedToken ? 'error' : 'idle';
      syncMode.value = savedToken ? 'LIVE_META_API (OFFLINE)' : 'OFFLINE';
      syncMessage.value = savedToken 
        ? 'Gagal terhubung ke Meta Graph API. Periksa token & Ad Account ID di menu Settings!' 
        : 'Meta Ads belum terhubung. Masukkan kredensial Meta di menu Settings untuk Live.';
      
      addLog(syncMessage.value, savedToken ? 'WARN' : 'INFO');
    }

    setTimeout(() => {
      isSyncing.value = false;
      countdown.value = autoSyncInterval.value;
    }, 600);
  };

  // Toggle Campaign Status on Meta (Direct Graph API v21.0)
  const toggleCampaignStatusOnMeta = async (campaignId, newStatus) => {
    addLog(`Mengirim instruksi status: ${newStatus} untuk campaign ${campaignId}...`, 'ACTION');
    const savedToken = localStorage.getItem('metasync_meta_token') || '';
    
    if (savedToken && !campaignId.startsWith('cmp_')) {
      try {
        const updateUrl = `https://graph.facebook.com/v21.0/${campaignId}?status=${newStatus}&access_token=${savedToken}`;
        const updateRes = await fetch(updateUrl, { method: 'POST' });
        const updateJson = await updateRes.json();
        
        if (updateJson.error) {
          throw new Error(updateJson.error.message);
        }
        
        addLog(`Campaign ${campaignId} kini [${newStatus}] di Meta Ads Manager.`, 'SUCCESS');
        return { success: true, mode: 'LIVE_META_API' };
      } catch (err) {
        addLog(`Gagal kirim update ke Meta Graph: ${err.message}`, 'WARN');
      }
    }

    addLog(`Campaign ${campaignId} status diubah lokal ke [${newStatus}].`, 'INFO');
    return { success: true, localOnly: true };
  };

  // Interval setter
  const setPollingInterval = (seconds) => {
    autoSyncInterval.value = seconds;
    localStorage.setItem('metasync_poll_interval', seconds);
    countdown.value = seconds;
    if (seconds === 0) {
      isRealtimeActive.value = false;
    } else {
      isRealtimeActive.value = true;
    }
    addLog(`Interval auto-sync diubah ke ${seconds === 0 ? 'OFF (Manual)' : seconds + ' detik'}`);
  };

  // Setup background ticker
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      if (!isRealtimeActive.value || autoSyncInterval.value <= 0) return;
      if (countdown.value > 1) {
        countdown.value--;
      } else {
        countdown.value = autoSyncInterval.value;
        triggerSync();
      }
    }, 1000);
  }

  return {
    isSyncing,
    lastSyncedAt,
    syncMessage,
    syncStatus,
    syncMode,
    accountId,
    autoSyncInterval,
    countdown,
    isRealtimeActive,
    syncLogs,
    selectedDateRange,
    customDateRange,
    audienceRegions,
    platformBreakdown,
    ageGenderDemographics,
    setDateRange,
    triggerSync,
    setPollingInterval,
    toggleCampaignStatusOnMeta
  };
}
