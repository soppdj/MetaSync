<template>
  <div class="space-y-5 font-mono">

    <!-- ========================================================================= -->
    <!-- 1. TOP CONTROL BAR: METASYNC REAL-TIME SYNC & CONTROLS                    -->
    <!-- ========================================================================= -->
    <div class="hud-panel p-4 rounded-2xl relative overflow-hidden border-cyan-500/30">
      <div class="scanline-effect"></div>

      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        <!-- Left: Branding & Status -->
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-10 h-10 bg-dark-950 border border-cyan-400 shadow-glow-cyan p-1 shrink-0 hud-corner">
            <RefreshCw class="w-5 h-5 text-cyan-400" :class="{ 'animate-spin': isSyncing }" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-black text-white tracking-wider">
                [ METASYNC // REAL-TIME META ADS KPI TABLE ]
              </h2>
              <span 
                class="text-[9px] px-2 py-0.5 border font-bold uppercase tracking-wider"
                :class="syncMode.startsWith('LIVE') ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50' : 'bg-dark-900 text-slate-400 border-dark-700'"
              >
                {{ syncMode.startsWith('LIVE') ? '● LIVE GRAPH v21.0' : '● OFFLINE (BELUM TERKONEKSI)' }}
              </span>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span class="text-cyan-300 font-bold">ACC: {{ accountId || 'Belum Dikonfigurasi' }}</span>
              <span>&bull;</span>
              <span>LAST SYNC: <strong class="text-white">{{ lastSyncedAt }}</strong></span>
              <span>&bull;</span>
              <span class="text-emerald-400 font-bold">10 KPI DYNAMIC ENGINE</span>
            </div>
          </div>
        </div>

        <!-- Right: Actions & Polling -->
        <div class="flex flex-wrap items-center gap-2.5">
          
          <!-- Auto-Sync Interval -->
          <div class="flex items-center gap-1.5 bg-dark-900 px-2 py-1 border border-cyan-500/30 text-[11px]">
            <span class="text-slate-400">AUTO-SYNC:</span>
            <select
              :value="autoSyncInterval"
              @change="setPollingInterval(Number($event.target.value))"
              class="bg-dark-950 text-cyan-300 font-bold border-none outline-none cursor-pointer py-0.5"
            >
              <option :value="10">⚡ 10s</option>
              <option :value="20">🔄 20s</option>
              <option :value="60">⏳ 60s</option>
              <option :value="0">⏸️ Off</option>
            </select>
          </div>

          <!-- Countdown -->
          <div 
            v-if="autoSyncInterval > 0"
            class="flex items-center gap-1 px-2.5 py-1 bg-dark-900 border border-copper-500/30 text-copper-300 text-[11px] font-bold"
          >
            <Clock class="w-3.5 h-3.5" />
            <span>{{ countdown }}s</span>
          </div>

          <!-- Trigger Sync -->
          <button
            @click="triggerSync"
            :disabled="isSyncing"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-dark-950 bg-gradient-to-r from-brand-400 to-cyan-300 hover:opacity-90 transition-all shadow-glow-cyan disabled:opacity-50"
          >
            <RefreshCw class="w-3 h-3 text-dark-950" :class="{ 'animate-spin': isSyncing }" />
            <span>{{ isSyncing ? 'SYNCING...' : 'SYNC NOW' }}</span>
          </button>

          <!-- Settings Shortcut -->
          <button
            @click="$emit('open-settings')"
            class="p-1.5 bg-dark-900 text-slate-400 hover:text-white border border-dark-750 hover:border-cyan-500/40 transition-all"
            title="Pengaturan API Keys"
          >
            <Settings class="w-4 h-4" />
          </button>

        </div>

      </div>

      <!-- Filter & Search Toolbar -->
      <div class="mt-3 pt-3 border-t border-cyan-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Search -->
          <div class="relative">
            <Search class="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari campaign / Meta ID..."
              class="bg-dark-950 border border-dark-750 text-white pl-7 pr-3 py-1 text-xs focus:outline-none focus:border-cyan-400 w-52 sm:w-60"
            />
          </div>

          <!-- Status Filter -->
          <select
            v-model="statusFilter"
            class="bg-dark-950 border border-dark-750 text-slate-300 text-xs px-2 py-1 outline-none focus:border-cyan-400"
          >
            <option value="ALL">Semua Status ({{ campaigns.length }})</option>
            <option value="ACTIVE">● Active Saja</option>
            <option value="PAUSED">⏸️ Paused Saja</option>
            <option value="test">Tahap 1: TEST</option>
            <option value="scale1">Tahap 2: SCALE 1</option>
            <option value="scale2">Tahap 3: SCALE 2</option>
          </select>
        </div>

        <div class="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Menampilkan <strong>{{ filteredCampaigns.length }}</strong> Campaign</span>
          <span>&bull;</span>
          <span class="text-cyan-300 font-bold">10 KPI Target Validated</span>
        </div>
      </div>

    </div>


    <!-- ========================================================================= -->
    <!-- 2. KOTAK TABEL METASYNC: 10 KPI BERURUTAN MULAI DARI NAMA SAMPAI FREQUENCY -->
    <!-- ========================================================================= -->
    <div class="hud-panel rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse min-w-[1550px]">
          
          <!-- Table Header -->
          <thead class="bg-dark-900/95 text-slate-400 border-b border-dark-750 text-[10px] font-black uppercase tracking-wider sticky top-0 z-20">
            <tr>
              <th class="p-3 text-center w-12">STATUS</th>
              <th class="p-3 min-w-[200px]">NAMA CAMPAIGN</th>
              <th class="p-3 min-w-[130px]">SPEND (PACING)</th>

              <!-- RESULT, VALUE, ROAS DISEBELAH SPEND -->
              <th class="p-3 text-center min-w-[95px] bg-dark-850/80 text-emerald-300 border-l border-dark-800">
                RESULT<br><span class="text-[8px] font-normal text-slate-400">Purchases</span>
              </th>
              <th class="p-3 text-center min-w-[125px] bg-dark-850/80 text-cyan-300">
                VALUE<br><span class="text-[8px] font-normal text-slate-400">Gross Revenue</span>
              </th>
              <th class="p-3 text-center min-w-[95px] bg-dark-850/80 text-copper-300">
                ROAS<br><span class="text-[8px] font-normal text-slate-400">Return / Spend</span>
              </th>
              
              <!-- 10 KPI BERURUTAN -->
              <th class="p-3 text-center min-w-[95px] bg-cyan-950/20 text-cyan-300 border-l border-dark-800">
                1. CTR<br><span class="text-[8px] font-normal text-slate-400">&gt; 2.0%</span>
              </th>
              <th class="p-3 text-center min-w-[100px] bg-cyan-950/20 text-cyan-300">
                2. CPC<br><span class="text-[8px] font-normal text-slate-400">≤ 1% Harga</span>
              </th>
              <th class="p-3 text-center min-w-[100px] bg-cyan-950/20 text-cyan-300">
                3. LC TO LPV<br><span class="text-[8px] font-normal text-slate-400">≥ 80%</span>
              </th>
              <th class="p-3 text-center min-w-[105px] bg-cyan-950/20 text-cyan-300">
                4. COST LPV<br><span class="text-[8px] font-normal text-slate-400">≤ 2.5% Harga</span>
              </th>
              <th class="p-3 text-center min-w-[100px] bg-copper-950/20 text-copper-300 border-l border-dark-800">
                5. CPM<br><span class="text-[8px] font-normal text-slate-400">≤ Rp 32.000</span>
              </th>
              <th class="p-3 text-center min-w-[105px] bg-copper-950/20 text-copper-300">
                6. LPV TO ATC<br><span class="text-[8px] font-normal text-slate-400">≥ 40%</span>
              </th>
              <th class="p-3 text-center min-w-[100px] bg-copper-950/20 text-copper-300">
                7. ATC TO IC<br><span class="text-[8px] font-normal text-slate-400">≥ 30%</span>
              </th>
              <th class="p-3 text-center min-w-[115px] bg-emerald-950/20 text-emerald-300 border-l border-dark-800">
                8. CPR<br><span class="text-[8px] font-normal text-slate-400">≤ 25% Harga</span>
              </th>
              <th class="p-3 text-center min-w-[110px] bg-emerald-950/20 text-emerald-300">
                9. CLOSING RATE<br><span class="text-[8px] font-normal text-slate-400">≥ 82%</span>
              </th>
              <th class="p-3 text-center min-w-[95px] bg-purple-950/20 text-purple-300 border-l border-dark-800">
                10. FREQUENCY<br><span class="text-[8px] font-normal text-slate-400">&lt; 3.0</span>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-dark-800">
            <!-- Empty State Real Data Only -->
            <tr v-if="filteredCampaigns.length === 0">
              <td colspan="15" class="p-10 text-center text-slate-500 font-mono">
                <div class="flex flex-col items-center justify-center space-y-2.5">
                  <div class="w-10 h-10 rounded-xl bg-dark-950 border border-dark-800 flex items-center justify-center text-slate-500">
                    <Search class="w-5 h-5" />
                  </div>
                  <div class="text-xs font-bold text-slate-300 tracking-wider">[ TIDAK ADA KAMPANYE REAL AKTIF ]</div>
                  <p class="text-[11px] text-slate-500 max-w-md">
                    Seluruh sampel/dummy data telah dihapus. Silakan hubungkan Ad Account ID & Access Token di menu Pengaturan, atau buat kampanye baru untuk memantau metrik secara real.
                  </p>
                  <button
                    @click="$emit('open-settings')"
                    class="mt-1 px-3.5 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900 transition-all font-mono"
                  >
                    Buka Pengaturan API Meta Ads
                  </button>
                </div>
              </td>
            </tr>

            <tr 
              v-for="camp in filteredCampaigns" 
              :key="camp.id"
              class="hover:bg-cyan-950/20 transition-colors"
            >
              <!-- STATUS TOGGLE -->
              <td class="p-3 text-center">
                <button
                  @click="handleToggleStatus(camp)"
                  class="px-2 py-0.5 text-[9px] font-black border uppercase tracking-wider transition-all"
                  :class="[
                    isCampaignActive(camp)
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-glow-teal hover:bg-emerald-900'
                      : 'bg-dark-900 text-amber-300 border-amber-500/40 hover:bg-amber-950'
                  ]"
                  :title="isCampaignActive(camp) ? 'Klik untuk Pause di Meta Ads' : 'Klik untuk Aktifkan di Meta Ads'"
                >
                  {{ isCampaignActive(camp) ? 'ACTIVE' : 'PAUSED' }}
                </button>
              </td>

              <!-- NAMA CAMPAIGN -->
              <td class="p-3">
                <div class="flex items-center gap-1.5">
                  <span class="text-[9px] px-1.5 py-0.2 bg-dark-950 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                    {{ camp.status }}
                  </span>
                  <span class="font-bold text-white max-w-[200px] truncate" :title="camp.name">
                    {{ camp.name }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{{ camp.meta_campaign_id || 'ID Pending' }}</span>
                  <span>&bull;</span>
                  <span>Harga: {{ formatCompactIDR(camp.base_price) }}</span>
                </div>
              </td>

              <!-- SPEND & PACING -->
              <td class="p-3">
                <span class="font-bold text-copper-300 block">{{ formatIDR(getCampSpend(camp)) }}</span>
                <div class="w-full bg-dark-950 h-1.5 border border-dark-800 mt-1">
                  <div 
                    class="h-full bg-copper-400" 
                    :style="{ width: `${getPacingPct(camp)}%` }"
                  ></div>
                </div>
                <span class="text-[9px] text-slate-500 mt-0.5 block">
                  Pacing: {{ getPacingPct(camp) }}%
                </span>
              </td>

              <!-- RESULT (PURCHASES / CONVERSIONS) -->
              <td class="p-3 text-center border-l border-dark-800">
                <span class="text-xs font-black text-emerald-400 block">{{ calcMetrics(camp).purchases }}</span>
                <span class="text-[9px] text-slate-500 block">Orders</span>
              </td>

              <!-- VALUE (GROSS REVENUE) -->
              <td class="p-3 text-center">
                <span class="text-xs font-black text-cyan-300 block truncate">{{ formatIDR(calcMetrics(camp).revenue) }}</span>
                <span class="text-[9px] text-slate-500 block">Conversion Value</span>
              </td>

              <!-- ROAS (RETURN ON AD SPEND) -->
              <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <span 
                    class="text-xs font-black block"
                    :class="calcMetrics(camp).roas >= 4.0 ? 'text-copper-300' : calcMetrics(camp).roas >= 2.0 ? 'text-emerald-400' : 'text-amber-400'"
                  >
                    {{ calcMetrics(camp).roas.toFixed(2) }}x
                  </span>
                </div>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).roas >= 4.0 ? 'bg-copper-950/80 text-copper-300 border border-copper-500/40' : calcMetrics(camp).roas >= 2.0 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'"
                >
                  {{ calcMetrics(camp).roas >= 4.0 ? 'FIRE' : calcMetrics(camp).roas >= 2.0 ? 'PROFIT' : 'LOW' }}
                </span>
              </td>

              <!-- 1. CTR (Target: > 2.0%) -->
              <td class="p-3 text-center border-l border-dark-800">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).ctr >= 2.0 ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ calcMetrics(camp).ctr.toFixed(2) }}%
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).ctr >= 2.0 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'"
                >
                  {{ calcMetrics(camp).ctr >= 2.0 ? 'PASS' : 'WARN' }}
                </span>
              </td>

              <!-- 2. CPC (Target: <= 1% x Harga Jual) -->
              <td class="p-3 text-center">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).cpc <= (camp.base_price * 0.01) ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ formatIDR(calcMetrics(camp).cpc) }}
                </span>
                <span class="text-[9px] text-slate-500 block">
                  T: ≤ {{ formatCompactIDR(camp.base_price * 0.01) }}
                </span>
              </td>

              <!-- 3. LC TO LPV (Target: >= 80%) -->
              <td class="p-3 text-center">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).lcToLpv >= 80 ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ calcMetrics(camp).lcToLpv.toFixed(1) }}%
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).lcToLpv >= 80 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'"
                >
                  {{ calcMetrics(camp).lcToLpv >= 80 ? 'PASS' : 'DROP' }}
                </span>
              </td>

              <!-- 4. COST LPV (Target: <= 2.5% x Harga Jual) -->
              <td class="p-3 text-center">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).costLpv <= (camp.base_price * 0.025) ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ formatIDR(calcMetrics(camp).costLpv) }}
                </span>
                <span class="text-[9px] text-slate-500 block">
                  T: ≤ {{ formatCompactIDR(camp.base_price * 0.025) }}
                </span>
              </td>

              <!-- 5. CPM (Target: <= Rp 32.000) -->
              <td class="p-3 text-center border-l border-dark-800">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).cpm <= 32000 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ formatIDR(calcMetrics(camp).cpm) }}
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).cpm <= 32000 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'"
                >
                  {{ calcMetrics(camp).cpm <= 32000 ? 'GOOD' : 'HIGH' }}
                </span>
              </td>

              <!-- 6. LPV TO ATC (Target: >= 40%) -->
              <td class="p-3 text-center">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).lpvToAtc >= 40 ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ calcMetrics(camp).lpvToAtc.toFixed(1) }}%
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).lpvToAtc >= 40 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'"
                >
                  {{ calcMetrics(camp).lpvToAtc >= 40 ? 'PASS' : 'LOW' }}
                </span>
              </td>

              <!-- 7. ATC TO IC (Target: >= 30%) -->
              <td class="p-3 text-center">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).atcToIc >= 30 ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ calcMetrics(camp).atcToIc.toFixed(1) }}%
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).atcToIc >= 30 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'"
                >
                  {{ calcMetrics(camp).atcToIc >= 30 ? 'PASS' : 'WARN' }}
                </span>
              </td>

              <!-- 8. CPR (Target: <= 25% x Harga Jual) -->
              <td class="p-3 text-center border-l border-dark-800">
                <span 
                  class="text-xs font-black block"
                  :class="calcMetrics(camp).cpr <= (camp.base_price * 0.25) ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ formatIDR(calcMetrics(camp).cpr) }}
                </span>
                <span class="text-[9px] text-slate-500 block">
                  T: ≤ {{ formatCompactIDR(camp.base_price * 0.25) }}
                </span>
              </td>

              <!-- 9. CLOSING RATE (Target: >= 82%) -->
              <td class="p-3 text-center">
                <span 
                  class="text-xs font-bold block"
                  :class="calcMetrics(camp).closingRate >= 82 ? 'text-emerald-400' : 'text-amber-400'"
                >
                  {{ calcMetrics(camp).closingRate.toFixed(1) }}%
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).closingRate >= 82 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'"
                >
                  {{ calcMetrics(camp).closingRate >= 82 ? 'OPTIMAL' : 'BELOW' }}
                </span>
              </td>

              <!-- 10. FREQUENCY (DI PALING KANAN - Target: < 3.0) -->
              <td class="p-3 text-center border-l border-dark-800">
                <span 
                  class="text-xs font-black block"
                  :class="calcMetrics(camp).frequency < 3.0 ? 'text-cyan-300' : 'text-rose-400'"
                >
                  {{ calcMetrics(camp).frequency.toFixed(2) }}
                </span>
                <span 
                  class="text-[8px] px-1 py-0.2 rounded font-bold uppercase inline-block mt-0.5"
                  :class="calcMetrics(camp).frequency < 3.0 ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'"
                >
                  {{ calcMetrics(camp).frequency < 3.0 ? 'HEALTHY' : 'SATURATED' }}
                </span>
              </td>
            </tr>
          </tbody>

          <!-- Table Summary Footer -->
          <tfoot class="bg-dark-900/90 text-slate-300 border-t-2 border-cyan-500/40 text-[11px] font-bold">
            <tr>
              <td colspan="2" class="p-3 uppercase text-cyan-300 tracking-wider">
                TOTAL & RATA-RATA ({{ filteredCampaigns.length }} UNITS)
              </td>
              <td class="p-3 text-copper-300 font-mono">
                {{ formatIDR(summarySpend) }}
              </td>
              <!-- RESULT Total -->
              <td class="p-3 text-center text-emerald-400 border-l border-dark-800 font-mono">
                {{ summaryPurchases }} Orders
              </td>
              <!-- VALUE Total -->
              <td class="p-3 text-center text-cyan-300 font-mono truncate">
                {{ formatIDR(summaryRevenue) }}
              </td>
              <!-- ROAS Avg -->
              <td class="p-3 text-center text-copper-300 font-mono">
                {{ summaryRoas.toFixed(2) }}x
              </td>
              <!-- CTR Avg -->
              <td class="p-3 text-center text-cyan-300 border-l border-dark-800">
                {{ summaryCtr.toFixed(2) }}%
              </td>
              <!-- CPC Avg -->
              <td class="p-3 text-center text-slate-200">
                {{ formatIDR(summaryCpc) }}
              </td>
              <!-- LC to LPV Avg -->
              <td class="p-3 text-center text-slate-200">
                {{ summaryLcToLpv.toFixed(1) }}%
              </td>
              <!-- Cost LPV Avg -->
              <td class="p-3 text-center text-slate-200">
                {{ formatIDR(summaryCostLpv) }}
              </td>
              <!-- CPM Avg -->
              <td class="p-3 text-center text-copper-300 border-l border-dark-800">
                {{ formatIDR(summaryCpm) }}
              </td>
              <!-- LPV to ATC Avg -->
              <td class="p-3 text-center text-slate-200">
                {{ summaryLpvToAtc.toFixed(1) }}%
              </td>
              <!-- ATC to IC Avg -->
              <td class="p-3 text-center text-slate-200">
                {{ summaryAtcToIc.toFixed(1) }}%
              </td>
              <!-- CPR Avg -->
              <td class="p-3 text-center text-emerald-400 border-l border-dark-800">
                {{ formatIDR(summaryCpr) }}
              </td>
              <!-- Closing Rate Avg -->
              <td class="p-3 text-center text-emerald-300">
                {{ summaryClosingRate.toFixed(1) }}%
              </td>
              <!-- Frequency Avg (di paling kanan) -->
              <td class="p-3 text-center text-cyan-300 border-l border-dark-800">
                {{ summaryFrequency.toFixed(2) }}
              </td>
            </tr>
          </tfoot>

        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  RefreshCw, 
  Clock, 
  Settings, 
  Search 
} from 'lucide-vue-next';
import { useMetaSync } from '../composables/useMetaSync';
import { formatIDR, formatCompactIDR } from '../utils/currency';

