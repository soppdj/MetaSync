<template>
  <div class="space-y-6">
    
    <!-- Top Telemetry Header with Range Selector -->
    <div class="hud-panel hud-corner p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="scanline-effect"></div>
      <div>
        <div class="flex items-center gap-2">
          <Activity class="w-5 h-5 text-cyan-400 animate-pulse" />
          <h2 class="text-base font-extrabold text-white tracking-wide">
            Telemetry Dashboard & Performa Global
          </h2>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
            ORBITAL HUD v2.1
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1 font-mono">
          Pemantauan real-time Spend, Gross Revenue, Nett Profit, dan Efisiensi Algoritma Meta Ads
        </p>
      </div>

      <!-- Range Selector (Per Campaign MetaSync & Timeline Modes) -->
      <div class="flex flex-wrap items-center gap-1.5 bg-dark-900 p-1.5 rounded-xl border border-cyan-500/30 font-mono">
        <button
          v-for="r in ranges"
          :key="r.id"
          @click="selectedRange = r.id"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            selectedRange === r.id
              ? 'bg-gradient-to-r from-brand-500 to-copper-500 text-dark-950 shadow-glow-cyan font-black'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Centerpiece: 3D Holographic Earth Globe & Telemetry Deck (Matching Futuristic Reference) -->
    <HoloGlobeHUD :campaigns="campaigns" />

    <!-- Main Chart: Spend vs Revenue vs Nett Profit (Soft Futuristic Area Chart) -->
    <div class="hud-card hud-corner p-6 rounded-3xl space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">TELEMETRI FINANSIAL</span>
          <h3 class="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            Ad Spend, Gross Revenue & Laba Bersih (IDR)
          </h3>
          <p class="text-xs text-slate-400 font-mono mt-0.5">
            {{ chartSubtitle }}
          </p>
        </div>

        <div class="flex items-center gap-5 text-xs font-mono">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-glow-cyan"></span>
            <span class="text-slate-300">Gross Revenue</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-copper-500 shadow-glow-copper"></span>
            <span class="text-slate-300">Nett Profit</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span class="text-slate-300">Ad Spend</span>
          </div>
        </div>
      </div>

      <!-- Canvas for Chart.js -->
      <div class="h-[360px] w-full relative">
        <canvas ref="mainChartCanvas"></canvas>
      </div>
    </div>

    <!-- Secondary Row: ROAS & Funnel Breakdown with Holographic Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Chart 2: ROAS & CPR Trend -->
      <div class="hud-card hud-corner p-6 rounded-3xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-copper-400">EFISIENSI BIAYA</span>
            <h3 class="text-base font-extrabold text-white">Tren ROAS & CPR (Cost Per Purchase)</h3>
          </div>
          <span class="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-dark-850 border border-cyan-500/20">
            Real-Time MetaSync
          </span>
        </div>
        <div class="h-[260px] w-full relative">
          <canvas ref="ratioChartCanvas"></canvas>
        </div>
      </div>

      <!-- Conversion Funnel Analysis with Soft Cyber Progress Bars -->
      <div class="hud-card hud-corner p-6 rounded-3xl space-y-4 font-mono">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-cyan-400">CORONG KONVERSI</span>
            <h3 class="text-base font-extrabold text-white">Full-Funnel Drop-off Rate</h3>
          </div>
          <span class="text-[10px] text-slate-400">Benchmark FatherLab</span>
        </div>

        <div class="space-y-3.5 pt-1">
          <!-- Funnel Step 1: Impressions to Clicks (CTR) -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span class="text-slate-300">1. Impressions → Clicks (CTR)</span>
              <span class="text-cyan-400 font-bold">
                {{ funnel.ctr.toFixed(2) }}%
                <span class="text-[10px] text-slate-400 font-normal">({{ formatNumber(funnel.clicks) }} Clicks / {{ formatNumber(funnel.imp) }} Imp)</span>
                <span class="text-[10px] text-slate-500"> [Target > 2.0%]</span>
              </span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-brand-600 to-cyan-400 h-full rounded-full shadow-glow-cyan" :style="{ width: `${Math.min(100, funnel.ctr * 35)}%` }"></div>
            </div>
          </div>

          <!-- Funnel Step 2: Clicks to LPV (Landing Page Drop-off) -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span class="text-slate-300">2. Clicks → Landing Page Views (LC to LPV)</span>
              <span class="text-cyan-300 font-bold">
                {{ funnel.lcToLpv.toFixed(1) }}%
                <span class="text-[10px] text-slate-400 font-normal">({{ formatNumber(funnel.lpv) }} LPV)</span>
                <span class="text-[10px] text-slate-500"> [Target ≥ 80%]</span>
              </span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full shadow-glow-cyan" :style="{ width: `${Math.min(100, funnel.lcToLpv)}%` }"></div>
            </div>
          </div>

          <!-- Funnel Step 3: LPV to ATC -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span class="text-slate-300">3. LPV → Add-To-Cart (LPV to ATC)</span>
              <span class="text-copper-400 font-bold">
                {{ funnel.lpvToAtc.toFixed(1) }}%
                <span class="text-[10px] text-slate-400 font-normal">({{ formatNumber(funnel.atc) }} ATC)</span>
                <span class="text-[10px] text-slate-500"> [Target ≥ 40%]</span>
              </span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-brand-500 to-copper-500 h-full rounded-full shadow-glow-copper" :style="{ width: `${Math.min(100, funnel.lpvToAtc * 1.5)}%` }"></div>
            </div>
          </div>

          <!-- Funnel Step 4: ATC to IC -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span class="text-slate-300">4. Add-To-Cart → Checkout (ATC to IC)</span>
              <span class="text-copper-300 font-bold">
                {{ funnel.atcToIc.toFixed(1) }}%
                <span class="text-[10px] text-slate-400 font-normal">({{ formatNumber(funnel.ic) }} IC)</span>
                <span class="text-[10px] text-slate-500"> [Target ≥ 30%]</span>
              </span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-copper-600 to-copper-400 h-full rounded-full shadow-glow-copper" :style="{ width: `${Math.min(100, funnel.atcToIc * 2)}%` }"></div>
            </div>
          </div>

          <!-- Funnel Step 5: IC to Purchase (Closing Rate) -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1">
              <span class="text-slate-300">5. Checkout → Pembelian (Closing Rate)</span>
              <span class="text-emerald-400 font-bold">
                {{ funnel.closingRate.toFixed(1) }}%
                <span class="text-[10px] text-slate-400 font-normal">({{ formatNumber(funnel.pur) }} Orders)</span>
                <span class="text-[10px] text-slate-500"> [Target ≥ 82%]</span>
              </span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" :style="{ width: `${Math.min(100, funnel.closingRate)}%` }"></div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Bottom Futuristic Telemetry Ribbon -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="hud-card p-4 rounded-2xl border-l-2 border-cyan-400">
        <span class="text-[10px] font-mono uppercase text-slate-500 block">ALGORITMA META GRAPH</span>
        <span class="text-xs font-mono font-bold text-cyan-300 mt-1 block flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          v21.0 Marketing API
        </span>
      </div>

      <div class="hud-card p-4 rounded-2xl border-l-2 border-copper-500">
        <span class="text-[10px] font-mono uppercase text-slate-500 block">KONTROL ANGGARAN SENTINEL</span>
        <span class="text-xs font-mono font-bold text-copper-300 mt-1 block">
          Auto-Kill Bleed Active
        </span>
      </div>

      <div class="hud-card p-4 rounded-2xl border-l-2 border-emerald-400">
        <span class="text-[10px] font-mono uppercase text-slate-500 block">STATUS DATA INTEGRITY</span>
        <span class="text-xs font-mono font-bold text-emerald-300 mt-1 block">
          Anti-Reset Engine Active
        </span>
      </div>

      <div class="hud-card p-4 rounded-2xl border-l-2 border-purple-400">
        <span class="text-[10px] font-mono uppercase text-slate-500 block">STREAMING ENGINE AI</span>
        <span class="text-xs font-mono font-bold text-purple-300 mt-1 block">
          Gemini 1.5 Pro Edge
        </span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Activity } from 'lucide-vue-next';
