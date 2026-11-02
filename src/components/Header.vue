<template>
  <header class="sticky top-0 z-40 bg-[#060a14] border-b border-cyan-500/25 px-6 py-3 transition-all relative overflow-hidden">
    <!-- Top holographic scanline accent -->
    <div class="scanline-effect"></div>

    <div class="max-w-[1720px] mx-auto flex flex-col gap-2.5">
      
      <!-- BARIS 1: Brand & Status (Kiri) & Actions (Kanan) -->
      <div class="flex items-center justify-between w-full gap-4">
        
        <!-- KOTAK MERAH KIRI: Logo Relevan + Judul Satu Baris + metagraph live -->
        <div class="flex items-center gap-3.5">
          <!-- Logo Relevan MetaSync (Meta Infinity Ribbon + Sync Core) -->
          <div class="relative flex items-center justify-center w-11 h-11 bg-dark-950 border border-cyan-400/60 shadow-glow-cyan p-[1.5px] shrink-0 group hud-corner">
            <div class="w-full h-full bg-[#080e1c] flex items-center justify-center overflow-hidden">
              <svg class="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="metaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00F0FF" />
                    <stop offset="50%" stop-color="#22D3EE" />
                    <stop offset="100%" stop-color="#F97316" />
                  </linearGradient>
                </defs>
                <!-- Meta Infinity Ribbon -->
                <path d="M10 12C6.8 12 4.2 14.6 4.2 18C4.2 21.4 6.8 24 10 24C13.2 24 16 21.3 17.8 18C19.6 14.7 22.4 12 25.6 12C28.8 12 31.4 14.6 31.4 18C31.4 21.4 28.8 24 25.6 24C22.4 24 19.6 20.7 17.8 18C16 15.3 13.2 12 10 12Z" stroke="url(#metaGrad)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="17.8" cy="18" r="2.2" fill="#00F0FF" class="animate-pulse" />
              </svg>
            </div>
          </div>

          <!-- Judul & Subtitle -->
          <div class="flex flex-col">
            <!-- Judul dalam SATU BARIS -->
            <h1 class="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap flex items-center gap-2 font-mono">
              <span class="tracking-wide">MetaSync v.1.0 by FatherLab</span>
            </h1>

            <!-- metagraph live dengan icon online hijau di sebelah kiri -->
            <p class="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap mt-0.5 font-mono">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span class="text-cyan-300 font-bold">metagraph live</span>
              <span class="text-slate-600">&bull;</span>
              <span class="text-[10px] text-copper-400 font-bold">[ SYS_ORBIT: ACTIVE ]</span>
            </p>
          </div>
        </div>

        <!-- KOTAK MERAH KANAN: Actions & Sync -->
        <div class="flex items-center gap-2.5 shrink-0">
          
          <!-- Admin Status Indicator Badge -->
          <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-900 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
            <ShieldCheck class="w-3.5 h-3.5 text-cyan-400" />
            <span class="tracking-wider">{{ currentUser?.username?.toUpperCase() || 'ADMIN' }}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-glow-teal"></span>
          </div>

          <!-- Waktu Terakhir Sync -->
          <div class="hidden md:flex flex-col text-right">
            <span class="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">Terakhir Sync</span>
            <span class="text-xs font-mono font-bold text-cyan-300">{{ lastSyncedAt }}</span>
          </div>

          <!-- Tombol Refresh Sync -->
          <button
            @click="$emit('trigger-sync')"
            :disabled="isSyncing"
            class="group relative flex items-center gap-2 px-3.5 py-2 text-xs font-bold transition-all border disabled:opacity-60 bg-dark-900 hover:bg-dark-850 text-white border-cyan-500/40 hover:border-cyan-400 shadow-glow-cyan"
            title="Tarik data terkini dari Meta Graph API ke Supabase"
          >
            <RefreshCw 
              class="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:rotate-180" 
              :class="{ 'animate-spin text-cyan-300': isSyncing }" 
            />
            <span class="hidden sm:inline font-mono">{{ isSyncing ? 'Syncing...' : 'Refresh Sync' }}</span>
          </button>

          <!-- Tombol Proteksi Integritas Data (Anti-Reset Sentinel) -->
          <button
            @click="$emit('open-protection-modal')"
            class="group flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-500/40 hover:border-emerald-400 transition-all font-mono"
            title="Proteksi Integritas Data Kerja (Anti-Reset & Anti-Overwrite Backup)"
          >
            <ShieldCheck class="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span class="hidden xl:inline text-[11px]">Anti-Reset Active</span>
          </button>

          <!-- Tombol Campaign Baru -->
          <button
            @click="$emit('open-create-modal')"
            class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-dark-950 bg-gradient-to-r from-brand-400 via-cyan-300 to-copper-400 hover:opacity-95 shadow-glow-cyan transition-all font-mono tracking-wide"
          >
            <PlusCircle class="w-4 h-4" />
            <span class="hidden sm:inline">Campaign Baru</span>
          </button>

          <!-- Tombol Settings -->
          <button
            @click="$emit('open-settings')"
            class="flex items-center justify-center p-2 bg-dark-900 text-slate-400 hover:text-white hover:bg-dark-850 border border-dark-750 hover:border-cyan-500/40 transition-all"
            title="Konfigurasi API (Supabase, Meta, Gemini, Telegram, Admin Password)"
          >
            <Settings class="w-4 h-4" />
          </button>

          <!-- Tombol Kunci Terminal / Logout -->
          <button
            @click="$emit('lock-terminal')"
            class="flex items-center justify-center p-2 bg-dark-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-dark-750 hover:border-rose-500/40 transition-all group"
            title="Kunci Terminal & Logout (Kembali ke Login UI)"
          >
            <Lock class="w-4 h-4 group-hover:scale-110 transition-transform text-rose-400/80 group-hover:text-rose-400" />
          </button>
        </div>

      </div>

      <!-- BARIS 2 (KOTAK KUNING): Navigasi Tabs Turun ke Bawah Agar Lebih Lebar -->
      <div class="w-full pt-2.5 border-t border-cyan-500/15">
        <nav class="flex items-center gap-2 overflow-x-auto pb-1 max-w-full font-mono">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="$emit('update:activeTab', tab.id)"
            :class="[
              'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border',
              activeTab === tab.id
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 bg-dark-900/90 border-dark-800 hover:border-cyan-500/40'
            ]"
          >
            <component :is="tab.icon" class="w-4 h-4" :class="activeTab === tab.id ? 'text-cyan-300' : 'text-slate-500'" />
            <span class="tracking-wide">{{ tab.label }}</span>
            <span v-if="activeTab === tab.id" class="w-1.5 h-1.5 bg-cyan-400 shadow-glow-cyan"></span>
          </button>
        </nav>
      </div>

    </div>
  </header>
</template>

<script setup>
import { 
  LayoutDashboard, 
  Orbit, 
  Trophy, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  PlusCircle, 
  Settings,
  ShieldCheck,
  Lock
} from 'lucide-vue-next';

defineProps({
  activeTab: {
    type: String,
    default: 'dashboard'
  },
  isSyncing: {
    type: Boolean,
    default: false
  },
  lastSyncedAt: {
    type: String,
    default: '-'
  },
  currentUser: {
    type: Object,
    default: () => ({ username: 'admin', role: 'SUPER_ADMIN' })
  }
});

defineEmits(['update:activeTab', 'trigger-sync', 'open-create-modal', 'open-settings', 'open-protection-modal', 'lock-terminal']);

// Tabs navigasi: MetaSync di sebelah MetaLab
const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'metalab', label: 'MetaLab', icon: Orbit },
  { id: 'metasync', label: 'MetaSync', icon: RefreshCw },
  { id: 'leaderboard', label: 'Creative Leaderboard', icon: Trophy },
  { id: 'content-studio', label: 'Content Studio', icon: Sparkles },
  { id: 'reports', label: 'Report', icon: FileText },
];
</script>
