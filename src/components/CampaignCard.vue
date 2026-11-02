<template>
  <div class="hud-panel p-4.5 transition-all shadow-lg flex flex-col gap-3.5 relative overflow-hidden font-mono"
    :class="[
      killEval.shouldKill 
        ? 'border-rose-500/70 shadow-glow-rose/30 ring-1 ring-rose-500/40' 
        : autoMoveEval.eligible 
          ? 'border-cyan-400 shadow-glow-cyan/30 ring-1 ring-cyan-500/40' 
          : 'border-cyan-500/25'
    ]"
  >
    <!-- Sci-Fi Corner Pin Reticle -->
    <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" :class="killEval.shouldKill ? 'border-rose-400' : autoMoveEval.eligible ? 'border-cyan-400' : 'border-cyan-500/40'"></div>
    <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" :class="killEval.shouldKill ? 'border-rose-400' : 'border-copper-500/40'"></div>

    <!-- Alert Banner 1: Rekomendasi Kill (Pink / Rose Soft Badge) -->
    <div 
      v-if="killEval.shouldKill" 
      class="flex flex-col gap-1.5 p-3 bg-rose-950/70 border border-rose-500/60 text-rose-200"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-xs text-rose-300">
          <AlertTriangle class="w-4 h-4 text-rose-400 shrink-0" />
          <span>[ REKOMENDASI: KILL / PAUSE SEGERA ]</span>
        </div>
        <span class="text-[9px] px-2 py-0.5 bg-rose-500/20 font-bold uppercase tracking-wider text-rose-300 border border-rose-500/40">
          HIGH BLEED
        </span>
      </div>
      <ul class="text-[11px] text-rose-200/90 list-disc list-inside space-y-0.5 mt-0.5">
        <li v-for="(reason, rIdx) in killEval.reasons" :key="rIdx">
          {{ reason }}
        </li>
      </ul>
      <div class="flex items-center justify-end mt-1 pt-1.5 border-t border-rose-500/20">
        <button
          @click="handleKillAdset(campaign.adsets?.[0]?.id || campaign.id)"
          :disabled="isActionLoading"
          class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md"
        >
          <OctagonX class="w-3.5 h-3.5" />
          <span>Kill Sekarang (Pause di Meta & TG Alert)</span>
        </button>
      </div>
    </div>

    <!-- Alert Banner 2: Evaluasi Otomatis (Auto-Move Eligible) -->
    <div 
      v-else-if="autoMoveEval.eligible" 
      class="flex items-center justify-between p-3 bg-cyan-950/60 border border-cyan-400/70 text-cyan-200"
    >
      <div class="flex items-center gap-2 text-xs">
        <Rocket class="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
        <div>
          <span class="font-extrabold text-cyan-300">{{ autoMoveEval.badgeText }}</span>
          <p class="text-[11px] text-cyan-200/80">{{ autoMoveEval.reason }}</p>
        </div>
      </div>
      <button
        @click="$emit('move-stage', { campaignId: campaign.id, nextStage: autoMoveEval.nextStage })"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-dark-950 bg-cyan-400 hover:bg-cyan-300 transition-all shadow-md shrink-0"
      >
        <span>Pindahkan</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Campaign Header & Pricing Info -->
    <div class="flex flex-col gap-2">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span 
              class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono"
              :class="stageBadgeClass"
            >
              {{ campaign.status.toUpperCase() }}
            </span>
            <span class="text-xs font-mono text-slate-400">{{ campaign.meta_campaign_id || 'ID Pending' }}</span>
          </div>
          <h3 class="text-sm font-bold text-white mt-1 leading-snug line-clamp-2" :title="campaign.name">
            {{ campaign.name }}
          </h3>
        </div>

        <div class="flex items-center gap-1">
          <!-- Manual stage shift menu -->
          <select 
            :value="campaign.status"
            @change="$emit('move-stage', { campaignId: campaign.id, nextStage: $event.target.value })"
            class="bg-dark-800 border border-dark-700 text-slate-300 text-[11px] font-semibold rounded-lg px-2 py-1 outline-none focus:border-brand-500"
          >
            <option value="test">Tahap 1: TEST</option>
            <option value="scale1">Tahap 2: SCALE 1</option>
            <option value="scale2">Tahap 3: SCALE 2</option>
            <option value="paused">PAUSED</option>
          </select>
        </div>
      </div>

      <!-- Pricing Rules: Mandatory Harga Jual & HPP/COGS -->
      <div class="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-dark-850 border border-dark-750">
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Harga Jual</span>
          <span class="text-xs font-extrabold font-mono text-teal-300">{{ formatIDR(campaign.base_price) }}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">HPP / COGS</span>
          <span class="text-xs font-extrabold font-mono text-slate-300">{{ formatIDR(campaign.cogs) }}</span>
        </div>
        <div>
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Gross Margin</span>
          <span class="text-xs font-extrabold font-mono text-emerald-400">
            {{ formatPercent(campaign.base_price > 0 ? ((campaign.base_price - campaign.cogs) / campaign.base_price) * 100 : 0) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Financial Performance Bar -->
    <div class="grid grid-cols-4 gap-2 py-2 px-3 rounded-xl bg-dark-800/80 border border-dark-700/60 text-center">
      <div>
        <span class="text-[9px] uppercase font-bold text-slate-400 block">Ad Spend</span>
        <span class="text-xs font-extrabold font-mono text-rose-300">{{ formatCompactIDR(kpiCalc.summary.spend) }}</span>
      </div>
      <div>
        <span class="text-[9px] uppercase font-bold text-slate-400 block">Purchases</span>
        <span class="text-xs font-extrabold font-mono text-cyan-300">{{ kpiCalc.summary.purchases }} Order</span>
      </div>
      <div>
        <span class="text-[9px] uppercase font-bold text-slate-400 block">Nett Profit</span>
        <span 
          class="text-xs font-extrabold font-mono"
          :class="kpiCalc.summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'"
        >
          {{ formatCompactIDR(kpiCalc.summary.netProfit) }}
        </span>
      </div>
      <div>
        <span class="text-[9px] uppercase font-bold text-slate-400 block">ROAS</span>
        <span class="text-xs font-extrabold font-mono text-amber-300">{{ kpiCalc.summary.roas.toFixed(2) }}x</span>
      </div>
    </div>

    <!-- 10 KPI Rules Engine Grid (In exact requested order) -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity class="w-3.5 h-3.5 text-brand-400" />
          10 KPI Rules Engine
        </span>
        <span class="text-[10px] font-mono text-slate-500">
          Pass: {{ kpiCalc.kpis.filter(k => k.status === 'pass').length }}/10
        </span>
      </div>

      <div class="grid grid-cols-2 gap-1.5">
        <MetricsBadge
          v-for="kpi in kpiCalc.kpis"
          :key="kpi.id"
          :kpi="kpi"
        />
      </div>
    </div>

    <!-- AdSets List & Actions -->
    <div class="border-t border-dark-800 pt-3 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-400">Ad Sets Terhubung ({{ (campaign.adsets || []).length }})</span>
        <button 
          @click="showAdsets = !showAdsets" 
          class="text-[11px] font-medium text-brand-400 hover:text-brand-300"
        >
          {{ showAdsets ? 'Tutup Detail' : 'Lihat Detail' }}
        </button>
      </div>

      <div v-if="showAdsets" class="space-y-2 mt-1">
        <div 
          v-for="adset in campaign.adsets" 
          :key="adset.id"
          class="p-2.5 rounded-lg bg-dark-850 border border-dark-750 flex items-center justify-between gap-2 text-xs"
        >
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span 
                class="w-2 h-2 rounded-full"
                :class="adset.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-500'"
              ></span>
              <span class="font-bold text-white truncate">{{ adset.name }}</span>
            </div>
            <div class="text-[10px] font-mono text-slate-400 mt-0.5">
              ID: {{ adset.meta_adset_id }} &bull; Spend: {{ formatCompactIDR(adset.metrics?.spend) }} &bull; CPR: {{ formatIDR(adset.metrics?.purchases > 0 ? adset.metrics.spend / adset.metrics.purchases : 0) }}
            </div>
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <button
              v-if="adset.status === 'ACTIVE'"
              @click="handleKillAdset(adset.id, adset.meta_adset_id)"
              class="px-2 py-1 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold border border-rose-500/30"
              title="Pause adset di Meta API dan kirim Telegram alert"
            >
              Kill
            </button>
            <span v-else class="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-750 text-slate-500">
              PAUSED
            </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  AlertTriangle, 
  Rocket, 
  ArrowRight, 
  Activity, 
  OctagonX 
} from 'lucide-vue-next';
import MetricsBadge from './MetricsBadge.vue';
import { calculate10KPIs, evaluateAutoMove, evaluateKillRecommendation } from '../utils/kpiRules';
import { formatIDR, formatCompactIDR, formatPercent } from '../utils/currency';

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['move-stage', 'kill-adset']);