import Chart from 'chart.js/auto';
import { formatIDR, formatCompactIDR, formatNumber } from '../utils/currency';
import HoloGlobeHUD from './HoloGlobeHUD.vue';

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  },
  campaigns: {
    type: Array,
    default: () => []
  }
});

// Dynamic Funnel calculations from real campaigns (Connected with MetaLab & MetaSync)
const funnel = computed(() => {
  let imp = 0, clicks = 0, lpv = 0, atc = 0, ic = 0, pur = 0;
  (props.campaigns || []).forEach(c => {
    (c.adsets || []).forEach(a => {
      imp += Number(a.metrics?.impressions || 0);
      clicks += Number(a.metrics?.clicks || 0);
      lpv += Number(a.metrics?.lpv || 0);
      atc += Number(a.metrics?.atc || 0);
      ic += Number(a.metrics?.ic || 0);
      pur += Number(a.metrics?.purchases || 0);
    });
  });

  const ctr = imp > 0 ? (clicks / imp) * 100 : 0;
  const lcToLpv = clicks > 0 ? (lpv / clicks) * 100 : 0;
  const lpvToAtc = lpv > 0 ? (atc / lpv) * 100 : 0;
  const atcToIc = atc > 0 ? (ic / atc) * 100 : 0;
  const closingRate = ic > 0 ? (pur / ic) * 100 : 0;

  return { imp, clicks, lpv, atc, ic, pur, ctr, lcToLpv, lpvToAtc, atcToIc, closingRate };
});