const props = defineProps({
  campaigns: {
    type: Array,
    required: true
  }
});

const emit = defineEmits([
  'trigger-sync', 
  'update-status', 
  'pause-adset', 
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
  triggerSync,
  setPollingInterval,
  toggleCampaignStatusOnMeta
} = useMetaSync();

// UI State
const searchQuery = ref('');
const statusFilter = ref('ALL');

// Helpers: Check if campaign active
function isCampaignActive(camp) {
  return camp.status !== 'paused' && (camp.adsets?.some(a => a.status === 'ACTIVE') ?? true);
}

function getCampSpend(camp) {
  if (!camp.adsets || camp.adsets.length === 0) return 0;
  return camp.adsets.reduce((sum, a) => sum + (a.metrics?.spend || 0), 0);
}

function getPacingPct(camp) {
  const spend = getCampSpend(camp);
  const budget = camp.daily_budget || spend || 1;
  return Math.min(100, Math.round((spend / budget) * 100));
}

// Compute the 10 KPIs per campaign
function calcMetrics(camp) {
  const adsets = camp.adsets || [];
  const spend = adsets.reduce((sum, a) => sum + (a.metrics?.spend || 0), 0);
  const impressions = adsets.reduce((sum, a) => sum + (a.metrics?.impressions || 0), 0);
  const clicks = adsets.reduce((sum, a) => sum + (a.metrics?.clicks || 0), 0);
  const lpv = adsets.reduce((sum, a) => sum + (a.metrics?.lpv || 0), 0);
  const atc = adsets.reduce((sum, a) => sum + (a.metrics?.atc || 0), 0);
  const ic = adsets.reduce((sum, a) => sum + (a.metrics?.ic || 0), 0);
  const purchases = adsets.reduce((sum, a) => sum + (a.metrics?.purchases || 0), 0);
  const revenue = adsets.reduce((sum, a) => sum + (a.metrics?.revenue || (a.metrics?.purchases || 0) * (camp.base_price || 0)), 0);
  const roas = spend > 0 ? revenue / spend : 0;
  const frequencySum = adsets.reduce((sum, a) => sum + (a.metrics?.frequency || 1.0), 0);

  // 1. CTR: Link Clicks / Impressions * 100
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  // 2. CPC: Spend / Clicks
  const cpc = clicks > 0 ? spend / clicks : 0;
  // 3. LC to LPV: LPV / Clicks * 100
  const lcToLpv = clicks > 0 ? (lpv / clicks) * 100 : 0;
  // 4. Cost LPV: Spend / LPV
  const costLpv = lpv > 0 ? spend / lpv : 0;
  // 5. CPM: Spend / Impressions * 1000
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  // 6. LPV to ATC: ATC / LPV * 100
  const lpvToAtc = lpv > 0 ? (atc / lpv) * 100 : 0;
  // 7. ATC to IC: IC / ATC * 100
  const atcToIc = atc > 0 ? (ic / atc) * 100 : 0;
  // 8. CPR: Spend / Purchases
  const cpr = purchases > 0 ? spend / purchases : 0;
  // 9. Closing Rate: Purchases / IC * 100
  const closingRate = ic > 0 ? (purchases / ic) * 100 : 0;
  // 10. Frequency
  const frequency = adsets.length > 0 ? frequencySum / adsets.length : 1.0;

  return {
    spend,
    impressions,
    clicks,
    lpv,
    atc,
    ic,
    purchases,
    revenue,
    roas,
    ctr,
    cpc,
    lcToLpv,
    costLpv,
    cpm,
    lpvToAtc,
    atcToIc,
    cpr,
    closingRate,
    frequency
  };
}

// Filtered Campaigns
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

  return list;
});

