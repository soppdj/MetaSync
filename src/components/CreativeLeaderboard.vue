<template>
  <div class="space-y-6">
    <!-- Header (Futuristic Telemetry & Sync Action) -->
    <div class="hud-card hud-corner flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl">
      <div>
        <div class="flex items-center gap-2">
          <Trophy class="w-5 h-5 text-amber-400" />
          <h2 class="text-base font-bold text-white tracking-wide">Creative Leaderboard</h2>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-copper-500/10 text-copper-300 border border-copper-500/30 font-bold">
            FatherLab Matrix Score
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
            v21.0 Live Sync
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Perangkingan performa visual kreatif Meta Ads: Persilangan <strong class="text-brand-300">CTR Tertinggi</strong> dan <strong class="text-copper-400">CPR Terendah</strong>
        </p>
      </div>

      <!-- Controls: Filters & Direct Sync Button -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Filter Tipe -->
        <div class="flex items-center gap-1.5 bg-dark-900/90 p-1 rounded-xl border border-dark-750">
          <button
            v-for="filter in ['all', 'video', 'image']"
            :key="filter"
            @click="activeFilter = filter"
            :class="[
              'px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all',
              activeFilter === filter
                ? 'bg-gradient-to-r from-brand-500 to-copper-500 text-dark-950 font-black shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ filter === 'all' ? 'Semua' : filter }}
          </button>
        </div>

        <!-- Sync Button -->
        <button
          @click="$emit('trigger-sync')"
          :disabled="isSyncing"
          class="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-dark-950 bg-gradient-to-r from-brand-400 to-cyan-300 hover:opacity-90 transition-all shadow-glow-cyan disabled:opacity-50 font-mono rounded-xl"
        >
          <RefreshCw class="w-3.5 h-3.5 text-dark-950" :class="{ 'animate-spin': isSyncing }" />
          <span>{{ isSyncing ? 'SINKRONISASI...' : 'SYNC KREATIF DARI META' }}</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="rankedAssets.length === 0" 
      class="hud-panel p-12 text-center flex flex-col items-center justify-center font-mono space-y-3.5 border-cyan-500/20"
    >
      <div class="w-14 h-14 bg-dark-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan rounded-2xl">
        <Trophy class="w-7 h-7 text-amber-400 animate-pulse" />
      </div>
      <h3 class="text-xs font-bold text-slate-200 tracking-wider">[ TIDAK ADA ASET KREATIF // MENUNGGU SINKRONISASI ]</h3>
      <p class="text-[11px] text-slate-400 max-w-md leading-relaxed">
        Seluruh data sampel telah dihapus. Klik tombol di bawah untuk menyinkronkan visual kreatif, video, dan performa metrik (CTR & CPR) langsung dari akun Meta Ads aktif Anda.
      </p>
      <div class="pt-2 flex items-center gap-3">
        <button
          @click="$emit('trigger-sync')"
          :disabled="isSyncing"
          class="px-4 py-2 text-xs font-black text-dark-950 bg-gradient-to-r from-brand-400 to-cyan-300 hover:opacity-90 transition-all shadow-glow-cyan flex items-center gap-2 rounded-xl"
        >
          <RefreshCw class="w-3.5 h-3.5 text-dark-950" :class="{ 'animate-spin': isSyncing }" />
          <span>Sinkronkan Kreatif Meta Ads Sekarang</span>
        </button>
        <button
          @click="$emit('open-settings')"
          class="px-3.5 py-2 text-xs font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 hover:bg-cyan-900 transition-all rounded-xl"
        >
          Pengaturan API
        </button>
      </div>
    </div>

    <!-- Ranked Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="(item, index) in rankedAssets"
        :key="item.id"
        class="hud-panel p-5 flex flex-col justify-between transition-all shadow-xl relative overflow-hidden group font-mono"
        :class="[
          index === 0 
            ? 'border-copper-500/80 shadow-glow-copper/30 ring-1 ring-copper-500/50' 
            : index === 1 
              ? 'border-cyan-400/80 shadow-glow-cyan/25 ring-1 ring-cyan-500/30' 
              : 'border-cyan-500/25'
        ]"
      >
        <!-- Sci-Fi Corner Reticles -->
        <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" :class="index === 0 ? 'border-copper-400' : 'border-cyan-400'"></div>
        <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" :class="index === 0 ? 'border-copper-400' : 'border-cyan-400'"></div>

        <!-- Rank Pill -->
        <div class="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 text-xs font-black shadow-lg"
          :class="[
            index === 0 
              ? 'bg-copper-400 text-dark-950 shadow-glow-copper' 
              : index === 1 
                ? 'bg-cyan-400 text-dark-950 shadow-glow-cyan' 
                : index === 2 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-dark-900 text-slate-300 border border-dark-700'
          ]"
        >
          <Crown v-if="index === 0" class="w-3.5 h-3.5" />
          <span>[ RANK #{{ index + 1 }} ]</span>
        </div>

        <!-- Composite Score Badge -->
        <div class="absolute top-4 right-4 z-10 flex flex-col items-end">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">METRIC SCORE</span>
          <span class="text-sm font-black font-mono text-cyan-300 bg-dark-950 px-2 py-0.5 border border-cyan-500/40">
            {{ item.score }} PTS
          </span>
        </div>

        <!-- Media Thumbnail or Holographic Graphic -->
        <div class="relative w-full h-52 rounded-2xl overflow-hidden bg-dark-950 border border-dark-800 mb-4 mt-8 group-hover:scale-[1.01] transition-transform flex items-center justify-center">
          <img 
            v-if="(item.thumbnail_url || item.url) && !brokenImages.has(item.id)"
            :src="item.thumbnail_url || item.url" 
            :alt="item.headline" 
            @error="handleImgError(item.id)"
            class="w-full h-full object-cover"
          />
          <!-- Holographic Sci-Fi Placeholder jika aset tidak memiliki gambar publik CDN -->
          <div v-else class="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-dark-950 via-[#071322] to-dark-900 relative">
            <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            <div class="w-12 h-12 rounded-2xl bg-dark-900 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-glow-cyan mb-2">
              <Video v-if="item.type === 'video'" class="w-6 h-6 text-cyan-400" />
              <Image v-else class="w-6 h-6 text-teal-400" />
            </div>
            <div class="text-[11px] font-bold text-white text-center line-clamp-1 max-w-[90%]">{{ item.headline }}</div>
            <div class="text-[9px] text-cyan-400/80 font-mono mt-1">META ADS VISUAL TELEMETRY</div>
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-80 pointer-events-none"></div>
          
          <!-- Media Type Badge -->
          <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
            <Video v-if="item.type === 'video'" class="w-3 h-3 text-cyan-400" />
            <Image v-else class="w-3 h-3 text-teal-400" />
            <span class="uppercase tracking-wider">{{ item.type }}</span>
          </div>

          <!-- Associated AdSet -->
          <div class="absolute bottom-3 right-3 text-[10px] font-medium text-slate-300 bg-black/70 px-2 py-0.5 rounded truncate max-w-[140px] border border-white/10">
            {{ item.adset_name }}
          </div>
        </div>

        <!-- Copy Preview -->
        <div class="space-y-1.5 mb-4">
          <h3 class="text-sm font-bold text-white line-clamp-1" :title="item.headline">
            {{ item.headline }}
          </h3>
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {{ item.primary_text || 'Aset kreatif terdaftar dalam kampanye aktif Meta Ads.' }}
          </p>
        </div>

        <!-- Performance Stats (CTR, CPR, Spend, Purchases) -->
        <div class="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-dark-850 border border-dark-750">
          <div>
            <span class="text-[9px] uppercase font-bold text-slate-500 block">CTR (High is Win)</span>
            <span class="text-xs font-mono font-extrabold text-teal-300">
              {{ (item.ctr || 0).toFixed(2) }}%
            </span>
          </div>
          <div>
            <span class="text-[9px] uppercase font-bold text-slate-500 block">CPR (Low is Win)</span>
            <span class="text-xs font-mono font-extrabold text-cyan-300">
              {{ formatIDR(item.cpr || 0) }}
            </span>
          </div>
          <div>
            <span class="text-[9px] uppercase font-bold text-slate-500 block">Total Spend</span>
            <span class="text-xs font-mono font-extrabold text-rose-300">
              {{ formatCompactIDR(item.total_spend || 0) }}
            </span>
          </div>
          <div>
            <span class="text-[9px] uppercase font-bold text-slate-500 block">Total Orders</span>
            <span class="text-xs font-mono font-extrabold text-amber-300">
              {{ item.total_purchases || 0 }} Purchases
            </span>
          </div>
        </div>

        <!-- Bottom Tag -->
        <div class="mt-4 pt-3 border-t border-dark-800 flex items-center justify-between text-[11px]">
          <span class="text-slate-500 font-medium">Clicks: {{ (item.total_clicks || 0).toLocaleString('id-ID') }}</span>
          <span 
            v-if="index === 0" 
            class="text-amber-400 font-bold flex items-center gap-1"
          >
            🔥 Scaled Asset
          </span>
          <span 
            v-else-if="item.ctr > 2.0" 
            class="text-teal-400 font-bold"
          >
            ✓ Winning Hook
          </span>
          <span 
            v-else 
            class="text-slate-400"
          >
            Testing Phase
          </span>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Trophy, Crown, Video, Image, RefreshCw } from 'lucide-vue-next';
import { calculateCreativeScore } from '../utils/kpiRules';
import { formatIDR, formatCompactIDR } from '../utils/currency';

const props = defineProps({
  assets: {
    type: Array,
    required: true
  },
  isSyncing: {
    type: Boolean,
    default: false
  }
});

defineEmits(['trigger-sync', 'open-settings']);

const activeFilter = ref('all');
const brokenImages = ref(new Set());

const handleImgError = (id) => {
  brokenImages.value.add(id);
};

const rankedAssets = computed(() => {
  const filtered = (props.assets || []).filter(a => {
    if (activeFilter.value === 'all') return true;
    return a.type === activeFilter.value;
  });

  return filtered.map(a => {
    const { score, ctr, cpr } = calculateCreativeScore(a);
    return {
      ...a,
      score,
      ctr,
      cpr
    };
  }).sort((a, b) => b.score - a.score);
});
</script>