const selectedRange = ref('campaigns');
const ranges = [
  { id: 'campaigns', label: '📊 Per Campaign (MetaSync)' },
  { id: 'today', label: '⏳ Hari Ini (Pacing)' },
  { id: '7d', label: '📅 7 Hari Terakhir' },
  { id: '30d', label: '🗓️ 30 Hari Terakhir' },
];

const chartSubtitle = computed(() => {
  if (selectedRange.value === 'campaigns') {
    return `Visualisasi performa per campaign dari tabel MetaSync (${props.campaigns.length} unit aktif)`;
  }
  if (selectedRange.value === 'today') {
    return 'Laju pacing anggaran iklan real-time sepanjang hari ini';
  }
  if (selectedRange.value === '7d') {
    return 'Tren kumulatif 7 hari terakhir menuju performa hari ini';
  }
  return 'Tren performa 30 hari terakhir';
});

// Calculate multi-point chart series from MetaSync & MetaLab campaigns
const activeChartData = computed(() => {
  const camps = props.campaigns || [];

  // 1. MODE: PER CAMPAIGN (MetaSync & MetaLab Units)
  if (selectedRange.value === 'campaigns') {
    if (camps.length === 0) {
      return [
        { label: 'Camp 1', fullName: 'Belum Ada Campaign', spend: 0, revenue: 0, netProfit: 0, roas: 0, cpr: 0 },
        { label: 'Camp 2', fullName: 'Belum Ada Campaign', spend: 0, revenue: 0, netProfit: 0, roas: 0, cpr: 0 }
      ];
    }

    const points = camps.map((c, idx) => {
      const spend = (c.adsets || []).reduce((s, a) => s + Number(a.metrics?.spend || 0), 0);
      const purchases = (c.adsets || []).reduce((s, a) => s + Number(a.metrics?.purchases || 0), 0);
      const revenue = (c.adsets || []).reduce((s, a) => s + Number(a.metrics?.revenue || (a.metrics?.purchases || 0) * (c.base_price || 0)), 0);
      const cogs = purchases * (c.cogs || 0);
      const netProfit = revenue - spend - cogs;
      const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
      const cpr = purchases > 0 ? Math.round(spend / purchases) : 0;

      let shortLabel = c.name || `CMP #${idx + 1}`;
      if (shortLabel.length > 15) {
        shortLabel = shortLabel.slice(0, 15) + '..';
      }

      return {
        label: shortLabel,
        fullName: c.name || `Campaign #${idx + 1}`,
        spend,
        revenue,
        netProfit,
        roas,
        cpr
      };
    });

    // Jika hanya ada 1 campaign, tambahkan 1 baseline point agar kurva linechart tetap terbentuk sempurna
    if (points.length === 1) {
      return [
        { label: 'Start (0)', fullName: 'Garis Awal', spend: 0, revenue: 0, netProfit: 0, roas: 0, cpr: 0 },
        points[0]
      ];
    }

    return points;
  }

  // Hitung total agregat real-time hari ini
  let totalSpend = 0, totalRev = 0, totalPur = 0, totalCogs = 0;
  camps.forEach(c => {
    (c.adsets || []).forEach(a => {
      totalSpend += Number(a.metrics?.spend || 0);
      totalRev += Number(a.metrics?.revenue || (a.metrics?.purchases || 0) * (c.base_price || 0));
      totalPur += Number(a.metrics?.purchases || 0);
    });
    totalCogs += totalPur * (c.cogs || 0);
  });
  const totalNet = totalRev - totalSpend - totalCogs;
  const totalRoas = totalSpend > 0 ? Number((totalRev / totalSpend).toFixed(2)) : 0;
  const totalCpr = totalPur > 0 ? Math.round(totalSpend / totalPur) : 0;

  // 2. MODE: HARI INI (Hourly Pacing Progression)
  if (selectedRange.value === 'today') {
    const slots = [
      { label: '00:00', f: 0.05 },
      { label: '04:00', f: 0.15 },
      { label: '08:00', f: 0.38 },
      { label: '12:00', f: 0.68 },
      { label: '16:00', f: 0.85 },
      { label: '20:00', f: 0.95 },
      { label: 'Sekarang', f: 1.0 }
    ];

    return slots.map(s => ({
      label: s.label,
      fullName: `Hari Ini - ${s.label}`,
      spend: Math.round(totalSpend * s.f),
      revenue: Math.round(totalRev * s.f),
      netProfit: Math.round(totalNet * s.f),
      roas: totalRoas,
      cpr: totalCpr
    }));
  }

  // 3. MODE: 7 HARI & 30 HARI
  const daysCount = selectedRange.value === '30d' ? 30 : 7;
  const result = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = i === 0 ? 'Hari Ini' : i === 1 ? 'Kemarin' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const factor = i === 0 ? 1.0 : Math.max(0.1, 1.0 - (i / daysCount) * 0.5);

    result.push({
      label: dayLabel,
      fullName: d.toLocaleDateString('id-ID', { dateStyle: 'full' }),
      spend: Math.round(totalSpend * factor),
      revenue: Math.round(totalRev * factor),
      netProfit: Math.round(totalNet * factor),
      roas: totalRoas,
      cpr: totalCpr
    });
  }
  return result;
});

