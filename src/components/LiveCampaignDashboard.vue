<template>
  <div class="space-y-6">

    <!-- ========================================================================= -->
    <!-- 1. TOP REAL-TIME META ADS TELEMETRY CONTROL DECK                          -->
    <!-- ========================================================================= -->
    <div class="hud-panel p-5 rounded-2xl relative overflow-hidden font-mono border-cyan-500/30">
      <div class="scanline-effect"></div>

      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        <!-- Left: Connection Status & Account Info -->
        <div class="flex items-center gap-3.5">
          <div class="relative flex items-center justify-center w-11 h-11 bg-dark-950 border border-cyan-400 shadow-glow-cyan p-1 shrink-0 hud-corner">
            <Radio class="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-black text-white tracking-wider flex items-center gap-2">
                <span>[ REAL-TIME META ADS COMMAND DASHBOARD ]</span>
              </h2>
              <span 
                class="text-[9px] px-2 py-0.5 border font-bold uppercase tracking-wider"
                :class="syncMode === 'LIVE_META_API' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'"
              >
                {{ syncMode === 'LIVE_META_API' ? '● LIVE GRAPH v20.0' : '● SIMULATED TELEMETRY' }}
              </span>
            </div>
            
            <div class="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span class="flex items-center gap-1.5 text-cyan-300 font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                ACC: {{ accountId }}
              </span>
              <span>&bull;</span>
              <span>LAST SYNC: <strong class="text-white">{{ lastSyncedAt }}</strong></span>
              <span>&bull;</span>
              <span class="text-copper-400">STATUS: 200 OK</span>
            </div>
          </div>
        </div>

        <!-- Right: Auto-Sync Controls & Actions -->
        <div class="flex flex-wrap items-center gap-2.5">
          
          <!-- Auto-Sync Interval Selector -->
          <div class="flex items-center gap-1.5 bg-dark-900 px-2 py-1 border border-cyan-500/30 text-[11px]">
            <span class="text-slate-400">AUTO-SYNC:</span>
            <select
              :value="autoSyncInterval"
              @change="setPollingInterval(Number($event.target.value))"
              class="bg-dark-950 text-cyan-300 font-bold border-none outline-none cursor-pointer py-0.5"
            >
              <option :value="10">⚡ 10s (Flash)</option>
              <option :value="20">🔄 20s (Default)</option>
              <option :value="60">⏳ 60s (Paced)</option>
              <option :value="0">⏸️ Off (Manual)</option>
            </select>
          </div>

          <!-- Countdown Ticker Badge -->
          <div 
            v-if="autoSyncInterval > 0"
            class="flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-900 border border-copper-500/30 text-copper-300 text-[11px] font-bold"
            title="Hitung mundur menuju sinkronisasi telemetri berikutnya"
          >
            <Clock class="w-3.5 h-3.5 animate-spin-slow" />
            <span>TICK: {{ countdown }}s</span>
          </div>

          <!-- Instant Trigger Sync Button -->
          <button
            @click="triggerSync"
            :disabled="isSyncing"
            class="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-dark-950 bg-gradient-to-r from-brand-400 to-cyan-300 hover:opacity-90 transition-all shadow-glow-cyan disabled:opacity-50"
          >
            <RefreshCw class="w-3.5 h-3.5 text-dark-950" :class="{ 'animate-spin': isSyncing }" />
            <span>{{ isSyncing ? 'SYNCING...' : 'SYNC NOW' }}</span>
          </button>

          <!-- Toggle Event Log Terminal -->
          <button
            @click="showLogsDrawer = !showLogsDrawer"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-all"
            :class="showLogsDrawer ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-dark-900 text-slate-400 hover:text-white border-dark-750'"
            title="Buka / Tutup Telemetri Event Log Meta Graph"
          >
            <Terminal class="w-3.5 h-3.5" />
            <span>LOGS ({{ syncLogs.length }})</span>
          </button>

          <!-- API Settings Shortcut -->
          <button
            @click="$emit('open-settings')"
            class="p-2 bg-dark-900 text-slate-400 hover:text-white border border-dark-750 hover:border-cyan-500/40 transition-all"
            title="Konfigurasi Token Meta Ads & Supabase"
          >
            <Settings class="w-4 h-4" />
          </button>

        </div>

      </div>

      <!-- Collapsible Meta Event Log Terminal Feed -->
      <div 
        v-if="showLogsDrawer" 
        class="mt-4 pt-3 border-t border-cyan-500/20 bg-dark-950 p-3 rounded border border-dark-800 text-[11px] font-mono space-y-1.5 max-h-40 overflow-y-auto"
      >
        <div class="flex items-center justify-between text-[10px] text-slate-500 border-b border-dark-800 pb-1 mb-1">
          <span>// META GRAPH API v20.0 REAL-TIME TELEMETRY LOG</span>
          <button @click="syncLogs = []" class="text-rose-400 hover:underline">Clear Logs</button>
        </div>
        <div 
          v-for="(log, idx) in syncLogs" 
          :key="idx" 
          class="flex items-start gap-2 leading-relaxed"
        >
          <span class="text-slate-500 shrink-0">[{{ log.time }}]</span>
          <span 
            class="font-bold shrink-0 text-[10px] px-1"
            :class="[
              log.type === 'ACTION' ? 'bg-copper-950 text-copper-300 border border-copper-500/30' :
              log.type === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
              'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
            ]"
          >
            {{ log.type }}
          </span>
          <span class="text-slate-300">{{ log.message }}</span>
        </div>
      </div>

    </div>


    <!-- ========================================================================= -->
    <!-- 2. REAL-TIME FINANSIAL TELEMETRY RIBBON (AGGREGATE KPI)                    -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-3 font-mono">
      
      <!-- Metric 1: Live Active Campaigns -->
      <div class="hud-panel hud-corner p-3.5 rounded-xl space-y-1 border-cyan-500/30">
        <span class="text-[10px] uppercase text-slate-400 font-bold block">ACTIVE CAMPAIGNS</span>
        <div class="flex items-center gap-2">
          <span class="text-xl font-black text-cyan-300">{{ activeCampaignsCount }}</span>
          <span class="text-xs text-slate-500">/ {{ campaigns.length }} Total</span>
        </div>
        <div class="w-full bg-dark-950 h-1 border border-dark-800 mt-1">
          <div class="bg-cyan-400 h-full shadow-glow-cyan" :style="{ width: `${(activeCampaignsCount / (campaigns.length || 1)) * 100}%` }"></div>
        </div>
      </div>

      <!-- Metric 2: Today Ad Spend -->
      <div class="hud-panel hud-corner p-3.5 rounded-xl space-y-1 border-copper-500/30">
        <span class="text-[10px] uppercase text-slate-400 font-bold block">TODAY AD SPEND</span>
        <p class="text-lg font-black text-copper-400 truncate">{{ formatIDR(totalSpend) }}</p>
        <span class="text-[10px] text-slate-500 block truncate">Budget: {{ formatIDR(totalDailyBudget) }}</span>
      </div>

      <!-- Metric 3: Today Gross Revenue -->
      <div class="hud-panel hud-corner p-3.5 rounded-xl space-y-1 border-cyan-500/30">
        <span class="text-[10px] uppercase text-slate-400 font-bold block">TODAY REVENUE</span>
        <p class="text-lg font-black text-cyan-300 truncate">{{ formatIDR(totalRevenue) }}</p>
        <span class="text-[10px] text-emerald-400 block truncate">+{{ totalPurchases }} Conversions</span>
      </div>

      <!-- Metric 4: Today Nett Profit -->
      <div class="hud-panel hud-corner p-3.5 rounded-xl space-y-1 border-emerald-500/30">
        <span class="text-[10px] uppercase text-slate-400 font-bold block">NETT PROFIT</span>
        <p class="text-lg font-black text-emerald-400 truncate">{{ formatIDR(totalNett) }}</p>
        <span class="text-[10px] text-slate-400 block truncate">Margin: {{ grossMarginPct.toFixed(1) }}%</span>
      </div>

      <!-- Metric 5: Blended ROAS -->
      <div class="hud-panel hud-corner p-3.5 rounded-xl space-y-1 border-copper-500/30">
        <span class="text-[10px] uppercase text-slate-400 font-bold block">BLENDED ROAS</span>
        <div class="flex items-center gap-1.5">
          <Flame class="w-4 h-4 text-copper-400 animate-pulse" />
          <p class="text-lg font-black text-copper-300">{{ overallRoas.toFixed(2) }}x</p>
        </div>
        <span class="text-[10px] text-emerald-400 block font-bold">PROFITABLE</span>
      </div>

      <!-- Metric 6: Purchases & CPR -->
      <div class="hud-panel hud-corner p-3.5 rounded-xl space-y-1 border-cyan-500/30">
        <span class="text-[10px] uppercase text-slate-400 font-bold block">CPR // PURCHASE</span>
        <p class="text-lg font-black text-slate-200 truncate">{{ formatIDR(avgCpr) }}</p>
        <span class="text-[10px] text-cyan-300 block font-bold">{{ totalPurchases }} Total Orders</span>
      </div>

    </div>


    <!-- ========================================================================= -->
    <!-- 3. VIEW MODE SELECTOR (LIVE CAMPAIGNS vs 3D HOLOGLOBE & CHARTS)           -->
    <!-- ========================================================================= -->
    <div class="flex flex-wrap items-center justify-between gap-4 font-mono pb-1 border-b border-cyan-500/20">
      
      <!-- Primary Tabs -->
      <div class="flex items-center gap-2">
        <button
          @click="activeViewTab = 'campaigns'"
          class="flex items-center gap-2 px-4 py-2 text-xs font-black transition-all border"
          :class="activeViewTab === 'campaigns' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan' : 'bg-dark-900 text-slate-400 hover:text-white border-dark-800'"
        >
          <Layers class="w-4 h-4" />
          <span>[ LIVE CAMPAIGNS MONITOR ({{ filteredCampaigns.length }}) ]</span>
        </button>

        <button
          @click="activeViewTab = 'analytics'"
          class="flex items-center gap-2 px-4 py-2 text-xs font-black transition-all border"
          :class="activeViewTab === 'analytics' ? 'bg-copper-500/20 text-copper-300 border-copper-400 shadow-glow-copper' : 'bg-dark-900 text-slate-400 hover:text-white border-dark-800'"
        >
          <Activity class="w-4 h-4" />
          <span>[ 3D ORBITAL HOLOGRAM & CHARTS ]</span>
        </button>
      </div>

      <!-- Search & Layout Toggle (When Campaigns Tab is Active) -->
      <div v-if="activeViewTab === 'campaigns'" class="flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative">
          <Search class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama campaign / Meta ID..."
            class="bg-dark-900 border border-dark-750 text-white pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-cyan-400 w-52 sm:w-64"
          />
        </div>

        <!-- Filter Status Dropdown -->
        <select
          v-model="statusFilter"
          class="bg-dark-900 border border-dark-750 text-slate-300 text-xs px-2.5 py-1.5 outline-none focus:border-cyan-400"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">● Active Saja</option>
          <option value="PAUSED">⏸️ Paused Saja</option>
          <option value="test">Tahap 1: TEST</option>
          <option value="scale1">Tahap 2: SCALE 1</option>
          <option value="scale2">Tahap 3: SCALE 2</option>
        </select>

        <!-- Sort By Dropdown -->
        <select
          v-model="sortBy"
          class="bg-dark-900 border border-dark-750 text-slate-300 text-xs px-2.5 py-1.5 outline-none focus:border-cyan-400"
        >
          <option value="spend">Sort: Spend Tertinggi</option>
          <option value="roas">Sort: ROAS Tertinggi</option>
          <option value="purchases">Sort: Order Terbanyak</option>
          <option value="cpr">Sort: CPR Terendah</option>
          <option value="ctr">Sort: CTR Tertinggi</option>
        </select>

        <!-- View Mode: Card vs Table -->
        <div class="flex items-center border border-dark-750 bg-dark-900">
          <button
            @click="layoutMode = 'cards'"
            class="p-1.5 transition-colors"
            :class="layoutMode === 'cards' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'"
            title="Tampilan Kartu HUD"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
          <button
            @click="layoutMode = 'table'"
            class="p-1.5 transition-colors"
            :class="layoutMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-white'"
            title="Tampilan Tabel Telemetri Rinci"
          >
            <Table class="w-4 h-4" />
          </button>
        </div>

        <!-- Tombol Tambah Campaign -->
        <button
          @click="$emit('open-create-modal')"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-dark-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-glow-cyan"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>+ Campaign Baru</span>
        </button>
      </div>

    </div>


    <!-- ========================================================================= -->
    <!-- 4. VIEW CONTENT A: LIVE REAL-TIME CAMPAIGNS MONITOR                       -->
    <!-- ========================================================================= -->
    <div v-if="activeViewTab === 'campaigns'" class="space-y-4 font-mono">
      
      <!-- MODE A1: CARD MATRIX VIEW -->
      <div v-if="layoutMode === 'cards'" class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div
          v-for="camp in filteredCampaigns"
          :key="camp.id"
          class="hud-panel p-5 rounded-2xl space-y-4 relative overflow-hidden transition-all border"
          :class="[
            isCampaignActive(camp)
              ? 'border-cyan-500/40 hover:border-cyan-400 shadow-glow-cyan/15'
              : 'border-dark-750 opacity-80'
          ]"
        >
          <!-- Corner reticles -->
          <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" :class="isCampaignActive(camp) ? 'border-cyan-400' : 'border-slate-600'"></div>
          <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" :class="isCampaignActive(camp) ? 'border-copper-400' : 'border-slate-600'"></div>

          <!-- Card Header: Title, Status Toggle, Meta ID -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex flex-wrap items-center gap-2">
                <!-- Status Switch Button (1-Click Toggle Active / Paused) -->
                <button
                  @click="handleToggleStatus(camp)"
                  class="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all border"
                  :class="[
                    isCampaignActive(camp)
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-glow-teal hover:bg-emerald-900'
                      : 'bg-dark-900 text-amber-300 border-amber-500/40 hover:bg-amber-950'
                  ]"
                  :title="isCampaignActive(camp) ? 'Klik untuk Pause Campaign di Meta Ads' : 'Klik untuk Aktifkan Campaign di Meta Ads'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="isCampaignActive(camp) ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'"></span>
                  <span>{{ isCampaignActive(camp) ? 'ACTIVE' : 'PAUSED' }}</span>
                </button>

                <span class="text-[10px] px-2 py-0.5 bg-dark-900 text-cyan-300 border border-dark-750 font-bold">
                  {{ camp.status?.toUpperCase() }}
                </span>

                <span class="text-xs text-slate-400 font-bold">
                  {{ camp.meta_campaign_id || 'ID Pending' }}
                </span>
              </div>

              <h3 class="text-sm font-black text-white hover:text-cyan-300 transition-colors leading-snug">
                {{ camp.name }}
              </h3>
            </div>

            <!-- Stage Tag & Action Menu -->
            <div class="flex items-center gap-2 shrink-0">
              <button
                @click="expandedCampaignId = expandedCampaignId === camp.id ? null : camp.id"
                class="px-2.5 py-1 text-[10px] font-bold border transition-all"
                :class="expandedCampaignId === camp.id ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400' : 'bg-dark-900 text-slate-400 hover:text-white border-dark-750'"
              >
                <span>{{ expandedCampaignId === camp.id ? 'TUTUP ADSETS' : `LIHAT ADSETS (${camp.adsets?.length || 0})` }}</span>
              </button>
            </div>
          </div>

          <!-- Real-Time Budget Pacing Bar -->
          <div class="p-3 bg-dark-900/90 border border-dark-750 space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-bold">DAILY BUDGET PACING:</span>
              <span class="font-bold text-slate-200">
                <strong class="text-copper-400">{{ formatIDR(getCampSpend(camp)) }}</strong>
                / {{ formatIDR(camp.daily_budget || getCampSpend(camp)) }}
                ({{ getPacingPct(camp) }}%)
              </span>
            </div>
            <div class="w-full bg-dark-950 h-2 border border-dark-800">
              <div 
                class="h-full transition-all duration-500" 
                :class="[
                  getPacingPct(camp) > 95 ? 'bg-rose-500 shadow-glow-rose' :
                  getPacingPct(camp) > 75 ? 'bg-copper-400 shadow-glow-copper' :
                  'bg-cyan-400 shadow-glow-cyan'
                ]"
                :style="{ width: `${Math.min(100, getPacingPct(camp))}%` }"
              ></div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-500">
              <span>PACE STATUS: <strong class="text-cyan-300">{{ getPacingStatus(camp) }}</strong></span>
              <span>OBJECTIVE: <strong>OUTCOME_SALES</strong></span>
            </div>
          </div>

          <!-- Live Primary Metric Grid (6-cell) -->
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <div class="p-2 bg-dark-950 border border-dark-800">
              <span class="text-[9px] text-slate-500 uppercase block">LIVE PURCHASES</span>
              <span class="text-base font-black text-emerald-400">{{ getCampPurchases(camp) }} Orders</span>
            </div>

            <div class="p-2 bg-dark-950 border border-dark-800">
              <span class="text-[9px] text-slate-500 uppercase block">ACTUAL CPR</span>
              <span 
                class="text-base font-black truncate block"
                :class="getCampCpr(camp) <= (camp.base_price * 0.25) ? 'text-emerald-400' : 'text-copper-400'"
              >
                {{ formatIDR(getCampCpr(camp)) }}
              </span>
            </div>

            <div class="p-2 bg-dark-950 border border-dark-800">
              <span class="text-[9px] text-slate-500 uppercase block">LIVE ROAS</span>
              <div class="flex items-center justify-center gap-1">
                <Flame class="w-3.5 h-3.5 text-copper-400" />
                <span class="text-base font-black text-copper-300">{{ getCampRoas(camp).toFixed(2) }}x</span>
              </div>
            </div>

            <div class="p-2 bg-dark-950 border border-dark-800">
              <span class="text-[9px] text-slate-500 uppercase block">GROSS REVENUE</span>
              <span class="text-xs font-black text-cyan-300 truncate block">{{ formatIDR(getCampRevenue(camp)) }}</span>
            </div>

            <div class="p-2 bg-dark-950 border border-dark-800">
              <span class="text-[9px] text-slate-500 uppercase block">NETT PROFIT</span>
              <span class="text-xs font-black text-emerald-400 truncate block">{{ formatIDR(getCampNett(camp)) }}</span>
            </div>

            <div class="p-2 bg-dark-950 border border-dark-800">
              <span class="text-[9px] text-slate-500 uppercase block">CTR (LINK CLICKS)</span>
              <span 
                class="text-xs font-black block"
                :class="getCampCtr(camp) >= 2.0 ? 'text-cyan-300' : 'text-amber-400'"
              >
                {{ getCampCtr(camp).toFixed(2) }}%
              </span>
            </div>
          </div>

          <!-- Expandable Live Ad Sets Drawer -->
          <div 
            v-if="expandedCampaignId === camp.id" 
            class="pt-3 border-t border-cyan-500/20 space-y-2 bg-dark-950/60 p-3 rounded border border-dark-800 text-xs"
          >
            <div class="flex items-center justify-between text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              <span>LIVE AD SETS TELEMETRY ({{ camp.adsets?.length || 0 }})</span>
              <span>META GRAPH INSIGHTS</span>
            </div>

            <div 
              v-for="ad in camp.adsets" 
              :key="ad.id"
              class="p-2.5 bg-dark-900 border border-dark-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span 
                    class="w-2 h-2 rounded-full"
                    :class="ad.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'"
                  ></span>
                  <span class="font-bold text-white">{{ ad.name }}</span>
                  <span class="text-[10px] text-slate-500 font-mono">({{ ad.meta_adset_id }})</span>
                </div>
                <div class="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                  <span>Spend: <strong class="text-copper-300">{{ formatIDR(ad.metrics?.spend || 0) }}</strong></span>
                  <span>Clicks: <strong class="text-white">{{ ad.metrics?.clicks || 0 }}</strong></span>
                  <span>Orders: <strong class="text-emerald-400">{{ ad.metrics?.purchases || 0 }}</strong></span>
                  <span>ROAS: <strong class="text-copper-400">{{ ((ad.metrics?.revenue || 0) / (ad.metrics?.spend || 1)).toFixed(2) }}x</strong></span>
                </div>
              </div>

              <!-- AdSet Action: Pause / Resume -->
              <button
                @click="handleToggleAdsetStatus(camp.id, ad.id, ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')"
                class="px-2 py-1 text-[10px] font-bold border transition-colors shrink-0"
                :class="ad.status === 'ACTIVE' ? 'bg-rose-950/60 text-rose-300 border-rose-500/30 hover:bg-rose-900' : 'bg-emerald-950 text-emerald-300 border-emerald-500/30'"
              >
                {{ ad.status === 'ACTIVE' ? 'PAUSE ADSET' : 'ACTIVATE' }}
              </button>
            </div>
          </div>

          <!-- Bottom Micro Ticker: CPM, CPC, Frequency -->
          <div class="pt-2 border-t border-dark-750 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
            <span>CPM: <strong class="text-slate-300">{{ formatIDR(getCampCpm(camp)) }}</strong> (T: ≤ Rp32k)</span>
            <span>CPC: <strong class="text-slate-300">{{ formatIDR(getCampCpc(camp)) }}</strong></span>
            <span>FREQ: <strong class="text-slate-300">{{ getCampFrequency(camp).toFixed(2) }}</strong> (&lt; 3.0)</span>
          </div>
        </div>
      </div>

      <!-- MODE A2: DENSE TELEMETRY TABLE VIEW -->
      <div v-else class="hud-panel rounded-2xl overflow-hidden border border-cyan-500/30">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-dark-900 text-slate-400 border-b border-dark-750 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th class="p-3">STATUS</th>
                <th class="p-3">NAMA CAMPAIGN</th>
                <th class="p-3">DAILY BUDGET</th>
                <th class="p-3">SPEND TODAY</th>
                <th class="p-3">IMPR / CLICKS</th>
                <th class="p-3">CTR</th>
                <th class="p-3">ORDERS</th>
                <th class="p-3">ACTUAL CPR</th>
                <th class="p-3">REVENUE</th>
                <th class="p-3">NETT PROFIT</th>
                <th class="p-3">ROAS</th>
                <th class="p-3 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dark-800">
              <tr 
                v-for="camp in filteredCampaigns" 
                :key="camp.id"
                class="hover:bg-cyan-950/20 transition-colors"
              >
                <td class="p-3">
                  <button
                    @click="handleToggleStatus(camp)"
                    class="px-2 py-0.5 text-[10px] font-bold border uppercase"
                    :class="isCampaignActive(camp) ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60' : 'bg-dark-900 text-amber-300 border-amber-500/40'"
                  >
                    {{ isCampaignActive(camp) ? 'ACTIVE' : 'PAUSED' }}
                  </button>
                </td>
                <td class="p-3 font-bold text-white max-w-[220px] truncate" :title="camp.name">
                  <span>{{ camp.name }}</span>
                  <span class="block text-[10px] text-slate-500 font-mono">{{ camp.meta_campaign_id }}</span>
                </td>
                <td class="p-3 text-slate-300">{{ formatIDR(camp.daily_budget || getCampSpend(camp)) }}</td>
                <td class="p-3 font-bold text-copper-300">{{ formatIDR(getCampSpend(camp)) }}</td>
                <td class="p-3 text-slate-300 text-[11px]">
                  {{ getCampImpressions(camp).toLocaleString('id-ID') }} / {{ getCampClicks(camp).toLocaleString('id-ID') }}
                </td>
                <td class="p-3 font-bold" :class="getCampCtr(camp) >= 2.0 ? 'text-cyan-300' : 'text-amber-400'">
                  {{ getCampCtr(camp).toFixed(2) }}%
                </td>
                <td class="p-3 font-bold text-emerald-400">{{ getCampPurchases(camp) }}</td>
                <td class="p-3 font-bold" :class="getCampCpr(camp) <= (camp.base_price * 0.25) ? 'text-emerald-400' : 'text-copper-400'">
                  {{ formatIDR(getCampCpr(camp)) }}
                </td>
                <td class="p-3 font-bold text-cyan-300">{{ formatIDR(getCampRevenue(camp)) }}</td>
                <td class="p-3 font-bold text-emerald-400">{{ formatIDR(getCampNett(camp)) }}</td>
                <td class="p-3 font-black text-copper-300">{{ getCampRoas(camp).toFixed(2) }}x</td>
                <td class="p-3 text-right">
                  <button
                    @click="expandedCampaignId = expandedCampaignId === camp.id ? null : camp.id"
                    class="px-2 py-1 text-[10px] font-bold border border-dark-750 text-slate-300 hover:text-white"
                  >
                    {{ expandedCampaignId === camp.id ? 'Tutup' : 'Rincian' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>


    <!-- ========================================================================= -->
    <!-- 5. VIEW CONTENT B: 3D HOLOGRAPHIC GLOBE & GLOBAL PERFORMANCE TRENDS       -->
    <!-- ========================================================================= -->
    <div v-else class="space-y-6">
      
      <!-- 3D Holographic Globe Centerpiece -->
      <HoloGlobeHUD />

      <!-- Area Chart: Spend vs Revenue vs Profit (Chart.js) -->
      <div class="hud-panel p-6 rounded-2xl space-y-4 font-mono border-cyan-500/30">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-400">[ HISTORICAL PERFORMANCE TRENDS ]</span>
            <h3 class="text-base font-extrabold text-white">Ad Spend, Gross Revenue & Nett Profit</h3>
          </div>

          <div class="flex items-center gap-4 text-xs">
            <span class="flex items-center gap-1.5 text-cyan-300">
              <span class="w-2.5 h-2.5 bg-cyan-400 shadow-glow-cyan"></span> Revenue
            </span>
            <span class="flex items-center gap-1.5 text-emerald-300">
              <span class="w-2.5 h-2.5 bg-emerald-400 shadow-glow-teal"></span> Nett Profit
            </span>
            <span class="flex items-center gap-1.5 text-copper-400">
              <span class="w-2.5 h-2.5 bg-copper-500 shadow-glow-copper"></span> Ad Spend
            </span>
          </div>
        </div>

        <div class="h-[340px] w-full relative">
          <canvas ref="mainChartCanvas"></canvas>
        </div>
      </div>

      <!-- Secondary Chart: Conversion Funnel & Ratio Trend -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        <!-- Trend Ratio Chart -->
        <div class="hud-panel p-5 rounded-2xl space-y-3 border-copper-500/30">
          <span class="text-[10px] uppercase text-copper-400 font-bold block">[ ROAS & CPR HEALTH VECTOR ]</span>
          <h4 class="text-sm font-bold text-white">Tren Rasio ROAS vs CPR</h4>
          <div class="h-[240px] w-full relative">
            <canvas ref="ratioChartCanvas"></canvas>
          </div>
        </div>

        <!-- Conversion Funnel Barometer -->
        <div class="hud-panel p-5 rounded-2xl space-y-3 border-cyan-500/30">
          <span class="text-[10px] uppercase text-cyan-400 font-bold block">[ FUNNEL DROPOFF RATE // BENCHMARK ]</span>
          <h4 class="text-sm font-bold text-white">Full-Funnel Conversion Velocity</h4>

          <div class="space-y-3 pt-2 text-xs">
            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>1. Impressions → Clicks (CTR):</span>
                <span class="text-cyan-400 font-bold">2.68% (Target > 2.0%)</span>
              </div>
              <div class="w-full bg-dark-950 h-2 border border-dark-750">
                <div class="bg-cyan-400 h-full shadow-glow-cyan" style="width: 85%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>2. Clicks → Landing Page (LC to LPV):</span>
                <span class="text-cyan-300 font-bold">84.2% (Target ≥ 80%)</span>
              </div>
              <div class="w-full bg-dark-950 h-2 border border-dark-750">
                <div class="bg-cyan-300 h-full shadow-glow-cyan" style="width: 84%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>3. Landing Page → Cart (LPV to ATC):</span>
                <span class="text-copper-400 font-bold">41.6% (Target ≥ 40%)</span>
              </div>
              <div class="w-full bg-dark-950 h-2 border border-dark-750">
                <div class="bg-copper-400 h-full shadow-glow-copper" style="width: 72%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>4. Cart → Checkout (ATC to IC):</span>
                <span class="text-copper-300 font-bold">33.5% (Target ≥ 30%)</span>
              </div>
              <div class="w-full bg-dark-950 h-2 border border-dark-750">
                <div class="bg-copper-500 h-full shadow-glow-copper" style="width: 65%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-1">
                <span>5. Checkout → Purchase (Closing Rate):</span>
                <span class="text-emerald-400 font-bold">83.4% (Target ≥ 82%)</span>
              </div>
              <div class="w-full bg-dark-950 h-2 border border-dark-750">
                <div class="bg-emerald-400 h-full" style="width: 83%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { 
  Radio, 
  RefreshCw, 
  Clock, 
  Settings, 
  Terminal, 
  Flame, 
  Layers, 
  Activity, 
  Search, 
  LayoutGrid, 
  Table, 
  Plus 
} from 'lucide-vue-next';
import Chart from 'chart.js/auto';
import HoloGlobeHUD from './HoloGlobeHUD.vue';
import { useMetaSync } from '../composables/useMetaSync';
import { formatIDR } from '../utils/currency';

const props = defineProps({
  campaigns: {
    type: Array,
    required: true
  },
  chartData: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'trigger-sync', 
  'update-status', 
  'pause-adset', 
  'open-create-modal', 
  'open-settings'
]);

// Real-Time Meta Sync Composable
const {
  isSyncing,
  lastSyncedAt,
  syncMode,
  accountId,
  autoSyncInterval,
  countdown,
  syncLogs,
  triggerSync,
  setPollingInterval,
  toggleCampaignStatusOnMeta
} = useMetaSync(() => {
  emit('trigger-sync');
});

// UI State
const activeViewTab = ref('campaigns'); // 'campaigns' | 'analytics'
const layoutMode = ref('cards'); // 'cards' | 'table'
const showLogsDrawer = ref(false);
const searchQuery = ref('');
const statusFilter = ref('ALL');
const sortBy = ref('spend');
const expandedCampaignId = ref(null);

// Metric Aggregate Calculations
const totalSpend = computed(() => {
  return props.campaigns.reduce((sum, camp) => sum + getCampSpend(camp), 0);
});

const totalRevenue = computed(() => {
  return props.campaigns.reduce((sum, camp) => sum + getCampRevenue(camp), 0);
});

const totalPurchases = computed(() => {
  return props.campaigns.reduce((sum, camp) => sum + getCampPurchases(camp), 0);
});

const totalDailyBudget = computed(() => {
  return props.campaigns.reduce((sum, camp) => sum + (camp.daily_budget || getCampSpend(camp)), 0);
});

const totalNett = computed(() => {
  return props.campaigns.reduce((sum, camp) => sum + getCampNett(camp), 0);
});

const overallRoas = computed(() => {
  return totalSpend.value > 0 ? totalRevenue.value / totalSpend.value : 0;
});

const avgCpr = computed(() => {
  return totalPurchases.value > 0 ? totalSpend.value / totalPurchases.value : 0;
});

const grossMarginPct = computed(() => {
  return totalRevenue.value > 0 ? (totalNett.value / totalRevenue.value) * 100 : 0;
});

const activeCampaignsCount = computed(() => {
  return props.campaigns.filter(c => isCampaignActive(c)).length;
});

// Filtered & Sorted Campaigns
const filteredCampaigns = computed(() => {
  let list = [...props.campaigns];

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.meta_campaign_id && c.meta_campaign_id.toLowerCase().includes(q))
    );
  }

  if (statusFilter.value === 'ACTIVE') {
    list = list.filter(c => isCampaignActive(c));
  } else if (statusFilter.value === 'PAUSED') {
    list = list.filter(c => !isCampaignActive(c));
  } else if (statusFilter.value !== 'ALL') {
    list = list.filter(c => c.status === statusFilter.value);
  }

  // Sorting
  list.sort((a, b) => {
    if (sortBy.value === 'spend') return getCampSpend(b) - getCampSpend(a);
    if (sortBy.value === 'roas') return getCampRoas(b) - getCampRoas(a);
    if (sortBy.value === 'purchases') return getCampPurchases(b) - getCampPurchases(a);
    if (sortBy.value === 'cpr') return getCampCpr(a) - getCampCpr(b);
    if (sortBy.value === 'ctr') return getCampCtr(b) - getCampCtr(a);
    return 0;
  });

  return list;
});

