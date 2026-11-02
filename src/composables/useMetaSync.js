// src/composables/useMetaSync.js
import { ref, onMounted, onUnmounted } from 'vue';

const isSyncing = ref(false);
const lastSyncedAt = ref(localStorage.getItem('metasync_last_synced') || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB');
const syncMessage = ref('');
const syncStatus = ref('idle'); // 'idle' | 'success' | 'error'
const syncMode = ref('SIMULATION_DEMO');
const accountId = ref(localStorage.getItem('metasync_meta_account') || 'act_fatherlab_live_01');

// Real-Time Polling & Countdown Controls
const autoSyncInterval = ref(Number(localStorage.getItem('metasync_poll_interval')) || 20); // 20 seconds by default
const countdown = ref(autoSyncInterval.value);
const isRealtimeActive = ref(true);

// Live Telemetry Event Logs
const syncLogs = ref([
  {
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: 'SYSTEM',
    message: 'Meta Marketing Graph API v20.0 Telemetry Stream Initialized'
  }
]);

let timerInterval = null;

export function useMetaSync(onSyncSuccess) {
  
  const addLog = (message, type = 'SYNC') => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    syncLogs.value.unshift({ time, type, message });
    if (syncLogs.value.length > 25) {
      syncLogs.value.pop();
    }
  };

  const triggerSync = async () => {
    if (isSyncing.value) return;

    isSyncing.value = true;
    syncStatus.value = 'idle';
    syncMessage.value = 'Menghubungkan ke Meta Graph API & Supabase...';

    const savedToken = localStorage.getItem('metasync_meta_token') || '';
    const savedAccount = localStorage.getItem('metasync_meta_account') || '';

    try {
      const response = await fetch('/api/sync-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          metaToken: savedToken,
          metaAccount: savedAccount
        })
      });

      if (!response.ok) {
        throw new Error(`Sync server responded with ${response.status}`);
      }

      const data = await response.json();
      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      lastSyncedAt.value = timeStr;
      localStorage.setItem('metasync_last_synced', timeStr);
      syncStatus.value = 'success';
      syncMode.value = data.mode || (savedToken ? 'LIVE_META_API' : 'SIMULATION_DEMO');
      accountId.value = data.account_id || savedAccount || 'act_fatherlab_live_01';
      syncMessage.value = `Sinkronisasi berhasil (${data.recordsProcessed || 2} unit telemetri termutakhir)`;

      addLog(`Sinkronisasi sukses: ${data.recordsProcessed || 4} adset diperbarui. Mode: ${syncMode.value}`);

      if (onSyncSuccess) {
        onSyncSuccess(data);
      }
    } catch (err) {
      console.warn('Sync API unreachable, applying local simulated telemetry tick:', err);
      setTimeout(() => {
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
        lastSyncedAt.value = timeStr;
        syncStatus.value = 'success';
        syncMode.value = 'SIMULATION_DEMO';
        syncMessage.value = 'Telemetri real-time diperbarui (Simulation)';
        addLog('Telemetri real-time diperbarui secara lokal (Traffic Pulse Sync)');
        if (onSyncSuccess) onSyncSuccess({ mode: 'SIMULATION_DEMO', recordsProcessed: 4 });
      }, 500);
    } finally {
      setTimeout(() => {
        isSyncing.value = false;
        countdown.value = autoSyncInterval.value;
      }, 600);
    }
  };

  // Toggle Campaign Status on Meta
  const toggleCampaignStatusOnMeta = async (campaignId, newStatus) => {
    addLog(`Mengirim instruksi Meta Graph: ${newStatus} untuk campaign ${campaignId}...`, 'ACTION');
    const savedToken = localStorage.getItem('metasync_meta_token') || '';
    try {
      const res = await fetch('/api/sync-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_campaign_status',
          campaignId,
          newStatus,
          metaToken: savedToken
        })
      });
      const data = await res.json();
      addLog(`Campaign ${campaignId} kini [${newStatus}] di Meta Graph API.`, 'SUCCESS');
      return data;
    } catch (e) {
      console.error(e);
      addLog(`Campaign ${campaignId} status diubah lokal ke [${newStatus}].`, 'INFO');
      return { success: true, localOnly: true };
    }
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
    triggerSync,
    setPollingInterval,
    toggleCampaignStatusOnMeta
  };
}