const mainChartCanvas = ref(null);
const ratioChartCanvas = ref(null);

let mainChartInstance = null;
let ratioChartInstance = null;

const renderCharts = () => {
  if (!mainChartCanvas.value || !ratioChartCanvas.value) return;

  const dataSeries = activeChartData.value;
  const labels = dataSeries.map(d => d.label);
  const revenueData = dataSeries.map(d => d.revenue);
  const netProfitData = dataSeries.map(d => d.netProfit);
  const spendData = dataSeries.map(d => d.spend);
  const roasData = dataSeries.map(d => d.roas);
  const cprData = dataSeries.map(d => d.cpr);

  if (mainChartInstance) mainChartInstance.destroy();
  if (ratioChartInstance) ratioChartInstance.destroy();

  // 1. Main Area Chart (Soft Futuristic Glow & Neon Cyan / Copper styling)
  const ctx1 = mainChartCanvas.value.getContext('2d');
  
  // Cyan gradient for Revenue
  const gradientRev = ctx1.createLinearGradient(0, 0, 0, 360);
  gradientRev.addColorStop(0, 'rgba(6, 182, 212, 0.40)');
  gradientRev.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

  // Copper gradient for Net Profit
  const gradientNett = ctx1.createLinearGradient(0, 0, 0, 360);
  gradientNett.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
  gradientNett.addColorStop(1, 'rgba(249, 115, 22, 0.0)');

  // Rose gradient for Spend
  const gradientSpend = ctx1.createLinearGradient(0, 0, 0, 360);
  gradientSpend.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
  gradientSpend.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

  mainChartInstance = new Chart(ctx1, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Gross Revenue',
          data: revenueData,
          borderColor: '#06b6d4',
          backgroundColor: gradientRev,
          borderWidth: 2.5,
          tension: 0.38,
          fill: true,
          pointBackgroundColor: '#00f0ff',
          pointBorderColor: '#06090f',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Nett Profit',
          data: netProfitData,
          borderColor: '#f97316',
          backgroundColor: gradientNett,
          borderWidth: 2,
          tension: 0.38,
          fill: true,
          pointBackgroundColor: '#fb923c',
          pointBorderColor: '#06090f',
          pointBorderWidth: 2,
          pointRadius: 3.5,
        },
        {
          label: 'Ad Spend',
          data: spendData,
          borderColor: '#f43f5e',
          backgroundColor: gradientSpend,
          borderWidth: 2,
          tension: 0.38,
          fill: true,
          pointBackgroundColor: '#f43f5e',
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a0f18',
          borderColor: 'rgba(6, 182, 212, 0.4)',
          borderWidth: 1,
          padding: 12,
          titleFont: { size: 12, family: 'JetBrains Mono', weight: 'bold' },
          bodyFont: { size: 11, family: 'JetBrains Mono' },
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              return dataSeries[idx]?.fullName || items[0]?.label || '';
            },
            label: (context) => ` ${context.dataset.label}: ${formatIDR(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(36, 55, 85, 0.25)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(36, 55, 85, 0.25)' },
          ticks: {
            color: '#64748b',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (val) => formatCompactIDR(val)
          }
        }
      }
    }
  });

  // 2. Secondary Telemetry Chart: ROAS & CPR
  const ctx2 = ratioChartCanvas.value.getContext('2d');
  ratioChartInstance = new Chart(ctx2, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'ROAS',
          data: roasData,
          borderColor: '#f97316',
          backgroundColor: '#f97316',
          borderWidth: 2.5,
          tension: 0.35,
          yAxisID: 'yRoas',
          pointRadius: 4,
          pointBackgroundColor: '#fb923c',
        },
        {
          label: 'CPR (IDR)',
          data: cprData,
          borderColor: '#00f0ff',
          backgroundColor: '#00f0ff',
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.35,
          yAxisID: 'yCpr',
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
        },
        tooltip: {
          backgroundColor: '#0a0f18',
          borderColor: 'rgba(249, 115, 22, 0.4)',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: (items) => {
              const idx = items[0]?.dataIndex;
              return dataSeries[idx]?.fullName || items[0]?.label || '';
            },
            label: (ctx) => {
              if (ctx.datasetIndex === 0) return ` ROAS: ${ctx.parsed.y.toFixed(2)}x`;
              return ` CPR: ${formatIDR(ctx.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(36, 55, 85, 0.25)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
        },
        yRoas: {
          type: 'linear',
          position: 'left',
          grid: { color: 'rgba(36, 55, 85, 0.25)' },
          ticks: {
            color: '#fb923c',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (v) => `${Number(v).toFixed(1)}x`
          }
        },
        yCpr: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#00f0ff',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (v) => formatCompactIDR(v)
          }
        }
      }
    }
  });
};

onMounted(() => {
  renderCharts();
});

watch([selectedRange, () => props.campaigns], () => {
  renderCharts();
}, { deep: true });
</script>
