<template>
  <div 
    class="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-[#040711] text-slate-100 font-mono select-none px-4 py-6"
    :class="{ 'opacity-0 scale-105 pointer-events-none transition-all duration-700': isUnlocked }"
  >
    <!-- ==========================================
         BACKGROUND SCI-FI TELEMETRY & ORBITAL HUD
         ========================================== -->
    
    <!-- 1. Deep Space Cyber Grid (120px / 24px) -->
    <div class="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(to_right,rgba(0,240,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.06)_1px,transparent_1px),linear-gradient(to_right,rgba(36,55,85,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(36,55,85,0.2)_1px,transparent_1px)] bg-[size:120px_120px,120px_120px,24px_24px,24px_24px]"></div>

    <!-- 2. Concentric Orbital HUD Rings & Radar Sweep (SVG) -->
    <div class="absolute w-[720px] h-[720px] pointer-events-none opacity-20 flex items-center justify-center">
      <!-- Outer Orbit Ring with Degree Markers -->
      <svg class="w-full h-full animate-orbit" viewBox="0 0 800 800">
        <circle cx="400" cy="400" r="380" fill="none" stroke="#00F0FF" stroke-width="1" stroke-dasharray="8 12" opacity="0.6"/>
        <circle cx="400" cy="400" r="320" fill="none" stroke="#F97316" stroke-width="1.2" stroke-dasharray="16 24 4 12" opacity="0.5"/>
        <circle cx="400" cy="400" r="260" fill="none" stroke="#00F0FF" stroke-width="0.8" stroke-dasharray="4 8" opacity="0.4"/>
        
        <!-- Degree Ticks -->
        <text x="400" y="15" fill="#00F0FF" font-size="10" text-anchor="middle" font-family="monospace">000° NORTH</text>
        <text x="785" y="405" fill="#00F0FF" font-size="10" text-anchor="end" font-family="monospace">090° EAST</text>
        <text x="400" y="790" fill="#00F0FF" font-size="10" text-anchor="middle" font-family="monospace">180° SOUTH</text>
        <text x="15" y="405" fill="#00F0FF" font-size="10" text-anchor="start" font-family="monospace">270° WEST</text>
      </svg>

      <!-- Reverse Inner Orbit Ring -->
      <svg class="absolute w-[460px] h-[460px] animate-orbit-reverse" viewBox="0 0 500 500">
        <circle cx="250" cy="250" r="240" fill="none" stroke="#22D3EE" stroke-width="1.5" stroke-dasharray="20 40" opacity="0.5"/>
        <circle cx="250" cy="250" r="180" fill="none" stroke="#00F0FF" stroke-width="0.75" stroke-dasharray="6 6" opacity="0.4"/>
      </svg>

      <!-- Radar Sweep Beam (Rotating 360) -->
      <div class="absolute w-[650px] h-[650px] rounded-full animate-radar-sweep pointer-events-none opacity-20">
        <div class="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/40 via-cyan-500/10 to-transparent origin-bottom-right rounded-tl-full"></div>
      </div>
    </div>

    <!-- 3. Ambient Telemetry Data Columns (Kiri & Kanan Layar) -->
    <div class="hidden xl:flex flex-col justify-between absolute left-8 top-16 bottom-16 w-60 pointer-events-none text-[10px] text-slate-500 leading-relaxed font-mono">
      <div class="space-y-1.5 border-l border-cyan-500/30 pl-3">
        <div class="text-cyan-400 font-bold tracking-widest">[ SYS_TELEMETRY ]</div>
        <div>HOST: <span class="text-slate-300">metasync.internal</span></div>
        <div>CIPHER: <span class="text-copper-400">AES-256-GCM / SHA384</span></div>
        <div>ENC_KEY: <span class="text-slate-400">0x8F9...B24</span></div>
        <div>TLS_SESSION: <span class="text-emerald-400">ACTIVE // TLS 1.3</span></div>
      </div>

      <div class="space-y-1 opacity-60">
        <div class="text-[9px] text-cyan-400 font-bold">STREAM BUFFER:</div>
        <div class="text-[9px] text-slate-400 truncate">01000110 01000001 01010100</div>
        <div class="text-[9px] text-slate-400 truncate">01001000 01000101 01010010</div>
        <div class="text-[9px] text-slate-400 truncate">01001100 01000001 01000010</div>
      </div>
    </div>

    <div class="hidden xl:flex flex-col justify-between absolute right-8 top-16 bottom-16 w-60 pointer-events-none text-[10px] text-slate-500 leading-relaxed font-mono text-right">
      <div class="space-y-1.5 border-r border-copper-500/40 pr-3">
        <div class="text-copper-400 font-bold tracking-widest">[ SECURITY_MATRIX ]</div>
        <div>DEFCON: <span class="text-emerald-400">LEVEL 5 (NORMAL)</span></div>
        <div>ORBIT_LATENCY: <span class="text-cyan-300">{{ pingLatency }} ms</span></div>
        <div>AUTH_ATTEMPTS: <span :class="failedAttempts > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'">{{ failedAttempts }}/5</span></div>
        <div>SENTINEL_GUARD: <span class="text-emerald-400">ARMED</span></div>
      </div>

      <div class="space-y-1 opacity-60">
        <div class="text-[9px] text-copper-400 font-bold">TARGET DATASET:</div>
        <div class="text-[9px] text-slate-400">META_GRAPH_V21: ONLINE</div>
        <div class="text-[9px] text-slate-400">SUPABASE_PG15: CONNECTED</div>
        <div class="text-[9px] text-slate-400">GEMINI_1.5_PRO: STREAMING</div>
      </div>
    </div>

    <!-- 4. Top Telemetry Bar (Tanpa Restricted Access Terminal) -->
    <header class="absolute top-0 left-0 right-0 h-10 border-b border-cyan-500/20 bg-[#060a14]/90 px-6 flex items-center justify-between z-20">
      <div class="flex items-center gap-3 text-xs">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
        </span>
        <span class="text-cyan-400 font-bold tracking-wider text-[11px]">METASYNC PROTOCOL v1.7.0</span>
      </div>

      <div class="flex items-center gap-4 text-xs">
        <!-- Live WIB Clock -->
        <div class="flex items-center gap-1.5 text-slate-300 text-[11px]">
          <Clock class="w-3.5 h-3.5 text-cyan-400" />
          <span>{{ currentTime }}</span>
        </div>

        <span class="text-slate-600">|</span>

        <!-- Audio Mute Toggle Button -->
        <button 
          @click="toggleAudio" 
          class="flex items-center gap-1 px-2 py-0.5 rounded bg-dark-900 border border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 transition-all text-[10px]"
          :title="isMuted ? 'Aktifkan Efek Suara HUD' : 'Matikan Efek Suara HUD'"
        >
          <Volume2 v-if="!isMuted" class="w-3.5 h-3.5 text-cyan-400" />
          <VolumeX v-else class="w-3.5 h-3.5 text-slate-500" />
          <span class="hidden sm:inline font-mono">{{ isMuted ? 'Muted' : 'SFX ON' }}</span>
        </button>
      </div>
    </header>

    <!-- ==========================================
         CENTRAL INTERACTIVE SCI-FI TERMINAL BOX
         (COMPACT & VIEWPORT OPTIMIZED AT 100% ZOOM)
         ========================================== -->
    <div 
      class="relative z-20 w-full max-w-[460px] mx-auto transition-all duration-300 my-auto max-h-[calc(100vh-4.5rem)] overflow-y-auto custom-scrollbar"
      :class="{ 'animate-cyber-shake': isShaking }"
    >
      <!-- HUD Panel Box with Cyber Angles -->
      <div class="hud-panel hud-corner hud-crosshair p-5 sm:p-6 bg-[#070c17]/95 border-2 shadow-glow-cyan relative overflow-hidden"
        :class="[
          authStatus === 'error' ? 'border-rose-500/80 shadow-glow-rose' :
          authStatus === 'success' ? 'border-emerald-400/90 shadow-glow-teal' :
          'border-cyan-500/40 hover:border-cyan-400/70'
        ]"
      >
        <!-- Holographic Vertical Scanline Beam -->
        <div class="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-cyber-scan pointer-events-none"></div>

        <!-- Terminal Header & MetaSync Logo -->
        <div class="flex flex-col items-center text-center mb-4">
          
          <!-- Animated Meta Infinity Logo Box -->
          <div class="relative flex items-center justify-center w-12 h-12 bg-dark-950 border border-cyan-400 shadow-glow-cyan p-1 shrink-0 mb-2 hud-corner group">
            <div class="w-full h-full bg-[#080e1c] flex items-center justify-center overflow-hidden relative">
              <svg class="w-7 h-7 transition-transform group-hover:scale-110" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="metaGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#00F0FF" />
                    <stop offset="50%" stop-color="#22D3EE" />
                    <stop offset="100%" stop-color="#F97316" />
                  </linearGradient>
                </defs>
                <path d="M10 12C6.8 12 4.2 14.6 4.2 18C4.2 21.4 6.8 24 10 24C13.2 24 16 21.3 17.8 18C19.6 14.7 22.4 12 25.6 12C28.8 12 31.4 14.6 31.4 18C31.4 21.4 28.8 24 25.6 24C22.4 24 19.6 20.7 17.8 18C16 15.3 13.2 12 10 12Z" stroke="url(#metaGradLogin)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="17.8" cy="18" r="2" fill="#00F0FF" class="animate-pulse" />
              </svg>
            </div>
          </div>

          <!-- Brand & Terminal Title -->
          <h1 class="text-base sm:text-lg font-black tracking-wider text-white flex items-center gap-2">
            <span>METASYNC TERMINAL</span>
          </h1>
          <p class="text-[11px] text-slate-400 mt-0.5">
            FatherLab Direct-Response Operations
          </p>
        </div>

        <!-- System Handshake Status Indicator -->
        <div 
          class="mb-4 p-2 border text-[11px] font-bold flex items-center justify-between transition-all"
          :class="[
            authStatus === 'error' ? 'bg-rose-950/60 border-rose-500/60 text-rose-300' :
            authStatus === 'success' ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300' :
            authStatus === 'authenticating' ? 'bg-amber-950/60 border-amber-500/60 text-amber-300' :
            'bg-dark-900/80 border-cyan-500/20 text-cyan-400'
          ]"
        >
          <div class="flex items-center gap-2 truncate">
            <span class="w-2 h-2 rounded-full shrink-0" 
              :class="[
                authStatus === 'error' ? 'bg-rose-500 animate-ping' :
                authStatus === 'success' ? 'bg-emerald-400' :
                authStatus === 'authenticating' ? 'bg-amber-400 animate-pulse' :
                'bg-cyan-400'
              ]"
            ></span>
            <span class="truncate">{{ statusMessage }}</span>
          </div>
          <span class="text-[9px] uppercase tracking-wider text-slate-500 shrink-0 ml-2 font-mono">
            {{ authStatus.toUpperCase() }}
          </span>
        </div>

        <!-- ==========================================
             FORM LOGIN (ADMIN & PASSWORD PRIVAT)
             ========================================== -->
        <form @submit.prevent="handleFormSubmit" class="space-y-3.5">
          
          <!-- Input 1: Admin (Otomatis Terisi Sopianto Djahar) -->
          <div class="space-y-1">
            <label class="text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
              <UserCheck class="w-3.5 h-3.5 text-cyan-400" />
              <span>ADMIN</span>
            </label>

            <div class="relative">
              <input
                v-model="username"
                type="text"
                required
                autocomplete="username"
                placeholder="Sopianto Djahar"
                @input="playKeySound"
                :disabled="isAuthenticating || isUnlocked"
                class="w-full px-3 py-2 bg-dark-900 border border-cyan-500/30 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-cyan-400 focus:shadow-glow-cyan transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <!-- Input 2: Password Khusus Admin (Kosong secara default demi privacy) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <label class="text-slate-300 font-bold flex items-center gap-1.5">
                <KeyRound class="w-3.5 h-3.5 text-copper-400" />
                <span>PASSWORD KHUSUS ADMIN</span>
              </label>
              <button 
                type="button" 
                @click="showPassword = !showPassword" 
                class="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <Eye v-if="!showPassword" class="w-3 h-3" />
                <EyeOff v-else class="w-3 h-3" />
                <span>{{ showPassword ? 'Sembunyikan' : 'Lihat' }}</span>
              </button>
            </div>

            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="Masukkan password atau PIN admin..."
                @input="playKeySound"
                :disabled="isAuthenticating || isUnlocked"
                class="w-full px-3 py-2 bg-dark-900 border border-cyan-500/30 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-copper-400 focus:shadow-glow-copper transition-all disabled:opacity-50 pr-10"
              />
              <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <Lock class="w-4 h-4 text-slate-600" />
              </div>
            </div>

            <!-- Passkey Strength / Armed Indicator -->
            <div class="flex items-center gap-1 pt-0.5">
              <div class="flex-1 h-1 bg-dark-800 rounded-sm overflow-hidden">
                <div 
                  class="h-full transition-all duration-300"
                  :class="[
                    password.length === 0 ? 'w-0' :
                    password.length < 4 ? 'w-1/4 bg-rose-500' :
                    password.length < 8 ? 'w-2/4 bg-amber-500' :
                    'w-full bg-cyan-400'
                  ]"
                ></div>
              </div>
              <span class="text-[9px] text-slate-500">
                {{ password.length >= 8 ? 'ARMED' : password.length > 0 ? 'READY' : 'EMPTY' }}
              </span>
            </div>
          </div>

          <!-- Submit Button: ENTER -->
          <button
            type="submit"
            :disabled="isAuthenticating || isUnlocked"
            class="w-full relative group overflow-hidden py-2.5 px-4 bg-gradient-to-r from-cyan-400 via-brand-500 to-copper-500 text-dark-950 font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-glow-cyan hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <!-- Animated Loading Spinner or Lock Icon -->
            <RefreshCw v-if="isAuthenticating" class="w-3.5 h-3.5 animate-spin text-dark-950" />
            <Unlock v-else-if="authStatus === 'success'" class="w-3.5 h-3.5 text-dark-950" />
            <ShieldCheck v-else class="w-3.5 h-3.5 text-dark-950 group-hover:scale-110 transition-transform" />

            <span>{{ buttonText }}</span>
          </button>
        </form>

        <!-- Segmented Tech Divider & Reticles -->
        <div class="hud-divider my-3"></div>

        <!-- Footer Card Status -->
        <div class="flex items-center justify-between text-[9px] text-slate-500">
          <span>PORT: 443 // HTTPS</span>
          <span>SYSTEM: FATHERLAB ORBITAL</span>
          <span>SENTINEL: SECURED</span>
        </div>

      </div>
    </div>

    <!-- ==========================================
         BOTTOM TELEMETRY STATUS BAR (TANPA NAMA FOOTER)
         ========================================== -->
    <footer class="absolute bottom-0 left-0 right-0 h-8 border-t border-cyan-500/20 bg-[#060a14]/90 px-6 flex items-center justify-between text-[10px] text-slate-500 z-20">
      <div class="flex items-center gap-3">
        <span class="text-cyan-400 font-bold">STATUS:</span>
        <span class="text-slate-300">ONLINE</span>
        <span class="text-slate-600">&bull;</span>
        <span>LATENCY: {{ pingLatency }}ms</span>
        <span class="text-slate-600">&bull;</span>
        <span class="hidden sm:inline">DATA PROTECTION: ZERO OVERWRITE SENTINEL</span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-copper-400 font-bold">&copy; 2026 MetaSync</span>
        <span class="hidden sm:inline text-slate-400">by FatherLab</span>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  ShieldCheck, 
  KeyRound, 
  UserCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Clock, 
  Volume2, 
  VolumeX, 
  RefreshCw
} from 'lucide-vue-next';
import { useAuth } from '../composables/useAuth';
import { cyberAudio } from '../utils/cyberAudio';

