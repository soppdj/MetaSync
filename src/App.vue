<template>
  <div class="min-h-screen bg-dark-950 text-slate-100 flex flex-col antialiased selection:bg-brand-500 selection:text-white relative">
    
    <!-- ========================================================
         LOGIN UI ANIMATIF: PROTOKOL KEAMANAN TERMINAL ADMIN
         ======================================================== -->
    <LoginView
      v-if="!isAuthenticated"
      @login-success="handleLoginSuccess"
    />

    <!-- ========================================================
         APLIKASI UTAMA METASYNC (DITAMPILKAN SETELAH OTORISASI)
         ======================================================== -->
    <template v-else>
      <!-- Global Header -->
      <Header
        :active-tab="activeTab"
        :is-syncing="isSyncing"
        :last-synced-at="lastSyncedAt"
        :current-user="currentUser"
        @update:active-tab="activeTab = $event"
        @trigger-sync="handleSync"
        @open-create-modal="showCreateModal = true"
        @open-settings="showSettingsModal = true"
        @open-protection-modal="showProtectionModal = true"
        @lock-terminal="handleLockTerminal"
      />

      <!-- Toast Notification Banner -->
      <div 
        v-if="toast.visible" 
        class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border transition-all animate-bounce-subtle"
        :class="[
          toast.type === 'danger' 
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50' 
            : toast.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50' 
              : 'bg-dark-900/90 text-teal-200 border-brand-500/50'
        ]"
      >
        <span class="w-2.5 h-2.5 rounded-full" :class="toast.type === 'danger' ? 'bg-rose-400' : 'bg-emerald-400'"></span>
        <span class="text-xs font-bold">{{ toast.message }}</span>
      </div>

      <!-- Main Content Container (Desktop Optimized) -->
      <main class="flex-1 max-w-[1720px] w-full mx-auto px-6 py-6">
        
        <!-- TAB 1: DASHBOARD (Posisi No 1 - Dikembalikan Seperti Sebelumnya) -->
        <PerformanceCharts
          v-if="activeTab === 'dashboard'"
          :chart-data="historicalChartData"
          :campaigns="campaigns"
        />

        <!-- TAB 2: METALAB (Posisi No 2 - Kanban Lifecycle 3 Tahap) -->
        <KanbanBoard
          v-else-if="activeTab === 'metalab'"
          :campaigns="campaigns"
          @move-stage="handleMoveStage"
          @kill-adset="handleKillAdset"
          @open-create-modal="showCreateModal = true"
        />

        <!-- TAB 3: METASYNC (Fitur Baru di Sebelah MetaLab - Real-Time Meta Ads KPI Table) -->
        <MetaSyncTable
          v-else-if="activeTab === 'metasync'"
          :campaigns="campaigns"
          @trigger-sync="handleSync"
          @update-status="handleMoveStage"
          @pause-adset="handlePauseAdset"
          @open-settings="showSettingsModal = true"
        />

        <!-- TAB 4: CREATIVE LEADERBOARD -->
        <CreativeLeaderboard
          v-else-if="activeTab === 'leaderboard'"
          :assets="creativeAssets"
        />

        <!-- TAB 5: CONTENT STUDIO (GEMINI PRO STREAMING) -->
        <HypnowritingStudio
          v-else-if="activeTab === 'content-studio' || activeTab === 'hypnowriting'"
          @save-log="handleSaveLog"
        />

        <!-- TAB 6: REPORT GENERATOR (FLYER / PDF) -->
        <ReportGenerator
          v-else-if="activeTab === 'reports'"
          :campaigns="campaigns"
        />

      </main>

      <!-- Modal: Buat Campaign Baru (Wajibkan Harga Jual & HPP) -->
      <CampaignModal
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @save="handleCreateCampaign"
      />

      <!-- Modal: Pengaturan API & Integrasi -->
      <SettingsModal
        v-if="showSettingsModal"
        :initial-settings="getSavedSettings()"
        @close="showSettingsModal = false"
        @save="handleSaveSettings"
      />

      <!-- Modal: Proteksi Integritas Data (Anti-Reset Sentinel) -->
      <DataProtectionModal
        v-if="showProtectionModal"
        @close="showProtectionModal = false"
        @notify="showToast"
        @reload-data="fetchCampaigns"
      />
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LoginView from './components/LoginView.vue';
import Header from './components/Header.vue';
import PerformanceCharts from './components/PerformanceCharts.vue';
import KanbanBoard from './components/KanbanBoard.vue';
import MetaSyncTable from './components/MetaSyncTable.vue';
import CreativeLeaderboard from './components/CreativeLeaderboard.vue';
import HypnowritingStudio from './components/HypnowritingStudio.vue';
import ReportGenerator from './components/ReportGenerator.vue';
import CampaignModal from './components/CampaignModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import DataProtectionModal from './components/DataProtectionModal.vue';
import { useSupabase } from './composables/useSupabase';
import { useMetaSync } from './composables/useMetaSync';
import { useAuth } from './composables/useAuth';
import { startTelegramPolling, stopTelegramPolling } from './utils/telegramBotListener';

const activeTab = ref('dashboard');
const showCreateModal = ref(false);
const showSettingsModal = ref(false);
const showProtectionModal = ref(false);

// Auth Engine & Status
const { isAuthenticated, currentUser, logout, updateAdminPassword } = useAuth();

const {
  campaigns,
  creativeAssets,
  historicalChartData,
  fetchCampaigns,
  ingestLiveMetaCampaigns,
  createCampaign,
  updateCampaignStatus,
  pauseAdset,
  saveHypnowritingLog,
  saveCopywritingLog,
  updateSettings,
  getSavedSettings
} = useSupabase();

