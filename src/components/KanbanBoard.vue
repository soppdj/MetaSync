<template>
  <div class="space-y-6">
    <!-- Top KPI Overview Strip across stages (Soft Futuristic HUD) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="hud-card hud-corner p-4.5 rounded-2xl flex items-center justify-between group">
        <div>
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Spend Hari Ini</span>
          <p class="text-xl font-extrabold font-mono text-copper-400 mt-1">{{ formatIDR(totalSpend) }}</p>
        </div>
        <div class="p-3 rounded-xl bg-copper-500/10 text-copper-400 border border-copper-500/20 group-hover:shadow-glow-copper transition-all">
          <DollarSign class="w-5 h-5" />
        </div>
      </div>

      <div class="hud-card hud-corner p-4.5 rounded-2xl flex items-center justify-between group">
        <div>
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">Total Gross Revenue</span>
          <p class="text-xl font-extrabold font-mono text-brand-300 mt-1">{{ formatIDR(totalRevenue) }}</p>
        </div>
        <div class="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:shadow-glow-cyan transition-all">
          <ShoppingBag class="w-5 h-5" />
        </div>
      </div>

      <div class="hud-card hud-corner p-4.5 rounded-2xl flex items-center justify-between group">
        <div>
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">Nett Profit Bersih</span>
          <p class="text-xl font-extrabold font-mono text-emerald-400 mt-1">{{ formatIDR(totalNett) }}</p>
        </div>
        <div class="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:shadow-glow-teal transition-all">
          <TrendingUp class="w-5 h-5" />
        </div>
      </div>

      <div class="hud-card hud-corner p-4.5 rounded-2xl flex items-center justify-between group">
        <div>
          <span class="text-[11px] uppercase tracking-wider font-bold text-slate-400">Average ROAS</span>
          <p class="text-xl font-extrabold font-mono text-amber-300 mt-1">{{ overallRoas.toFixed(2) }}x</p>
        </div>
        <div class="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:shadow-glow-amber transition-all">
          <Flame class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Kanban 3 Columns (Desktop Optimized Horizontal Layout - Sci-Fi Telemetry HUD) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- KOLOM 1: TEST -->
      <div class="hud-panel p-4 flex flex-col gap-4 border-amber-500/30">
        <!-- Stage Header -->
        <div class="p-3.5 bg-dark-900 border border-amber-500/40 flex items-center justify-between hud-corner">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-6 bg-amber-400 shadow-glow-amber"></div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xs font-mono font-black text-amber-300 tracking-wider">[ STAGE 01 // TEST ]</h2>
                <span class="text-[10px] font-mono px-2 py-0.2 bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {{ testCampaigns.length }} UNITS
                </span>
              </div>
              <p class="text-[10px] font-mono text-slate-400 mt-0.5">Mencari Winning Creative & Angle</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[9px] uppercase font-bold text-slate-500 block font-mono">Total Spend</span>
            <span class="text-xs font-mono font-bold text-copper-300">{{ formatCompactIDR(getStageSpend(testCampaigns)) }}</span>
          </div>
        </div>

        <!-- Cards List -->
        <div class="space-y-4 min-h-[400px]">
          <CampaignCard
            v-for="camp in testCampaigns"
            :key="camp.id"
            :campaign="camp"
            @move-stage="$emit('move-stage', $event)"
            @kill-adset="$emit('kill-adset', $event)"
          />
          <div 
            v-if="testCampaigns.length === 0" 
            class="h-44 border-2 border-dashed border-dark-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs gap-2 font-mono"
          >
            <span>Tidak ada campaign dalam tahap Test</span>
            <button 
              @click="$emit('open-create-modal')" 
              class="text-cyan-400 hover:text-cyan-300 font-bold text-xs"
            >
              + Buat Campaign Test
            </button>
          </div>
        </div>
      </div>

      <!-- KOLOM 2: SCALE 1 -->
      <div class="hud-panel p-4 flex flex-col gap-4 border-cyan-500/30">
        <!-- Stage Header -->
        <div class="p-3.5 bg-dark-900 border border-cyan-500/40 flex items-center justify-between hud-corner">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-6 bg-cyan-400 shadow-glow-cyan"></div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xs font-mono font-black text-cyan-300 tracking-wider">[ STAGE 02 // SCALE 1 ]</h2>
                <span class="text-[10px] font-mono px-2 py-0.2 bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  {{ scale1Campaigns.length }} UNITS
                </span>
              </div>
              <p class="text-[10px] font-mono text-slate-400 mt-0.5">Winning Ad Set & LLA Audiens</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[9px] uppercase font-bold text-slate-500 block font-mono">Total Spend</span>
            <span class="text-xs font-mono font-bold text-cyan-300">{{ formatCompactIDR(getStageSpend(scale1Campaigns)) }}</span>
          </div>
        </div>

        <!-- Cards List -->
        <div class="space-y-4 min-h-[400px]">
          <CampaignCard
            v-for="camp in scale1Campaigns"
            :key="camp.id"
            :campaign="camp"
            @move-stage="$emit('move-stage', $event)"
            @kill-adset="$emit('kill-adset', $event)"
          />
          <div 
            v-if="scale1Campaigns.length === 0" 
            class="h-44 border-2 border-dashed border-dark-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs gap-2 font-mono"
          >
            <span>Belum ada campaign di Scale 1</span>
            <span class="text-[11px] text-slate-600">Promosikan dari Test jika CTR > 2% & CPR lolos target</span>
          </div>
        </div>
      </div>

      <!-- KOLOM 3: SCALE 2 -->
      <div class="hud-panel p-4 flex flex-col gap-4 border-copper-500/30">
        <!-- Stage Header -->
        <div class="p-3.5 bg-dark-900 border border-copper-500/40 flex items-center justify-between hud-corner">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-6 bg-copper-500 shadow-glow-copper"></div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xs font-mono font-black text-copper-300 tracking-wider">[ STAGE 03 // SCALE 2 ]</h2>
                <span class="text-[10px] font-mono px-2 py-0.2 bg-copper-500/20 text-copper-300 font-bold border border-copper-500/30">
                  {{ scale2Campaigns.length }} UNITS
                </span>
              </div>
              <p class="text-[10px] font-mono text-slate-400 mt-0.5">Final Scale & Injeksi Anggaran Penuh</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[9px] uppercase font-bold text-slate-500 block font-mono">Total Spend</span>
            <span class="text-xs font-mono font-bold text-copper-300">{{ formatCompactIDR(getStageSpend(scale2Campaigns)) }}</span>
          </div>
        </div>

        <!-- Cards List -->
        <div class="space-y-4 min-h-[400px]">
          <CampaignCard
            v-for="camp in scale2Campaigns"
            :key="camp.id"
            :campaign="camp"
            @move-stage="$emit('move-stage', $event)"
            @kill-adset="$emit('kill-adset', $event)"
          />
          <div 
            v-if="scale2Campaigns.length === 0" 
            class="h-44 border-2 border-dashed border-dark-800 rounded-lg flex flex-col items-center justify-center text-slate-500 text-xs gap-2 font-mono"
          >
            <span>Belum ada campaign di Scale 2</span>
            <span class="text-[11px] text-slate-600">Puncak scaling untuk campaign bervolume tinggi</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Flame 
} from 'lucide-vue-next';
import CampaignCard from './CampaignCard.vue';
import { formatIDR, formatCompactIDR } from '../utils/currency';

const props = defineProps({
  campaigns: {
    type: Array,
    required: true
  }
});

defineEmits(['move-stage', 'kill-adset', 'open-create-modal']);

const testCampaigns = computed(() => props.campaigns.filter(c => c.status === 'test'));
const scale1Campaigns = computed(() => props.campaigns.filter(c => c.status === 'scale1'));
const scale2Campaigns = computed(() => props.campaigns.filter(c => c.status === 'scale2'));

// Financial Totals
const totalSpend = computed(() => {
  return props.campaigns.reduce((sum, camp) => {
    const campSpend = (camp.adsets || []).reduce((s, a) => s + (a.metrics?.spend || 0), 0);
    return sum + campSpend;
  }, 0);
});

const totalRevenue = computed(() => {
  return props.campaigns.reduce((sum, camp) => {
    const campRev = (camp.adsets || []).reduce((s, a) => s + (a.metrics?.revenue || 0), 0);
    return sum + campRev;
  }, 0);
});

const totalNett = computed(() => {
  return props.campaigns.reduce((sum, camp) => {
    const campNett = (camp.adsets || []).reduce((s, a) => {
      const rev = a.metrics?.revenue || 0;
      const spend = a.metrics?.spend || 0;
      const cogs = (a.metrics?.purchases || 0) * (camp.cogs || 0);
      return s + (rev - cogs - spend);
    }, 0);
    return sum + campNett;
  }, 0);
});

const overallRoas = computed(() => {
  return totalSpend.value > 0 ? totalRevenue.value / totalSpend.value : 0;
});

const getStageSpend = (camps) => {
  return camps.reduce((sum, camp) => {
    const s = (camp.adsets || []).reduce((acc, a) => acc + (a.metrics?.spend || 0), 0);
    return sum + s;
  }, 0);
};
</script>