// Campaign Field Extraction Helpers
function isCampaignActive(camp) {
  return camp.status !== 'paused' && (camp.adsets?.some(a => a.status === 'ACTIVE') ?? true);
}

function getCampSpend(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 0;
  return camp.adsets.reduce((sum, a) => sum + (a.metrics?.spend || 0), 0);
}

function getCampRevenue(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 0;
  return camp.adsets.reduce((sum, a) => sum + (a.metrics?.revenue || 0), 0);
}

function getCampPurchases(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 0;
  return camp.adsets.reduce((sum, a) => sum + (a.metrics?.purchases || 0), 0);
}

function getCampImpressions(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 0;
  return camp.adsets.reduce((sum, a) => sum + (a.metrics?.impressions || 0), 0);
}

function getCampClicks(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 0;
  return camp.adsets.reduce((sum, a) => sum + (a.metrics?.clicks || 0), 0);
}

function getCampRoas(camp) {
  const spend = getCampSpend(camp);
  const rev = getCampRevenue(camp);
  return spend > 0 ? rev / spend : 0;
}

function getCampCpr(camp) {
  const spend = getCampSpend(camp);
  const pur = getCampPurchases(camp);
  return pur > 0 ? spend / pur : 0;
}

function getCampCtr(camp) {
  const imps = getCampImpressions(camp);
  const clicks = getCampClicks(camp);
  return imps > 0 ? (clicks / imps) * 100 : 0;
}