const emit = defineEmits(['login-success']);

const { login, pinLogin } = useAuth();

// Form State: Username terisi 'Sopianto Djahar', Password dikosongkan demi privacy
const username = ref('Sopianto Djahar');
const password = ref('');
const showPassword = ref(false);

// UI Animation States
const isAuthenticating = ref(false);
const isUnlocked = ref(false);
const isShaking = ref(false);
const authStatus = ref('idle'); // idle | authenticating | success | error
const statusMessage = ref('[ STATUS: AWAITING CREDENTIALS ]');
const failedAttempts = ref(0);
const pingLatency = ref(12);
const isMuted = ref(cyberAudio.isMuted);

// Live WIB Clock
const currentTime = ref('');
let clockTimer = null;
let pingTimer = null;

const updateClock = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds} WIB`;
};

// Computed Button Text: ENTER
const buttonText = computed(() => {
  if (isUnlocked.value) return 'AKSES TERVERIFIKASI...';
  if (isAuthenticating.value) return 'MEMVERIFIKASI...';
  if (authStatus.value === 'success') return 'WELCOME // MASUK';
  return 'ENTER';
});

// Sound Helpers
const playKeySound = () => {
  cyberAudio.playKeyTick();
};

const toggleAudio = () => {
  isMuted.value = cyberAudio.toggleMute();
};

// Submit Handler (Form Submit dengan Password 'HgatKYu6%#k' atau custom)
const handleFormSubmit = async () => {
  if (isAuthenticating.value || isUnlocked.value) return;

  cyberAudio.playClick();
  isAuthenticating.value = true;
  authStatus.value = 'authenticating';
  statusMessage.value = '[ INITIALIZING HANDSHAKE... VERIFIKASI KREDENSIAL ]';

  // Realistic Sci-Fi Delay (450ms)
  await new Promise(r => setTimeout(r, 450));

  const result = await login(username.value, password.value);

  if (result.success) {
    authStatus.value = 'success';
    statusMessage.value = `[ ACCESS GRANTED // WELCOME ${result.user?.name || 'ADMIN'} ]`;
    cyberAudio.playAccessGranted();

    // Transition smoothly
    await new Promise(r => setTimeout(r, 550));
    isUnlocked.value = true;

    setTimeout(() => {
      emit('login-success', result.user);
    }, 450);
  } else {
    isAuthenticating.value = false;
    authStatus.value = 'error';
    statusMessage.value = `[ ACCESS DENIED: ${result.message} ]`;
    failedAttempts.value += 1;
    cyberAudio.playAccessDenied();

    // Trigger error shake animation
    isShaking.value = true;
    setTimeout(() => {
      isShaking.value = false;
    }, 600);
  }
};

// Cara Lain Login Cepat dengan PIN 000000
const handlePinAccess = async () => {
  if (isAuthenticating.value || isUnlocked.value) return;

  cyberAudio.playClick();
  isAuthenticating.value = true;
  authStatus.value = 'authenticating';
  statusMessage.value = '[ LOGIN PIN OTOMATIS (000000)... ]';

  await new Promise(r => setTimeout(r, 400));
  const result = await pinLogin();

  if (result.success) {
    authStatus.value = 'success';
    statusMessage.value = '[ PIN MATCHED // ACCESS GRANTED ]';
    cyberAudio.playAccessGranted();

    await new Promise(r => setTimeout(r, 450));
    isUnlocked.value = true;

    setTimeout(() => {
      emit('login-success', result.user);
    }, 450);
  } else {
    isAuthenticating.value = false;
    authStatus.value = 'error';
    statusMessage.value = '[ VERIFIKASI PIN GAGAL ]';
    cyberAudio.playAccessDenied();
  }
};

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);

  // Ping jitter simulation
  pingTimer = setInterval(() => {
    pingLatency.value = Math.floor(10 + Math.random() * 5);
  }, 4000);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  if (pingTimer) clearInterval(pingTimer);
});
</script>