// Toast helper
const toast = ref({
  visible: false,
  message: '',
  type: 'info'
});

const showToast = (message, type = 'info') => {
  toast.value = { visible: true, message, type };
  setTimeout(() => {
    toast.value.visible = false;
  }, 4000);
};

// Login Success Callback
const handleLoginSuccess = (user) => {
  showToast(`Selamat datang, ${user?.name || 'Commander'}! Sesi Admin Aktif.`, 'success');
  fetchCampaigns();
  handleSync();
};

// Lock Terminal Action (Logout)
const handleLockTerminal = () => {
  logout();
  showToast('Terminal MetaSync berhasil dikunci. Protokol keamanan aktif.', 'info');
};

// Refresh Sync Hook
const { isSyncing, lastSyncedAt, triggerSync } = useMetaSync((syncResult) => {
  if (syncResult?.campaigns && syncResult.campaigns.length > 0) {
    ingestLiveMetaCampaigns(syncResult.campaigns);
    showToast(`✓ Berhasil memuat ${syncResult.campaigns.length} kampanye dari Meta Ads (${syncResult.account_id || ''})!`, 'success');
  } else {
    fetchCampaigns();
    showToast(`Sync Meta Graph API selesai: ${syncResult?.recordsProcessed || 0} data metrik termutakhir!`, 'info');
  }
});

const handleSync = () => {
  triggerSync();
};

// Move Lifecycle Stage (Manual or Auto-Move)
const handleMoveStage = async ({ campaignId, nextStage }) => {
  await updateCampaignStatus(campaignId, nextStage);
  const stageNames = {
    test: 'Tahap 1: TEST',
    scale1: 'Tahap 2: SCALE 1',
    scale2: 'Tahap 3: SCALE 2',
    paused: 'PAUSED'
  };
  showToast(`Campaign berhasil dipindahkan ke ${stageNames[nextStage] || nextStage}!`, 'success');

  // Push notification alert to Telegram
  try {
    fetch('/api/telegram-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'push_alert',
        type: 'SCALE_ALERT',
        title: `Auto-Scale: Campaign Naik ke ${stageNames[nextStage]}`,
        message: `Campaign ID: ${campaignId} telah dipromosikan ke tahap berikutnya karena CTR > 2% dan CPR memenuhi target.`
      })
    });
  } catch (e) {
    console.warn(e);
  }
};

// Kill Adset Action
const handleKillAdset = async ({ campaignId, adsetId, metaAdsetId, campaignName }) => {
  await pauseAdset(campaignId, adsetId);
  showToast(`AdSet ${metaAdsetId || adsetId} berhasil di-KILL (PAUSED di Meta & Database)!`, 'danger');

  // Trigger Telegram push alert & remote Meta pause
  try {
    await fetch('/api/telegram-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'push_alert',
        type: 'KILL_ALERT',
        title: `AdSet Di-Kill: ${campaignName}`,
        message: `AdSet ID \`${metaAdsetId || adsetId}\` telah dijeda (PAUSED) untuk menghentikan pembengkakan biaya CPR/CPM.`
      })
    });
  } catch (e) {
    console.warn('Telegram webhook push failed:', e);
  }
};

// Pause / Resume AdSet from Live Dashboard
const handlePauseAdset = async ({ campaignId, adsetId }) => {
  await pauseAdset(campaignId, adsetId);
  showToast(`AdSet status berhasil diubah di Meta & Database!`, 'info');
};

// Create Campaign
const handleCreateCampaign = async (newCampData) => {
  showCreateModal.value = false;
  await createCampaign(newCampData);
  showToast(`Campaign baru "${newCampData.name}" berhasil dibuat dengan target KPI dinamis!`, 'success');
};

// Telegram Autonomous Command Listener
const initTelegramBotListener = () => {
  const settings = getSavedSettings();
  if (settings.telegramToken) {
    stopTelegramPolling();
    startTelegramPolling(settings.telegramToken, (killedAdsetId) => {
      let found = false;
      for (const camp of campaigns.value) {
        const adset = (camp.adsets || []).find(a => a.id === killedAdsetId || a.meta_adset_id === killedAdsetId);
        if (adset) {
          pauseAdset(camp.id, adset.id);
          showToast(`🚨 Telegram Command: AdSet "${adset.name || killedAdsetId}" berhasil di-KILL (PAUSED)!`, 'danger');
          found = true;
          break;
        }
      }
      if (!found) {
        showToast(`Telegram Command: AdSet ID ${killedAdsetId} dihentikan via Meta API.`, 'info');
      }
    });
  }
};

// Save Settings
const handleSaveSettings = (config) => {
  if (config.adminPassword) {
    updateAdminPassword(config.adminPassword);
  }
  updateSettings(config);
  showSettingsModal.value = false;
  showToast('Konfigurasi API Keys dan Password Admin berhasil disimpan!', 'success');
  fetchCampaigns();
  initTelegramBotListener();
  if (config.metaToken && config.metaAccount) {
    handleSync();
  }
};

// Save Hypnowriting Log to Supabase (hypnowriting_logs)
const handleSaveLog = async (logData) => {
  await saveHypnowritingLog(logData);
  showToast('Naskah berhasil diarsipkan otomatis ke tabel hypnowriting_logs Supabase!', 'success');
};

onMounted(() => {
  if (isAuthenticated.value) {
    fetchCampaigns();
    const savedToken = localStorage.getItem('metasync_meta_token');
    const savedAccount = localStorage.getItem('metasync_meta_account');
    if (savedToken && savedAccount) {
      handleSync();
    }
  }
  initTelegramBotListener();
});

onUnmounted(() => {
  stopTelegramPolling();
});
</script>
