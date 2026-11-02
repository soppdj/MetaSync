<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
    <div class="bg-dark-900 border border-dark-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-850">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-glow-teal">
            <PlusCircle class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white">Buat Campaign Baru</h2>
            <p class="text-xs text-slate-400">Wajibkan input Harga Jual & HPP untuk kalkulasi KPI dinamis</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-750 transition-all"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-4">
        
        <!-- Campaign Name -->
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Nama Campaign <span class="text-rose-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Contoh: TEST - Brightening Night Cream 50g"
            class="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        <!-- Pricing Grid: Harga Jual & HPP/COGS (MANDATORY) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-dark-850 border border-dark-750">
          <div>
            <label class="block text-xs font-bold text-teal-300 uppercase tracking-wider mb-1.5">
              Harga Jual Item (IDR) <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">Rp</span>
              <input
                v-model.number="form.base_price"
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="149000"
                class="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-sm font-mono font-bold text-teal-300 focus:outline-none focus:border-brand-500"
              />
            </div>
            <span class="text-[10px] text-slate-400 mt-1 block">Patokan perhitungan CPC, Cost LPV, dan CPR</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              HPP / COGS (IDR) <span class="text-rose-400">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">Rp</span>
              <input
                v-model.number="form.cogs"
                type="number"
                min="0"
                step="1000"
                required
                placeholder="38000"
                class="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-sm font-mono font-bold text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <span class="text-[10px] text-slate-400 mt-1 block">Biaya produksi per unit untuk laba bersih</span>
          </div>
        </div>

        <!-- Live KPI Targets Preview Box -->
        <div v-if="form.base_price > 0" class="p-4 rounded-2xl bg-brand-950/20 border border-brand-500/20 space-y-2">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
            <Calculator class="w-3.5 h-3.5" />
            Target KPI Otomatis FatherLab
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div class="p-2 rounded-lg bg-dark-900/80 border border-dark-700">
              <span class="text-[9px] text-slate-400 block uppercase">Target CPC (1%)</span>
              <span class="font-mono font-bold text-teal-300">≤ {{ formatIDR(form.base_price * 0.01) }}</span>
            </div>
            <div class="p-2 rounded-lg bg-dark-900/80 border border-dark-700">
              <span class="text-[9px] text-slate-400 block uppercase">Cost LPV (2-3%)</span>
              <span class="font-mono font-bold text-teal-300">≤ {{ formatIDR(form.base_price * 0.03) }}</span>
            </div>
            <div class="p-2 rounded-lg bg-dark-900/80 border border-dark-700">
              <span class="text-[9px] text-slate-400 block uppercase">Target CPR (25%)</span>
              <span class="font-mono font-bold text-teal-300">≤ {{ formatIDR(form.base_price * 0.25) }}</span>
            </div>
            <div class="p-2 rounded-lg bg-dark-900/80 border border-dark-700">
              <span class="text-[9px] text-slate-400 block uppercase">BEP ROAS</span>
              <span class="font-mono font-bold text-amber-300">
                {{ bepRoas }}
              </span>
            </div>
          </div>
        </div>

        <!-- Lifecycle Stage & Daily Budget -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Tahap Lifecycle
            </label>
            <select
              v-model="form.status"
              class="w-full px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="test">1. TEST (Finding Creative & Angle)</option>
              <option value="scale1">2. SCALE 1 (Winning Adset & LLA)</option>
              <option value="scale2">3. SCALE 2 (Final Full Scale)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Anggaran Harian (IDR)
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-2.5 text-xs font-mono font-bold text-slate-400">Rp</span>
              <input
                v-model.number="form.daily_budget"
                type="number"
                step="50000"
                min="50000"
                placeholder="500000"
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <!-- Meta Campaign ID (Optional) -->
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Meta Campaign ID (Opsional)
          </label>
          <input
            v-model="form.meta_campaign_id"
            type="text"
            placeholder="cmp_120208192837482"
            class="w-full px-4 py-2 rounded-xl bg-dark-800 border border-dark-750 text-xs font-mono text-slate-300 focus:outline-none focus:border-brand-500"
          />
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-dark-800 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-dark-800 transition-all"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 shadow-glow-teal transition-all"
          >
            Simpan & Aktifkan Engine
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { PlusCircle, X, Calculator } from 'lucide-vue-next';
import { formatIDR } from '../utils/currency';

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  base_price: 149000,
  cogs: 38000,
  status: 'test',
  daily_budget: 500000,
  meta_campaign_id: ''
});

const bepRoas = computed(() => {
  const profitMargin = form.value.base_price - form.value.cogs;
  if (profitMargin <= 0) return 'N/A';
  return (form.value.base_price / profitMargin).toFixed(2) + 'x';
});

const handleSubmit = () => {
  emit('save', {
    ...form.value,
    meta_campaign_id: form.value.meta_campaign_id || `cmp_${Date.now()}`
  });
};
</script>
