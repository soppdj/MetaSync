<template>
  <div 
    class="flex flex-col p-2 rounded-lg border text-xs transition-all relative overflow-hidden"
    :class="statusClass"
  >
    <div class="flex items-center justify-between gap-1 mb-1">
      <span class="text-[10px] font-bold tracking-wider uppercase opacity-80 truncate" :title="kpi.description">
        {{ kpi.name }}
      </span>
      <span class="text-[9px] font-mono px-1 rounded bg-black/30 border border-white/5 opacity-90 truncate">
        {{ kpi.targetFormatted }}
      </span>
    </div>
    <div class="flex items-baseline justify-between">
      <span class="text-xs font-extrabold font-mono tracking-tight">
        {{ kpi.actualFormatted }}
      </span>
      <span class="text-[10px] font-bold">
        <span v-if="kpi.status === 'pass'" class="text-emerald-400">✓ PASS</span>
        <span v-else-if="kpi.status === 'warning'" class="text-amber-400">⚠ WARN</span>
        <span v-else class="text-rose-400">✕ FAIL</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  kpi: {
    type: Object,
    required: true
  }
});

const statusClass = computed(() => {
  switch (props.kpi.status) {
    case 'pass':
      return 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200';
    case 'warning':
      return 'bg-amber-950/25 border-amber-500/30 text-amber-200';
    case 'fail':
    default:
      return 'bg-rose-950/25 border-rose-500/30 text-rose-200';
  }
});
</script>