// Summary Aggregates
const summarySpend = computed(() => {
  return filteredCampaigns.value.reduce((sum, c) => sum + getCampSpend(c), 0);
});

const summaryPurchases = computed(() => {
  return filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).purchases, 0);
});

const summaryRevenue = computed(() => {
  return filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).revenue, 0);
});

const summaryRoas = computed(() => {
  return summarySpend.value > 0 ? summaryRevenue.value / summarySpend.value : 0;
});

const summaryCtr = computed(() => {
  const totImps = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).impressions, 0);
  const totClicks = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).clicks, 0);
  return totImps > 0 ? (totClicks / totImps) * 100 : 0;
});

const summaryCpc = computed(() => {
  const totClicks = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).clicks, 0);
  return totClicks > 0 ? summarySpend.value / totClicks : 0;
});

const summaryLcToLpv = computed(() => {
  const totClicks = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).clicks, 0);
  const totLpv = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).lpv, 0);
  return totClicks > 0 ? (totLpv / totClicks) * 100 : 0;
});

const summaryCostLpv = computed(() => {
  const totLpv = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).lpv, 0);
  return totLpv > 0 ? summarySpend.value / totLpv : 0;
});

const summaryCpm = computed(() => {
  const totImps = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).impressions, 0);
  return totImps > 0 ? (summarySpend.value / totImps) * 1000 : 0;
});