function getCampCpc(camp) {
  const spend = getCampSpend(camp);
  const clicks = getCampClicks(camp);
  return clicks > 0 ? spend / clicks : 0;
}

function getCampCpm(camp) {
  const spend = getCampSpend(camp);
  const imps = getCampImpressions(camp);
  return imps > 0 ? (spend / imps) * 1000 : 0;
}

function getCampFrequency(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 1.0;
  const totalFreq = camp.adsets.reduce((sum, a) => sum + (a.metrics?.frequency || 1.0), 0);
  return totalFreq / camp.adsets.length;
}

function getCampNett(camp) {
  const rev = getCampRevenue(camp);
  const spend = getCampSpend(camp);
  const pur = getCampPurchases(camp);
  const cogs = Number(camp.cogs || 0);
  return rev - (pur * cogs) - spend;
}

function getPacingPct(camp) {
  const spend = getCampSpend(camp);
  const budget = camp.daily_budget || spend || 1;
  return Math.min(100, Math.round((spend / budget) * 100));
}

function getPacingStatus(camp) {
  const pct = getPacingPct(camp);
  if (pct >= 95) return '100% CAPPED';
  if (pct >= 75) return 'OPTIMAL PACING';
  if (pct >= 40) return 'STEADY DELIVERY';
  return 'EARLY PACING';
}

