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
            ORBITAL HUD v2.0
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1 font-mono">
          Pemantauan real-time Spend, Gross Revenue, Nett Profit, dan Efisiensi Algoritma Meta Ads
        </p>
      </div>

      <!-- Range Selector -->
      <div class="flex items-center gap-1.5 bg-dark-900 p-1.5 rounded-xl border border-cyan-500/30 font-mono">
        <button
          v-for="r in ranges"
          :key="r.id"
          @click="selectedRange = r.id"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
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
    <HoloGlobeHUD />

    <!-- Main Chart: Spend vs Revenue vs Nett Profit (Soft Futuristic Area Chart) -->
    <div class="hud-card hud-corner p-6 rounded-3xl space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">TELEMETRI FINANSIAL</span>
          <h3 class="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            Ad Spend, Gross Revenue & Laba Bersih (IDR)
          </h3>
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
            Auto-Optimized
          </span>
        </div>
        <div class="h-[260px] w-full relative">
          <canvas ref="ratioChartCanvas"></canvas>
        </div>
      </div>

      <!-- Conversion Funnel Analysis with Soft Cyber Progress Bars -->
      <div class="hud-card hud-corner p-6 rounded-3xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">CORONG KONVERSI</span>
            <h3 class="text-base font-extrabold text-white">Full-Funnel Drop-off Rate</h3>
          </div>
          <span class="text-[10px] font-mono text-slate-400">Benchmark FatherLab</span>
        </div>

        <div class="space-y-3.5 pt-1">
          <!-- Funnel Step 1: Impressions to Clicks (CTR) -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1 font-mono">
              <span class="text-slate-300">1. Impressions → Clicks (CTR)</span>
              <span class="text-cyan-400 font-bold">2.68% (Target > 2.0%)</span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-brand-600 to-cyan-400 h-full rounded-full shadow-glow-cyan" style="width: 85%"></div>
            </div>
          </div>

          <!-- Funnel Step 2: Clicks to LPV (Landing Page Drop-off) -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1 font-mono">
              <span class="text-slate-300">2. Clicks → Landing Page Views (LC to LPV)</span>
              <span class="text-cyan-300 font-bold">84.2% (Target ≥ 80%)</span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-teal-500 to-cyan-400 h-full rounded-full shadow-glow-cyan" style="width: 84%"></div>
            </div>
          </div>

          <!-- Funnel Step 3: LPV to ATC -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1 font-mono">
              <span class="text-slate-300">3. LPV → Add-To-Cart (LPV to ATC)</span>
              <span class="text-copper-400 font-bold">41.6% (Target ≥ 40%)</span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-brand-500 to-copper-500 h-full rounded-full shadow-glow-copper" style="width: 72%"></div>
            </div>
          </div>

          <!-- Funnel Step 4: ATC to IC -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1 font-mono">
              <span class="text-slate-300">4. Add-To-Cart → Checkout (ATC to IC)</span>
              <span class="text-copper-300 font-bold">33.5% (Target ≥ 30%)</span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-copper-600 to-copper-400 h-full rounded-full shadow-glow-copper" style="width: 65%"></div>
            </div>
          </div>

          <!-- Funnel Step 5: IC to Purchase (Closing Rate) -->
          <div>
            <div class="flex justify-between text-xs font-semibold mb-1 font-mono">
              <span class="text-slate-300">5. Checkout → Pembelian (Closing Rate)</span>
              <span class="text-emerald-400 font-bold">83.4% (Target ≥ 82%)</span>
            </div>
            <div class="w-full bg-dark-850 h-2 rounded-full overflow-hidden border border-dark-750">
              <div class="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style="width: 83%"></div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Bottom Futuristic Telemetry Ribbon (Matching Image Globe Deck) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="hud-card p-4 rounded-2xl border-l-2 border-cyan-400">
        <span class="text-[10px] font-mono uppercase text-slate-500 block">ALGORITMA META GRAPH</span>
        <span class="text-xs font-mono font-bold text-cyan-300 mt-1 block flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          v20.0 Marketing Insights
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
import { ref, onMounted, watch } from 'vue';
import { Activity } from 'lucide-vue-next';
import Chart from 'chart.js/auto';
import { formatIDR } from '../utils/currency';
import HoloGlobeHUD from './HoloGlobeHUD.vue';

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  }
});

const selectedRange = ref('7d');
const ranges = [
  { id: 'today', label: 'Hari Ini' },
  { id: '7d', label: '7 Hari Terakhir' },
  { id: '30d', label: '30 Hari Terakhir' },
];

const mainChartCanvas = ref(null);
const ratioChartCanvas = ref(null);

let mainChartInstance = null;
let ratioChartInstance = null;

const renderCharts = () => {
  if (!mainChartCanvas.value || !ratioChartCanvas.value) return;

  const labels = props.chartData.map(d => d.date);
  const revenueData = props.chartData.map(d => d.revenue);
  const netProfitData = props.chartData.map(d => d.netProfit);
  const spendData = props.chartData.map(d => d.spend);
  const roasData = props.chartData.map(d => d.roas);
  const cprData = props.chartData.map(d => d.cpr);

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
          borderWidth: 1.8,
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
            label: (context) => ` ${context.dataset.label}: ${formatIDR(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(36, 55, 85, 0.25)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(36, 55, 85, 0.25)' },
          ticks: {
            color: '#64748b',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (val) => `Rp ${(val / 1000000).toFixed(0)}Jt`
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
            callback: (v) => `${v.toFixed(1)}x`
          }
        },
        yCpr: {
          type: 'linear',
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#00f0ff',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (v) => `Rp ${(v / 1000).toFixed(0)}k`
          }
        }
      }
    }
  });
};

onMounted(() => {
  renderCharts();
});

watch(() => props.chartData, () => {
  renderCharts();
}, { deep: true });
</script>
