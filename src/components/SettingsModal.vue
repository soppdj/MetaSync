<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
    <div class="bg-dark-900 border border-dark-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-dark-800 flex items-center justify-between bg-dark-850">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-center text-teal-400">
            <Settings class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-bold text-white">Integrasi & API Keys</h2>
            <p class="text-xs text-slate-400">Kredensial Meta Graph API, Supabase, Telegram Bot, Gemini, dan Password Admin</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-750 transition-all"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Settings Form -->
      <form @submit.prevent="handleSave" class="p-6 overflow-y-auto space-y-5 text-xs">
        
        <!-- Supabase Section -->
        <div class="space-y-3 p-4 rounded-2xl bg-dark-850 border border-dark-750">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Database class="w-4 h-4 text-emerald-400" />
              1. Supabase
            </span>
            <span class="text-[10px] text-slate-400">Database Schema</span>
          </div>
          
          <div>
            <label class="block text-slate-400 font-semibold mb-1">Project URL</label>
            <input
              v-model="form.supabaseUrl"
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Anon / Public Key</label>
            <input
              v-model="form.supabaseKey"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <!-- Meta Graph API Section -->
        <div class="space-y-3 p-4 rounded-2xl bg-dark-850 border border-dark-750">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Facebook class="w-4 h-4 text-blue-400" />
              2. Meta Graph API
            </span>
            <span class="text-[10px] text-slate-400">ads_read & ads_management</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Ad Account ID</label>
            <input
              v-model="form.metaAccount"
              type="text"
              placeholder="act_102938475612 atau 102938475612"
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">System User Access Token</label>
            <input
              v-model="form.metaToken"
              type="password"
              placeholder="EAAGm0PX4ZCBO..."
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <!-- Telegram Bot API Section -->
        <div class="space-y-3 p-4 rounded-2xl bg-dark-850 border border-dark-750">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Send class="w-4 h-4 text-cyan-400" />
              3. Telegram Bot
            </span>
            <span class="text-[10px] text-slate-400">Alerts & /kill adset</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Bot Token (dari @BotFather)</label>
            <input
              v-model="form.telegramToken"
              type="password"
              placeholder="719284712:AAH92..."
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Target Chat ID (Grup / Channel / User)</label>
            <input
              v-model="form.telegramChat"
              type="text"
              placeholder="619284710"
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <!-- Google Gemini Pro API -->
        <div class="space-y-3 p-4 rounded-2xl bg-dark-850 border border-dark-750">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-teal-400" />
              4. Google Gemini API
            </span>
            <span class="text-[10px] text-slate-400">Google AI Studio</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Gemini API Key</label>
            <input
              v-model="form.geminiKey"
              type="password"
              placeholder="AIzaSyA..."
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <!-- 5. Password Khusus Admin Section -->
        <div class="space-y-3 p-4 rounded-2xl bg-dark-850 border border-dark-750">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound class="w-4 h-4 text-copper-400" />
              5. Password Khusus Admin
            </span>
            <span class="text-[10px] text-copper-300 font-mono">Terminal Passkey</span>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-slate-400 font-semibold">Kunci Sandi Admin (Terminal Passkey)</label>
              <span class="text-[10px] text-slate-500">Default: fatherlab2026</span>
            </div>
            <input
              v-model="form.adminPassword"
              type="text"
              placeholder="fatherlab2026"
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-cyan-300 font-mono focus:outline-none focus:border-brand-500 font-bold"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-dark-800 flex items-center justify-between">
          <span class="text-[10px] text-slate-500">Tersimpan aman di LocalStorage & Vercel Environment</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Tutup
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-teal-500 shadow-glow-teal hover:opacity-95"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Settings, X, Database, Facebook, Send, Sparkles, KeyRound } from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';

const props = defineProps({
  initialSettings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

const { activeMasterPassword } = useAuth();

const form = ref({
  supabaseUrl: props.initialSettings.supabaseUrl || '',
  supabaseKey: props.initialSettings.supabaseKey || '',
  metaAccount: props.initialSettings.metaAccount || '',
  metaToken: props.initialSettings.metaToken || '',
  telegramToken: props.initialSettings.telegramToken || '',
  telegramChat: props.initialSettings.telegramChat || '',
  geminiKey: props.initialSettings.geminiKey || '',
  adminPassword: activeMasterPassword.value || 'fatherlab2026'
});

const handleSave = () => {
  emit('save', form.value);
};
</script>