const summaryLpvToAtc = computed(() => {
  const totLpv = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).lpv, 0);
  const totAtc = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).atc, 0);
  return totLpv > 0 ? (totAtc / totLpv) * 100 : 0;
});

const summaryAtcToIc = computed(() => {
  const totAtc = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).atc, 0);
  const totIc = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).ic, 0);
  return totAtc > 0 ? (totIc / totAtc) * 100 : 0;
});

const summaryCpr = computed(() => {
  const totPur = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).purchases, 0);
  return totPur > 0 ? summarySpend.value / totPur : 0;
});

const summaryClosingRate = computed(() => {
  const totIc = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).ic, 0);
  const totPur = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).purchases, 0);
  return totIc > 0 ? (totPur / totIc) * 100 : 0;
});

const summaryFrequency = computed(() => {
  if (filteredCampaigns.value.length === 0) return 1.0;
  const totFreq = filteredCampaigns.value.reduce((sum, c) => sum + calcMetrics(c).frequency, 0);
  return totFreq / filteredCampaigns.value.length;
});

// Toggle status handler
const handleToggleStatus = async (camp) => {
  const newStatus = isCampaignActive(camp) ? 'paused' : 'scale1';
  emit('update-status', { campaignId: camp.id, nextStage: newStatus });
  if (camp.meta_campaign_id) {
    await toggleCampaignStatusOnMeta(camp.meta_campaign_id, newStatus === 'paused' ? 'PAUSED' : 'ACTIVE');
  }
};
</script>
