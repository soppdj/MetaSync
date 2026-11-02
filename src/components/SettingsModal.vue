<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
    <div class="bg-dark-900 border border-cyan-500/30 rounded-3xl w-full max-w-2xl shadow-glow-cyan overflow-hidden flex flex-col max-h-[92vh] relative">
      
      <!-- Top Holographic Scanline Accent -->
      <div class="scanline-effect"></div>

      <!-- Modal Header -->
      <div class="p-5 sm:p-6 border-b border-dark-800 flex items-center justify-between bg-dark-850">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-dark-800 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-glow-cyan">
            <Settings class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
              <span>Integrasi & API Keys</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">v21.0 Live</span>
            </h2>
            <p class="text-xs text-slate-400">Diagnostik dan uji koneksi langsung untuk Supabase, Meta Ads, Telegram, dan Gemini</p>
          </div>
        </div>

        <button 
          @click="$emit('close')" 
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-750 transition-all"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Settings Form & Diagnostics -->
      <form @submit.prevent="handleSave" class="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs">

        <!-- ========================================================
             1. SUPABASE INTEGRATION
             ======================================================== -->
        <div class="space-y-3 p-4 sm:p-5 rounded-2xl bg-dark-850 border border-dark-750 hover:border-emerald-500/40 transition-all">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Database class="w-4 h-4 text-emerald-400" />
              1. Supabase (Database & Realtime)
            </span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="copySqlSchema"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900 transition-all flex items-center gap-1 font-mono"
                title="Salin Schema SQL untuk dijalankan di Supabase SQL Editor"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>{{ copiedSql ? 'Tersalin!' : 'Salin Schema SQL' }}</span>
              </button>
              <button
                type="button"
                @click="showSqlModal = !showSqlModal"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 bg-dark-800 border border-dark-700 hover:border-cyan-500/40 transition-all flex items-center gap-1 font-mono"
              >
                <Code class="w-3.5 h-3.5 text-cyan-400" />
                <span>{{ showSqlModal ? 'Tutup SQL' : 'Lihat SQL' }}</span>
              </button>
            </div>
          </div>

          <!-- Petunjuk Singkat Setup Supabase -->
          <div class="p-3 rounded-xl bg-dark-900/90 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
            <p class="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
              <span>Cara Menghubungkan Supabase:</span>
            </p>
            <ol class="list-decimal list-inside text-[10px] text-slate-400 space-y-0.5 leading-relaxed">
              <li>Buka <a href="https://supabase.com/dashboard" target="_blank" class="text-cyan-300 underline font-semibold">Supabase Dashboard</a> &gt; Pilih Project Anda &gt; menu <b>SQL Editor</b>.</li>
              <li>Klik tombol <b>"Salin Schema SQL"</b> di atas, tempel (*paste*) ke SQL Editor, lalu klik tombol hijau <b>RUN</b>.</li>
              <li>Salin <b>Project URL</b> dan <b>Anon / Public Key</b> dari menu <i>Project Settings &gt; API</i> ke kolom di bawah.</li>
            </ol>
          </div>

          <!-- Input Fields Supabase -->
          <div class="space-y-3 pt-1">
            <div>
              <label class="block text-slate-400 font-semibold mb-1">Project URL</label>
              <input
                v-model="form.supabaseUrl"
                type="text"
                placeholder="https://your-project.supabase.co"
                class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs"
              />
            </div>

            <div>
              <label class="block text-slate-400 font-semibold mb-1">Anon / Public Key</label>
              <div class="relative">
                <input
                  v-model="form.supabaseKey"
                  :type="showKeys.supabase ? 'text' : 'password'"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-emerald-500 transition-all text-xs pr-10"
                />
                <button 
                  type="button" 
                  @click="showKeys.supabase = !showKeys.supabase" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <Eye v-if="!showKeys.supabase" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Tombol Tes Koneksi Supabase & Hasil -->
          <div class="pt-2 flex flex-col gap-2">
            <button
              type="button"
              @click="runTestSupabase"
              :disabled="testingState.supabase"
              class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <RefreshCw v-if="testingState.supabase" class="w-3.5 h-3.5 animate-spin" />
              <Zap v-else class="w-3.5 h-3.5 text-emerald-400" />
              <span>{{ testingState.supabase ? 'Menguji Koneksi Supabase...' : '⚡ Tes Koneksi Supabase' }}</span>
            </button>

            <!-- Status Banner Supabase -->
            <div 
              v-if="testResults.supabase" 
              class="p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2"
              :class="testResults.supabase.success ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/50' : 'bg-rose-950/60 text-rose-200 border-rose-500/50'"
            >
              <CheckCircle2 v-if="testResults.supabase.success" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <AlertCircle v-else class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div class="space-y-0.5 flex-1">
                <div class="font-bold">{{ testResults.supabase.message }}</div>
                <div v-if="testResults.supabase.code === 'TABLES_MISSING'" class="text-[10px] text-amber-300 font-sans">
                  💡 Solusi: Klik tombol <b>"Salin Schema SQL"</b> di atas, lalu jalankan di Supabase SQL Editor.
                </div>
              </div>
            </div>
          </div>

          <!-- Accordion View Schema SQL -->
          <div v-if="showSqlModal" class="mt-3 p-3 rounded-xl bg-dark-950 border border-dark-700 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono text-cyan-300 font-bold">PostgreSQL Schema SQL (Supabase)</span>
              <button
                type="button"
                @click="copySqlSchema"
                class="text-[10px] text-emerald-400 hover:underline font-bold"
              >
                Salin ke Clipboard
              </button>
            </div>
            <pre class="max-h-48 overflow-y-auto p-2.5 rounded bg-dark-900 text-[10px] text-slate-300 font-mono select-all whitespace-pre-wrap leading-relaxed">{{ SUPABASE_SCHEMA_SQL }}</pre>
          </div>
        </div>

        <!-- ========================================================
             2. META MARKETING GRAPH API (v21.0)
             ======================================================== -->
        <div class="space-y-3 p-4 sm:p-5 rounded-2xl bg-dark-850 border border-dark-750 hover:border-blue-500/40 transition-all">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Facebook class="w-4 h-4 text-blue-400" />
              2. Meta Graph API (Marketing API v21.0)
            </span>
            <span class="text-[10px] text-blue-300 font-mono font-bold bg-blue-950/60 px-2 py-0.5 border border-blue-500/30 rounded">ads_read & ads_management</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Ad Account ID</label>
            <input
              v-model="form.metaAccount"
              type="text"
              placeholder="act_1252088640428224 atau 1252088640428224"
              class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-blue-500 transition-all text-xs"
            />
            <span class="text-[10px] text-slate-500 mt-1 block">Otomatis ditambahkan prefix <code>act_</code> jika belum ada.</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">System User Access Token</label>
            <div class="relative">
              <input
                v-model="form.metaToken"
                :type="showKeys.meta ? 'text' : 'password'"
                placeholder="EAAGm0PX4ZCBO..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-blue-500 transition-all text-xs pr-10"
              />
              <button 
                type="button" 
                @click="showKeys.meta = !showKeys.meta" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Eye v-if="!showKeys.meta" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <span class="text-[10px] text-slate-500 mt-1 block">Didapat dari Meta Business Manager &gt; Users &gt; System Users &gt; Generate Token.</span>
          </div>

          <!-- Tombol Tes Koneksi Meta & Hasil -->
          <div class="pt-2 flex flex-col gap-2">
            <button
              type="button"
              @click="runTestMeta"
              :disabled="testingState.meta"
              class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-blue-300 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <RefreshCw v-if="testingState.meta" class="w-3.5 h-3.5 animate-spin" />
              <Zap v-else class="w-3.5 h-3.5 text-blue-400" />
              <span>{{ testingState.meta ? 'Menghubungkan ke Meta Graph v21.0...' : '⚡ Tes Koneksi Meta Ads' }}</span>
            </button>

            <!-- Status Banner Meta -->
            <div 
              v-if="testResults.meta" 
              class="p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2"
              :class="testResults.meta.success ? 'bg-blue-950/60 text-blue-200 border-blue-500/50' : 'bg-rose-950/60 text-rose-200 border-rose-500/50'"
            >
              <CheckCircle2 v-if="testResults.meta.success" class="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <AlertCircle v-else class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div class="space-y-0.5 flex-1">
                <div class="font-bold">{{ testResults.meta.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================================
             3. TELEGRAM BOT API
             ======================================================== -->
        <div class="space-y-3 p-4 sm:p-5 rounded-2xl bg-dark-850 border border-dark-750 hover:border-cyan-500/40 transition-all">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Send class="w-4 h-4 text-cyan-400" />
              3. Telegram Bot
            </span>
            <span class="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 border border-cyan-500/30 rounded">Alerts & Kill AdSet</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Bot Token (dari @BotFather)</label>
            <div class="relative">
              <input
                v-model="form.telegramToken"
                :type="showKeys.telegram ? 'text' : 'password'"
                placeholder="719284712:AAH92..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-cyan-500 transition-all text-xs pr-10"
              />
              <button 
                type="button" 
                @click="showKeys.telegram = !showKeys.telegram" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Eye v-if="!showKeys.telegram" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Target Chat ID (Grup / Channel / User)</label>
            <input
              v-model="form.telegramChat"
              type="text"
              placeholder="619284710 atau -100xxxxxxxxxx"
              class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-cyan-500 transition-all text-xs"
            />
          </div>

          <!-- Tombol Tes Telegram & Hasil -->
          <div class="pt-2 flex flex-col gap-2">
            <button
              type="button"
              @click="runTestTelegram"
              :disabled="testingState.telegram"
              class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <RefreshCw v-if="testingState.telegram" class="w-3.5 h-3.5 animate-spin" />
              <Zap v-else class="w-3.5 h-3.5 text-cyan-400" />
              <span>{{ testingState.telegram ? 'Mengirim Ping Telegram...' : '⚡ Tes Kirim Pesan Telegram' }}</span>
            </button>

            <!-- Status Banner Telegram -->
            <div 
              v-if="testResults.telegram" 
              class="p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2"
              :class="testResults.telegram.success ? 'bg-cyan-950/60 text-cyan-200 border-cyan-500/50' : 'bg-rose-950/60 text-rose-200 border-rose-500/50'"
            >
              <CheckCircle2 v-if="testResults.telegram.success" class="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <AlertCircle v-else class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div class="space-y-0.5 flex-1">
                <div class="font-bold">{{ testResults.telegram.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================================
             4. GOOGLE GEMINI API (CONTENT STUDIO)
             ======================================================== -->
        <div class="space-y-3 p-4 sm:p-5 rounded-2xl bg-dark-850 border border-dark-750 hover:border-teal-500/40 transition-all">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sparkles class="w-4 h-4 text-teal-400" />
              4. Google Gemini API (AI Studio)
            </span>
            <span class="text-[10px] text-teal-300 font-mono font-bold bg-teal-950/60 px-2 py-0.5 border border-teal-500/30 rounded">Gemini 1.5 Pro / Flash</span>
          </div>

          <div>
            <label class="block text-slate-400 font-semibold mb-1">Gemini API Key</label>
            <div class="relative">
              <input
                v-model="form.geminiKey"
                :type="showKeys.gemini ? 'text' : 'password'"
                placeholder="AIzaSyA..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-teal-500 transition-all text-xs pr-10"
              />
              <button 
                type="button" 
                @click="showKeys.gemini = !showKeys.gemini" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Eye v-if="!showKeys.gemini" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <span class="text-[10px] text-slate-500 mt-1 block">Dapatkan gratis di <a href="https://aistudio.google.com" target="_blank" class="text-teal-300 underline">Google AI Studio</a>.</span>
          </div>

          <!-- Tombol Tes Gemini & Hasil -->
          <div class="pt-2 flex flex-col gap-2">
            <button
              type="button"
              @click="runTestGemini"
              :disabled="testingState.gemini"
              class="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-teal-300 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 transition-all flex items-center justify-center gap-2 font-mono"
            >
              <RefreshCw v-if="testingState.gemini" class="w-3.5 h-3.5 animate-spin" />
              <Zap v-else class="w-3.5 h-3.5 text-teal-400" />
              <span>{{ testingState.gemini ? 'Menguji Model Gemini...' : '⚡ Tes Koneksi Gemini AI' }}</span>
            </button>

            <!-- Status Banner Gemini -->
            <div 
              v-if="testResults.gemini" 
              class="p-2.5 rounded-xl border text-xs font-mono transition-all flex items-start gap-2"
              :class="testResults.gemini.success ? 'bg-teal-950/60 text-teal-200 border-teal-500/50' : 'bg-rose-950/60 text-rose-200 border-rose-500/50'"
            >
              <CheckCircle2 v-if="testResults.gemini.success" class="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <AlertCircle v-else class="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div class="space-y-0.5 flex-1">
                <div class="font-bold">{{ testResults.gemini.message }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================================
             5. PASSWORD KHUSUS ADMIN (MASTER PASSKEY)
             ======================================================== -->
        <div class="space-y-3 p-4 sm:p-5 rounded-2xl bg-dark-850 border border-dark-750 hover:border-copper-500/40 transition-all">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <KeyRound class="w-4 h-4 text-copper-400" />
              5. Password Khusus Admin
            </span>
            <button
              type="button"
              @click="form.adminPassword = 'fatherlab2026'"
              class="text-[10px] text-copper-400 hover:text-copper-300 font-mono font-bold hover:underline"
            >
              Reset ke Default
            </button>
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-slate-400 font-semibold">Kunci Sandi Admin (Terminal Passkey)</label>
              <span class="text-[10px] text-slate-500">Default: <code>fatherlab2026</code></span>
            </div>
            <input
              v-model="form.adminPassword"
              type="text"
              placeholder="fatherlab2026"
              class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-cyan-300 font-mono focus:outline-none focus:border-copper-500 transition-all text-xs font-bold"
            />
            <span class="text-[10px] text-slate-500 mt-1 block">Digunakan untuk membuka akses login terminal animasi MetaSync.</span>
          </div>
        </div>

        <!-- ========================================================
             MODAL ACTIONS & SIMPAN
             ======================================================== -->
        <div class="pt-4 border-t border-dark-800 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
            <span>Tersimpan aman di LocalStorage & Vercel Environment</span>
          </div>

          <div class="flex items-center gap-2.5">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-dark-800 hover:bg-dark-750 transition-all font-mono"
            >
              Tutup
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 rounded-xl text-xs font-black text-dark-950 bg-gradient-to-r from-brand-400 via-cyan-300 to-copper-400 shadow-glow-cyan hover:opacity-95 transition-all font-mono tracking-wide"
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
import { 
  Settings, 
  X, 
  Database, 
  Facebook, 
  Send, 
  Sparkles, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  Copy, 
  Code,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { 
  testSupabaseConnection, 
  testMetaConnection, 
  testTelegramConnection, 
  testGeminiConnection 
} from '../utils/integrationTester';
import { SUPABASE_SCHEMA_SQL } from '../utils/supabaseSchemaCode';

const props = defineProps({
  initialSettings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

const { activeMasterPassword } = useAuth();

// Form Data
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

// Show / Hide Password Toggles
const showKeys = ref({
  supabase: false,
  meta: false,
  telegram: false,
  gemini: false
});

// Testing States & Results
const testingState = ref({
  supabase: false,
  meta: false,
  telegram: false,
  gemini: false
});

const testResults = ref({
  supabase: null,
  meta: null,
  telegram: null,
  gemini: null
});

// SQL Schema Modal State
const showSqlModal = ref(false);
const copiedSql = ref(false);

const copySqlSchema = async () => {
  try {
    await navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    copiedSql.value = true;
    setTimeout(() => {
      copiedSql.value = false;
    }, 2500);
  } catch (err) {
    console.error('Failed to copy SQL:', err);
  }
};

// 1. Run Test Supabase
const runTestSupabase = async () => {
  testingState.value.supabase = true;
  testResults.value.supabase = null;
  try {
    const res = await testSupabaseConnection(form.value.supabaseUrl, form.value.supabaseKey);
    testResults.value.supabase = res;
  } finally {
    testingState.value.supabase = false;
  }
};

// 2. Run Test Meta Graph API
const runTestMeta = async () => {
  testingState.value.meta = true;
  testResults.value.meta = null;
  try {
    const res = await testMetaConnection(form.value.metaAccount, form.value.metaToken);
    testResults.value.meta = res;
  } finally {
    testingState.value.meta = false;
  }
};

// 3. Run Test Telegram Bot
const runTestTelegram = async () => {
  testingState.value.telegram = true;
  testResults.value.telegram = null;
  try {
    const res = await testTelegramConnection(form.value.telegramToken, form.value.telegramChat);
    testResults.value.telegram = res;
  } finally {
    testingState.value.telegram = false;
  }
};

// 4. Run Test Gemini AI
const runTestGemini = async () => {
  testingState.value.gemini = true;
  testResults.value.gemini = null;
  try {
    const res = await testGeminiConnection(form.value.geminiKey);
    testResults.value.gemini = res;
  } finally {
    testingState.value.gemini = false;
  }
};

const handleSave = () => {
  // Pastikan format account ID rapi
  if (form.value.metaAccount && !form.value.metaAccount.startsWith('act_')) {
    form.value.metaAccount = `act_${form.value.metaAccount.trim()}`;
  }
  emit('save', form.value);
};
</script>