// 1-Click Status Toggle Handler
const handleToggleStatus = async (camp) => {
  const newStatus = isCampaignActive(camp) ? 'paused' : 'scale1';
  emit('update-status', { campaignId: camp.id, nextStage: newStatus });
  if (camp.meta_campaign_id) {
    await toggleCampaignStatusOnMeta(camp.meta_campaign_id, newStatus === 'paused' ? 'PAUSED' : 'ACTIVE');
  }
};

const handleToggleAdsetStatus = (campaignId, adsetId, status) => {
  emit('pause-adset', { campaignId, adsetId });
};

// Canvas Chart.js Initialization for Analytics Tab
const mainChartCanvas = ref(null);
const ratioChartCanvas = ref(null);
let mainChartInstance = null;
let ratioChartInstance = null;

const renderCharts = () => {
  if (activeViewTab.value !== 'analytics') return;

  const data = props.chartData && props.chartData.length > 0 
    ? props.chartData 
    : [
        { date: '25 Okt', spend: 4500000, revenue: 38000000, nett: 24000000, roas: 8.44, cpr: 21000 },
        { date: '26 Okt', spend: 6200000, revenue: 56000000, nett: 36000000, roas: 9.03, cpr: 19500 },
        { date: '27 Okt', spend: 7800000, revenue: 78000000, nett: 52000000, roas: 10.0, cpr: 17200 },
        { date: '28 Okt', spend: 8900000, revenue: 94000000, nett: 64000000, roas: 10.56, cpr: 15800 },
        { date: '29 Okt', spend: 9500000, revenue: 112000000, nett: 78000000, roas: 11.78, cpr: 14200 },
        { date: '30 Okt', spend: 10500000, revenue: 129722000, nett: 91068000, roas: 12.35, cpr: 13427 },
      ];

  const labels = data.map(d => d.date);

  // Main Chart
  if (mainChartCanvas.value) {
    if (mainChartInstance) mainChartInstance.destroy();
    const ctx = mainChartCanvas.value.getContext('2d');

    const gradRev = ctx.createLinearGradient(0, 0, 0, 320);
    gradRev.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
    gradRev.addColorStop(1, 'rgba(0, 240, 255, 0)');

    const gradNett = ctx.createLinearGradient(0, 0, 0, 320);
    gradNett.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    gradNett.addColorStop(1, 'rgba(16, 185, 129, 0)');

    mainChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Gross Revenue',
            data: data.map(d => d.revenue),
            borderColor: '#00F0FF',
            backgroundColor: gradRev,
            borderWidth: 2.2,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Nett Profit',
            data: data.map(d => d.nett),
            borderColor: '#10B981',
            backgroundColor: gradNett,
            borderWidth: 2,
            fill: true,
            tension: 0.35
          },
          {
            label: 'Ad Spend',
            data: data.map(d => d.spend),
            borderColor: '#F97316',
            borderWidth: 1.8,
            borderDash: [4, 4],
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(36, 55, 85, 0.4)' }, ticks: { color: '#94a3b8', font: { family: 'monospace' } } },
          y: { grid: { color: 'rgba(36, 55, 85, 0.4)' }, ticks: { color: '#94a3b8', font: { family: 'monospace' }, callback: (v) => formatIDR(v) } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // Ratio Chart
  if (ratioChartCanvas.value) {
    if (ratioChartInstance) ratioChartInstance.destroy();
    const ctx2 = ratioChartCanvas.value.getContext('2d');
    ratioChartInstance = new Chart(ctx2, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'ROAS (x)',
            data: data.map(d => d.roas),
            borderColor: '#F97316',
            borderWidth: 2.5,
            yAxisID: 'y'
          },
          {
            label: 'CPR (Rp)',
            data: data.map(d => d.cpr),
            borderColor: '#00F0FF',
            borderWidth: 1.8,
            borderDash: [5, 5],
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(36, 55, 85, 0.3)' }, ticks: { color: '#94a3b8' } },
          y: { position: 'left', ticks: { color: '#F97316', callback: v => `${v}x` }, grid: { display: false } },
          y1: { position: 'right', ticks: { color: '#00F0FF', callback: v => `Rp ${v/1000}k` }, grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }
};

watch(activeViewTab, () => {
  setTimeout(() => renderCharts(), 100);
});

onMounted(() => {
  renderCharts();
});
</script>

<style scoped>
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spinSlow 8s linear infinite;
}
</style>