const showAdsets = ref(false);
const isActionLoading = ref(false);

// Aggregate metrics from all adsets in this campaign
const aggregatedMetrics = computed(() => {
  const adsets = props.campaign.adsets || [];
  return adsets.reduce((acc, ad) => {
    const m = ad.metrics || {};
    return {
      spend: acc.spend + (m.spend || 0),
      impressions: acc.impressions + (m.impressions || 0),
      clicks: acc.clicks + (m.clicks || 0),
      lpv: acc.lpv + (m.lpv || 0),
      atc: acc.atc + (m.atc || 0),
      ic: acc.ic + (m.ic || 0),
      purchases: acc.purchases + (m.purchases || 0),
      revenue: acc.revenue + (m.revenue || 0),
      reach: acc.reach + (m.reach || 0),
      frequency: Math.max(acc.frequency, m.frequency || 1.0)
    };
  }, {
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
  });
});

// Run 10 KPI engine
const kpiCalc = computed(() => {
  return calculate10KPIs(
    aggregatedMetrics.value, 
    props.campaign.base_price, 
    props.campaign.cogs
  );
});

// Run Auto-Move evaluation
const autoMoveEval = computed(() => {
  return evaluateAutoMove(kpiCalc.value.summary, props.campaign.status);
});

// Run Kill recommendation evaluation
const killEval = computed(() => {
  return evaluateKillRecommendation(kpiCalc.value.summary);
});

const stageBadgeClass = computed(() => {
  switch (props.campaign.status) {
    case 'test':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    case 'scale1':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    case 'scale2':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  }
});

const handleKillAdset = async (adsetId, metaAdsetId) => {
  if (confirm(`Yakin ingin mematikan (KILL) adset ini sekarang? Tindakan ini akan menjeda iklan di Meta Graph API dan mengirim notifikasi ke Telegram.`)) {
    isActionLoading.value = true;
    emit('kill-adset', {
      campaignId: props.campaign.id,
      adsetId: adsetId,
      metaAdsetId: metaAdsetId || adsetId,
      campaignName: props.campaign.name
    });
    setTimeout(() => {
      isActionLoading.value = false;
    }, 500);
  }
};
</script>
