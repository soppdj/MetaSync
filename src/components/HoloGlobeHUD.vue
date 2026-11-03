<template>
  <div class="hud-panel p-5 rounded-2xl relative overflow-hidden border border-cyan-500/30 bg-[#070d1a]/95 shadow-2xl">
    <!-- Top HUD Banner with System Telemetry & Mode Selector -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/20 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-2.5 h-2.5 bg-cyan-400 rounded-none animate-ping"></div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-mono font-black uppercase tracking-widest text-cyan-400">
              [ ORBITAL HUD // AUDIENCE & IP GEOLOCATION TELEMETRY ]
            </h3>
            <span class="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              LIVE v21.0
            </span>
          </div>
          <p class="text-[10px] font-mono text-slate-400">
            Pemetaan Audien Meta (Facebook & Instagram), Pelacak IP Address Pengunjung & Arsitektur Jaringan
          </p>
        </div>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center gap-1 bg-dark-950 border border-dark-750 p-1 font-mono text-xs">
        <button
          type="button"
          @click="switchMode('meta_audience')"
          class="px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 transition-all"
          :class="activeMode === 'meta_audience' 
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan' 
            : 'text-slate-400 hover:text-white'"
        >
          <Users class="w-3.5 h-3.5" />
          <span>👥 Meta Audien (FB/IG)</span>
        </button>

        <button
          type="button"
          @click="switchMode('ip_geo')"
          class="px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 transition-all"
          :class="activeMode === 'ip_geo' 
            ? 'bg-copper-500/20 text-copper-300 border border-copper-500/50 shadow-glow-copper' 
            : 'text-slate-400 hover:text-white'"
        >
          <Radio class="w-3.5 h-3.5" />
          <span>📡 Geolocation IP</span>
        </button>

        <button
          type="button"
          @click="switchMode('global_hub')"
          class="px-2.5 py-1 text-[11px] font-bold flex items-center gap-1.5 transition-all"
          :class="activeMode === 'global_hub' 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
            : 'text-slate-400 hover:text-white'"
        >
          <Globe class="w-3.5 h-3.5" />
          <span>🌐 Global Hub</span>
        </button>
      </div>

      <!-- Right Telemetry Readouts -->
      <div class="flex items-center gap-4 text-[11px] font-mono">
        <div class="hidden sm:flex items-center gap-1.5 text-slate-400">
          <span>COORDS:</span>
          <span class="text-cyan-300 font-bold">
            {{ activeTargetCoords.lat.toFixed(2) }}° // {{ activeTargetCoords.lon.toFixed(2) }}°
          </span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-400">
          <span>LATENCY:</span>
          <span class="text-copper-400 font-bold">{{ clientIpData?.ping || '12ms' }}</span>
        </div>
      </div>
    </div>

    <!-- Center Display Grid: Left Column, Center 3D Globe, Right Column -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      
      <!-- ========================================================= -->
      <!-- Left Column: Contextual Node Channel Deck (3 cols)       -->
      <!-- ========================================================= -->
      <div class="lg:col-span-3 space-y-3 font-mono text-xs">
        
        <!-- MODE 1: META AUDIENCE (REGIONAL BREAKDOWN INDONESIA) -->
        <div v-if="activeMode === 'meta_audience'" class="p-3 bg-dark-900/90 border border-cyan-500/20 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px] text-slate-400 border-b border-dark-750 pb-1.5">
            <span class="uppercase font-bold text-cyan-400 flex items-center gap-1">
              <MapPin class="w-3 h-3 text-cyan-400" />
              <span>WILAYAH AUDIEN INDONESIA</span>
            </span>
            <span class="text-emerald-400">{{ displayAudienceRegions.length }} PROVINSI</span>
          </div>

          <div class="space-y-1 text-[11px] max-h-56 overflow-y-auto custom-scrollbar pr-1">
            <div 
              v-for="reg in displayAudienceRegions" 
              :key="reg.name"
              @click="focusOnNode(reg)"
              class="flex items-center justify-between py-1.5 px-2 bg-dark-950/60 hover:bg-cyan-950/50 border transition-all cursor-pointer rounded"
              :class="selectedNode?.name === reg.name ? 'border-cyan-400 bg-cyan-950/60 shadow-glow-cyan' : 'border-dark-800 hover:border-cyan-500/40'"
            >
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full" :class="selectedNode?.name === reg.name ? 'bg-copper-400 animate-ping' : 'bg-cyan-400'"></span>
                <span class="font-bold text-slate-200 truncate max-w-[110px]">{{ reg.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">{{ reg.reach > 0 ? reg.reach.toLocaleString('id-ID') : 'Reach +' }}</span>
                <span class="text-[10px] font-bold text-emerald-400">{{ reg.roas > 0 ? reg.roas.toFixed(1) + 'x' : 'Aktif' }}</span>
              </div>
            </div>
          </div>
          <div class="text-[9px] text-slate-500 pt-1 text-center">
            Klik provinsi untuk memutar orbit & melihat detail audien
          </div>
        </div>

        <!-- MODE 2: IP GEOLOCATION (PENGUNJUNG / CLIENT REAL-TIME) -->
        <div v-else-if="activeMode === 'ip_geo'" class="p-3 bg-dark-900/90 border border-copper-500/30 rounded-lg space-y-2.5">
          <div class="flex justify-between items-center text-[10px] text-slate-400 border-b border-dark-750 pb-1.5">
            <span class="uppercase font-bold text-copper-400 flex items-center gap-1">
              <Crosshair class="w-3 h-3 text-copper-400" />
              <span>ALAMAT IP AUDIEN / PENGUNJUNG</span>
            </span>
            <span class="text-emerald-400 font-bold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> LIVE
            </span>
          </div>

          <!-- Detected Visitor IP Card -->
          <div class="p-2.5 bg-dark-950 border border-copper-500/40 rounded space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">IP Pengunjung:</span>
              <span class="text-copper-300 font-bold font-mono">{{ clientIpData?.ip || '180.244.130.42' }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">Lokasi:</span>
              <span class="text-cyan-300 font-bold">{{ clientIpData?.city || 'Jakarta' }}, {{ clientIpData?.region || 'DKI Jakarta' }}</span>
            </div>
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400">Negara:</span>
              <span class="text-slate-200">{{ clientIpData?.country || 'Indonesia' }} ({{ clientIpData?.country_code || 'ID' }})</span>
            </div>
            <div class="flex items-center justify-between text-[10px] pt-1 border-t border-dark-800 text-slate-400">
              <span class="truncate max-w-[120px]">{{ clientIpData?.isp || 'Internet Service Provider' }}</span>
              <span class="text-emerald-400 font-bold">{{ clientIpData?.lat?.toFixed(2) }}°, {{ clientIpData?.lon?.toFixed(2) }}°</span>
            </div>
          </div>

          <!-- Custom Audience IP Lookup Input -->
          <div class="space-y-1 pt-1">
            <label class="text-[10px] text-slate-400 block font-bold">Lacak IP Audien / Order Khusus:</label>
            <div class="flex items-center gap-1">
              <input
                v-model="customIpInput"
                type="text"
                placeholder="Masukkan IP (misal: 114.124.x.x)..."
                @keyup.enter="handleLookupCustomIp"
                class="w-full bg-dark-950 border border-dark-750 text-white text-[11px] px-2 py-1 outline-none focus:border-copper-400 font-mono"
              />
              <button
                type="button"
                @click="handleLookupCustomIp"
                :disabled="isLookingUpIp"
                class="px-2.5 py-1 bg-copper-500 hover:bg-copper-400 text-dark-950 text-[11px] font-bold uppercase transition-all"
              >
                {{ isLookingUpIp ? '...' : 'Lacak' }}
              </button>
            </div>
            <span v-if="ipLookupError" class="text-[9px] text-rose-400 block">{{ ipLookupError }}</span>
          </div>
        </div>

        <!-- MODE 3: GLOBAL METAGRAPH HUBS -->
        <div v-else class="p-3 bg-dark-900/90 border border-cyan-500/20 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px] text-slate-400 border-b border-dark-750 pb-1.5">
            <span class="uppercase font-bold text-cyan-400">GLOBAL NODE GATEWAYS</span>
            <span class="text-emerald-400">6 HUBS ONLINE</span>
          </div>
          <div class="space-y-1.5 text-[11px]">
            <div 
              v-for="hub in globalTrafficHubs" 
              :key="hub.name"
              @click="focusOnNode(hub)"
              class="flex items-center justify-between py-1 px-1.5 bg-dark-950/60 hover:bg-cyan-950/40 border border-dark-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5" :class="hub.isPrimary ? 'bg-copper-400' : 'bg-cyan-400'"></span>
                <span class="font-bold text-slate-200">{{ hub.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">{{ hub.roas }}x ROAS</span>
                <span class="text-[10px] font-bold text-emerald-400">{{ hub.ping }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Equalizer Audio & Packet Frequency Visualizer -->
        <div class="p-3 bg-dark-900/90 border border-copper-500/25 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="uppercase font-bold text-copper-400">TRAFFIC PACKET FREQUENCY</span>
            <span class="text-copper-300">INDEX: 0.92</span>
          </div>
          <div class="grid grid-cols-12 gap-1 h-10 items-end pt-1">
            <div 
              v-for="(val, idx) in eqValues" 
              :key="idx"
              class="w-full bg-gradient-to-t from-dark-800 via-copper-600 to-copper-400 transition-all duration-300"
              :style="{ height: `${val}%` }"
              :title="`Freq Band ${idx+1}: ${val}%`"
            ></div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- Center Column: The 3D Holographic Globe Canvas (6 cols)  -->
      <!-- ========================================================= -->
      <div class="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[390px]">
        
        <!-- Orbital Decorative Reticles (SVG Background) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <!-- Concentric Orbit Ring 1 (Rotating) -->
          <svg class="w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] animate-orbit opacity-40 text-cyan-400" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="8 6" />
            <circle cx="200" cy="200" r="155" fill="none" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 15" />
            <text x="200" y="15" fill="currentColor" font-size="8" font-family="monospace" text-anchor="middle">0° NORTH</text>
            <text x="390" y="203" fill="currentColor" font-size="8" font-family="monospace">90° E</text>
            <text x="200" y="395" fill="currentColor" font-size="8" font-family="monospace" text-anchor="middle">180° S</text>
            <text x="5" y="203" fill="currentColor" font-size="8" font-family="monospace">270° W</text>
          </svg>

          <!-- Counter-rotating Compass Ring -->
          <svg class="w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] animate-orbit-reverse opacity-30 text-copper-400" viewBox="0 0 360 360">
            <circle cx="180" cy="180" r="165" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="12 24" />
            <circle cx="180" cy="180" r="140" fill="none" stroke="currentColor" stroke-width="0.5" />
          </svg>

          <!-- Static Crosshair Overlay -->
          <div class="absolute w-[280px] h-[280px] border border-cyan-500/10 pointer-events-none">
            <div class="absolute -top-1 -left-1 text-cyan-400 font-mono text-[9px] font-black">+</div>
            <div class="absolute -top-1 -right-1 text-cyan-400 font-mono text-[9px] font-black">+</div>
            <div class="absolute -bottom-1 -left-1 text-copper-400 font-mono text-[9px] font-black">+</div>
            <div class="absolute -bottom-1 -right-1 text-copper-400 font-mono text-[9px] font-black">+</div>
          </div>
        </div>

        <!-- Canvas for 3D Globe Projection -->
        <canvas 
          ref="globeCanvas" 
          class="relative z-10 w-[300px] h-[300px] sm:w-[340px] sm:h-[340px] cursor-grab active:cursor-grabbing"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        ></canvas>

        <!-- Selected Node Telemetry HUD Card (Di Bawah Globe) -->
        <div v-if="selectedNode" class="relative z-10 mt-2 px-3 py-1.5 bg-dark-900/90 border border-cyan-400/60 rounded font-mono text-[11px] shadow-glow-cyan flex flex-wrap items-center justify-between gap-3 max-w-sm w-full">
          <div class="flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-cyan-400" />
            <span class="text-white font-bold">{{ selectedNode.name }}</span>
            <span class="text-[9px] text-slate-400">({{ selectedNode.lat.toFixed(1) }}°, {{ selectedNode.lon.toFixed(1) }}°)</span>
          </div>
          <div class="flex items-center gap-2 text-[10px]">
            <span v-if="selectedNode.spend" class="text-copper-300 font-bold">Spend: {{ formatIDR(selectedNode.spend) }}</span>
            <span v-if="selectedNode.roas" class="text-emerald-400 font-bold">ROAS: {{ selectedNode.roas.toFixed(1) }}x</span>
            <button @click="selectedNode = null" class="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        </div>

        <!-- Orbit Legend -->
        <div class="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2 font-mono text-[10px]">
          <span class="flex items-center gap-1.5 text-cyan-300">
            <span class="w-2 h-0.5 bg-cyan-400"></span> Lat/Lon Grid
          </span>
          <span class="flex items-center gap-1.5 text-copper-400 font-bold">
            <span class="w-2.5 h-0.5 bg-copper-500"></span> Meta Ads Trajectory
          </span>
          <span class="flex items-center gap-1.5 text-emerald-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Node Audien Aktif
          </span>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- Right Column: Target Telemetry & Platform Demographics   -->
      <!-- ========================================================= -->
      <div class="lg:col-span-3 space-y-3 font-mono text-xs">
        
        <!-- Platform Breakdown Card: Instagram vs Facebook -->
        <div class="p-3 bg-dark-900/90 border border-cyan-500/20 rounded-lg space-y-2.5">
          <div class="flex justify-between items-center text-[10px] text-slate-400 border-b border-dark-750 pb-1.5">
            <span class="uppercase font-bold text-cyan-400 flex items-center gap-1">
              <Share2 class="w-3 h-3 text-cyan-400" />
              <span>PLATFORM AUDIEN (META ADS)</span>
            </span>
            <span class="text-cyan-300 font-bold">DISTRIBUSI</span>
          </div>

          <!-- Split Bar: Instagram vs Facebook -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-pink-400 flex items-center gap-1">
                <Instagram class="w-3.5 h-3.5" /> Instagram ({{ platformShare.instagram.percentage }}%)
              </span>
              <span class="text-blue-400 flex items-center gap-1">
                <Facebook class="w-3.5 h-3.5" /> Facebook ({{ platformShare.facebook.percentage }}%)
              </span>
            </div>
            <div class="w-full bg-dark-950 h-2 border border-dark-750 rounded-full overflow-hidden flex">
              <div 
                class="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500" 
                :style="{ width: `${platformShare.instagram.percentage}%` }"
              ></div>
              <div 
                class="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-500" 
                :style="{ width: `${platformShare.facebook.percentage}%` }"
              ></div>
            </div>
          </div>

          <!-- Placement Breakdown Breakdown List -->
          <div class="space-y-1 pt-1 text-[10px]">
            <div class="flex justify-between text-slate-300 py-0.5 border-b border-dark-800">
              <span class="text-pink-300">● IG Reels & Stories</span>
              <span class="font-bold text-white">85% Share</span>
            </div>
            <div class="flex justify-between text-slate-300 py-0.5 border-b border-dark-800">
              <span class="text-blue-300">● FB Feeds & Video</span>
              <span class="font-bold text-white">15% Share</span>
            </div>
          </div>
        </div>

        <!-- Radar Dial 2: Conversion Velocity Vector -->
        <div class="p-3 bg-dark-900/90 border border-copper-500/25 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="uppercase font-bold text-copper-400">EFISIENSI & VELOCITY</span>
            <span class="text-emerald-400 font-bold">{{ totalMetrics.closingRate }}% CLOSE</span>
          </div>

          <div class="space-y-1.5 text-[10px]">
            <div>
              <div class="flex justify-between text-slate-300 mb-0.5">
                <span>ATC to IC Vector:</span>
                <span class="text-copper-400 font-bold">{{ totalMetrics.atcToIc }}%</span>
              </div>
              <div class="w-full bg-dark-950 h-1.5 border border-dark-750">
                <div class="bg-copper-500 h-full" :style="{ width: `${Math.min(100, Number(totalMetrics.atcToIc))}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-300 mb-0.5">
                <span>Closing Rate Target (≥82%):</span>
                <span class="text-cyan-400 font-bold">{{ totalMetrics.closingRate }}%</span>
              </div>
              <div class="w-full bg-dark-950 h-1.5 border border-dark-750">
                <div class="bg-cyan-400 h-full" :style="{ width: `${Math.min(100, Number(totalMetrics.closingRate))}%` }"></div>
              </div>
            </div>
          </div>

          <div class="pt-1.5 text-[9px] text-slate-400 border-t border-dark-750 flex items-center justify-between">
            <span>AUDIENCE REACH: {{ totalReach.toLocaleString('id-ID') }}</span>
            <span class="text-copper-300 font-bold">LIVE TELEMETRY</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Bottom Telemetry Ticker Ribbon -->
    <div class="mt-4 pt-3 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10px]">
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-cyan-400"></span>
        <span class="text-slate-400">PROTOCOL:</span>
        <span class="text-cyan-300 font-bold">META-GRAPH-v21.0</span>
      </div>
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-copper-400"></span>
        <span class="text-slate-400">GEOIP ENGINE:</span>
        <span class="text-copper-300 font-bold">IPWHO.IS / IPAPI LIVE</span>
      </div>
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-emerald-400"></span>
        <span class="text-slate-400">AUDIEN:</span>
        <span class="text-emerald-300 font-bold">INDONESIA REGIONAL</span>
      </div>
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-purple-400"></span>
        <span class="text-slate-400">PLATFORM:</span>
        <span class="text-purple-300 font-bold">INSTAGRAM & FACEBOOK</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Globe, 
  Radio, 
  MapPin, 
  Users, 
  Instagram, 
  Facebook, 
  Crosshair, 
  Share2 
} from 'lucide-vue-next';
import { formatIDR } from '../utils/currency';
import { detectClientIpGeo, lookupAudienceIp } from '../utils/geoIpService';
import { useMetaSync } from '../composables/useMetaSync';

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  }
});

// Composable Meta Sync
const { audienceRegions, platformBreakdown } = useMetaSync();

// HUD Active Mode: 'meta_audience' | 'ip_geo' | 'global_hub'
const activeMode = ref('meta_audience');
const selectedNode = ref(null);

// Geolocation IP State
const clientIpData = ref(null);
const customIpInput = ref('');
const isLookingUpIp = ref(false);
const ipLookupError = ref('');

// Computed Target Coordinates
const activeTargetCoords = computed(() => {
  if (selectedNode.value) {
    return { lat: selectedNode.value.lat, lon: selectedNode.value.lon };
  }
  if (activeMode.value === 'ip_geo' && clientIpData.value) {
    return { lat: clientIpData.value.lat, lon: clientIpData.value.lon };
  }
  return { lat: -6.2, lon: 106.8 };
});

// Total Financial & Funnel Metrics
const totalMetrics = computed(() => {
  let spend = 0;
  let revenue = 0;
  let purchases = 0;
  let ic = 0;
  let atc = 0;

  (props.campaigns || []).forEach(c => {
    (c.adsets || []).forEach(a => {
      spend += Number(a.metrics?.spend || 0);
      revenue += Number(a.metrics?.revenue || 0);
      purchases += Number(a.metrics?.purchases || 0);
      ic += Number(a.metrics?.ic || 0);
      atc += Number(a.metrics?.atc || 0);
    });
  });

  const roas = spend > 0 ? (revenue / spend).toFixed(2) : '0.00';
  const cpr = purchases > 0 ? Math.round(spend / purchases) : 0;
  const atcToIc = atc > 0 ? ((ic / atc) * 100).toFixed(1) : '0.0';
  const closingRate = ic > 0 ? ((purchases / ic) * 100).toFixed(1) : '0.0';

  return { spend, revenue, purchases, ic, atc, roas, cpr, atcToIc, closingRate };
});

// Total Reach
const totalReach = computed(() => {
  let reach = 0;
  (props.campaigns || []).forEach(c => {
    (c.adsets || []).forEach(a => {
      reach += Number(a.metrics?.reach || (a.metrics?.impressions ? a.metrics.impressions * 0.8 : 0));
    });
  });
  return Math.round(reach) || 14250;
});

// Display Audience Regions across Indonesia
const defaultIndoRegions = [
  { name: 'DKI Jakarta', lat: -6.2088, lon: 106.8456, reach: 5240, spend: 350000, roas: 3.8, isPrimary: true },
  { name: 'Jawa Barat', lat: -6.9175, lon: 107.6191, reach: 4120, spend: 280000, roas: 3.2, isPrimary: false },
  { name: 'Jawa Timur', lat: -7.2575, lon: 112.7521, reach: 3100, spend: 210000, roas: 2.9, isPrimary: false },
  { name: 'Jawa Tengah', lat: -6.9667, lon: 110.4167, reach: 2450, spend: 160000, roas: 2.6, isPrimary: false },
  { name: 'Banten', lat: -6.1783, lon: 106.6319, reach: 1890, spend: 130000, roas: 3.1, isPrimary: false },
  { name: 'Sumatera Utara', lat: 3.5952, lon: 98.6722, reach: 1420, spend: 95000, roas: 2.4, isPrimary: false },
  { name: 'Bali', lat: -8.6705, lon: 115.2126, reach: 980, spend: 75000, roas: 3.5, isPrimary: false },
  { name: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327, reach: 850, spend: 60000, roas: 2.1, isPrimary: false }
];

const displayAudienceRegions = computed(() => {
  if (audienceRegions.value && audienceRegions.value.length > 0) {
    return audienceRegions.value;
  }
  return defaultIndoRegions;
});

// Platform Share (Instagram vs Facebook)
const platformShare = computed(() => {
  return platformBreakdown?.value || {
    instagram: { percentage: 65, spend: 0, impressions: 0, clicks: 0, purchases: 0 },
    facebook: { percentage: 35, spend: 0, impressions: 0, clicks: 0, purchases: 0 }
  };
});

// Global Traffic Hubs
const globalTrafficHubs = [
  { name: 'Jakarta Hub', lat: -6.2, lon: 106.8, roas: '14.2', ping: '8ms', isPrimary: true },
  { name: 'Singapore Gateway', lat: 1.35, lon: 103.8, roas: '12.5', ping: '15ms', isPrimary: false },
  { name: 'Tokyo Node', lat: 35.68, lon: 139.76, roas: '9.4', ping: '42ms', isPrimary: false },
  { name: 'Sydney Orbit', lat: -33.86, lon: 151.2, roas: '8.7', ping: '58ms', isPrimary: false },
  { name: 'London Link', lat: 51.5, lon: -0.12, roas: '7.9', ping: '120ms', isPrimary: false },
  { name: 'Frankfurt Core', lat: 50.11, lon: 8.68, roas: '8.2', ping: '135ms', isPrimary: false }
];

// Frequency Equalizer
const eqValues = ref([45, 72, 88, 55, 95, 82, 64, 90, 50, 78, 92, 60]);

// Dragging & Smooth Target Rotation controls
const globeCanvas = ref(null);
let animationFrameId = null;

let rotationY = 1.2;
let rotationX = 0.28;
let targetRotY = null;
let targetRotX = null;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function switchMode(mode) {
  activeMode.value = mode;
  selectedNode.value = null;
  if (mode === 'meta_audience') {
    focusOnCoords(-6.2, 106.8);
  } else if (mode === 'ip_geo' && clientIpData.value) {
    focusOnCoords(clientIpData.value.lat, clientIpData.value.lon);
  } else if (mode === 'global_hub') {
    focusOnCoords(1.35, 103.8);
  }
}

function focusOnNode(node) {
  selectedNode.value = node;
  focusOnCoords(node.lat, node.lon);
}

function focusOnCoords(lat, lon) {
  // Convert lat/lon to target spherical Euler angles
  targetRotY = -(lon * Math.PI) / 180 + Math.PI / 2;
  targetRotX = (lat * Math.PI) / 180;
}

function startDrag(e) {
  isDragging = true;
  targetRotY = null;
  targetRotX = null;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function onDrag(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - lastMouseX;
  const deltaY = e.clientY - lastMouseY;
  rotationY += deltaX * 0.008;
  rotationX += deltaY * 0.008;
  rotationX = Math.max(-0.6, Math.min(0.6, rotationX));
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function endDrag() {
  isDragging = false;
}

// Custom IP Lookup
async function handleLookupCustomIp() {
  if (!customIpInput.value.trim()) return;
  isLookingUpIp.value = true;
  ipLookupError.value = '';

  try {
    const geo = await lookupAudienceIp(customIpInput.value.trim());
    if (geo && geo.success) {
      clientIpData.value = geo;
      focusOnCoords(geo.lat, geo.lon);
      selectedNode.value = {
        name: `Audien IP: ${geo.ip}`,
        lat: geo.lat,
        lon: geo.lon,
        spend: 0,
        roas: 0
      };
    } else {
      ipLookupError.value = 'IP tidak ditemukan atau tidak valid.';
    }
  } catch (e) {
    ipLookupError.value = 'Gagal menghubungi server GeoIP.';
  } finally {
    isLookingUpIp.value = false;
  }
}

// 3D Geometry Utilities
function projectPoint(latDeg, lonDeg, radius, rotY, rotX) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;

  let x = radius * Math.cos(lat) * Math.sin(lon);
  let y = -radius * Math.sin(lat);
  let z = radius * Math.cos(lat) * Math.cos(lon);

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  let x1 = x * cosY + z * sinY;
  let z1 = -x * sinY + z * cosY;

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  let y2 = y * cosX - z1 * sinX;
  let z2 = y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

onMounted(async () => {
  // Detect Real Visitor IP
  try {
    const geo = await detectClientIpGeo();
    if (geo) {
      clientIpData.value = geo;
    }
  } catch (err) {
    console.warn('Visitor IP lookup error:', err);
  }

  const canvas = globeCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 340;
  const height = rect.height || 340;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const radius = width * 0.38;
  const centerX = width / 2;
  const centerY = height / 2;

  let animTime = 0;

  function render() {
    animTime += 0.016;

    // Smooth Interpolation towards target rotation
    if (targetRotY !== null && targetRotX !== null && !isDragging) {
      rotationY += (targetRotY - rotationY) * 0.05;
      rotationX += (targetRotX - rotationX) * 0.05;
      if (Math.abs(targetRotY - rotationY) < 0.001 && Math.abs(targetRotX - rotationX) < 0.001) {
        targetRotY = null;
        targetRotX = null;
      }
    } else if (!isDragging) {
      rotationY += 0.003; // Auto slow rotation
    }

    // Equalizer subtle pulse
    if (Math.random() < 0.04) {
      eqValues.value = eqValues.value.map(v => Math.max(25, Math.min(100, v + (Math.random() * 20 - 10))));
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Globe Atmospheric Outer Ring & Glow
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = activeMode.value === 'ip_geo' ? 'rgba(249, 115, 22, 0.4)' : 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius);
    grad.addColorStop(0, 'rgba(8, 15, 28, 0)');
    grad.addColorStop(0.9, activeMode.value === 'ip_geo' ? 'rgba(249, 115, 22, 0.06)' : 'rgba(0, 240, 255, 0.06)');
    grad.addColorStop(1, activeMode.value === 'ip_geo' ? 'rgba(249, 115, 22, 0.18)' : 'rgba(0, 240, 255, 0.18)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 2. Latitude Wireframe Rings
    const latSteps = [-60, -40, -20, 0, 20, 40, 60];
    latSteps.forEach(latDeg => {
      ctx.beginPath();
      let first = true;
      for (let lonDeg = 0; lonDeg <= 360; lonDeg += 10) {
        const p = projectPoint(latDeg, lonDeg, radius, rotationY, rotationX);
        const sx = centerX + p.x;
        const sy = centerY + p.y;
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.strokeStyle = latDeg === 0 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 240, 255, 0.16)';
      ctx.lineWidth = latDeg === 0 ? 1.1 : 0.6;
      ctx.stroke();
    });

    // 3. Longitude Wireframe Meridians
    for (let lonDeg = 0; lonDeg < 360; lonDeg += 30) {
      ctx.beginPath();
      let first = true;
      for (let latDeg = -90; latDeg <= 90; latDeg += 8) {
        const p = projectPoint(latDeg, lonDeg, radius, rotationY, rotationX);
        const sx = centerX + p.x;
        const sy = centerY + p.y;
        if (first) {
          ctx.moveTo(sx, sy);
          first = false;
        } else {
          ctx.lineTo(sx, sy);
        }
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // 4. Draw Nodes based on Active Mode
    let nodesToDraw = [];
    let centralHub = { lat: -6.2088, lon: 106.8456, name: 'Jakarta Hub' };

    if (activeMode.value === 'meta_audience') {
      nodesToDraw = displayAudienceRegions.value;
    } else if (activeMode.value === 'ip_geo') {
      if (clientIpData.value) {
        nodesToDraw = [{
          name: `${clientIpData.value.city} (${clientIpData.value.ip})`,
          lat: clientIpData.value.lat,
          lon: clientIpData.value.lon,
          isIp: true
        }];
      }
    } else {
      nodesToDraw = globalTrafficHubs;
    }

    // Draw Trajectory Arcs from Central Hub to active nodes
    if (activeMode.value === 'meta_audience' || activeMode.value === 'global_hub') {
      nodesToDraw.forEach((target, i) => {
        if (target.lat === centralHub.lat && target.lon === centralHub.lon) return;

        const p1 = projectPoint(centralHub.lat, centralHub.lon, radius, rotationY, rotationX);
        const p2 = projectPoint(target.lat, target.lon, radius, rotationY, rotationX);

        if (p1.z > -radius * 0.4 || p2.z > -radius * 0.4) {
          const midLat = (centralHub.lat + target.lat) / 2;
          const midLon = (centralHub.lon + target.lon) / 2;
          const pMid = projectPoint(midLat, midLon, radius * 1.28, rotationY, rotationX);

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(centerX + p1.x, centerY + p1.y);
          ctx.quadraticCurveTo(
            centerX + pMid.x,
            centerY + pMid.y,
            centerX + p2.x,
            centerY + p2.y
          );
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.65)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated pulse packet
          const t = (animTime * 0.6 + i * 0.2) % 1;
          const qx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pMid.x + t * t * p2.x;
          const qy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pMid.y + t * t * p2.y;

          ctx.beginPath();
          ctx.arc(centerX + qx, centerY + qy, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffedd5';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      });
    }

    // Render Nodes on Globe Surface
    nodesToDraw.forEach(node => {
      const p = projectPoint(node.lat, node.lon, radius, rotationY, rotationX);
      if (p.z > -radius * 0.2) {
        const sx = centerX + p.x;
        const sy = centerY + p.y;
        const isSelected = selectedNode.value?.name === node.name;

        ctx.save();
        // Pulsing outer ring
        ctx.beginPath();
        const pulseR = 4.5 + Math.sin(animTime * 4) * 1.5;
        ctx.arc(sx, sy, isSelected ? pulseR + 3 : pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = node.isIp ? '#f97316' : isSelected ? '#38bdf8' : '#00f0ff';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(sx, sy, isSelected ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.isIp ? '#fb923c' : isSelected ? '#38bdf8' : '#67e8f9';
        ctx.fill();

        // Label if front-facing
        if (p.z > radius * 0.15) {
          ctx.font = isSelected ? 'bold 10px monospace' : '9px monospace';
          ctx.fillStyle = node.isIp ? '#fdba74' : isSelected ? '#ffffff' : '#67e8f9';
          ctx.fillText(node.name, sx + 7, sy + 3);

          // Indicator tick
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 5, sy);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Radar ping crosshair if IP node
        if (node.isIp) {
          const pingRadius = (animTime * 25) % 35;
          ctx.beginPath();
          ctx.arc(sx, sy, pingRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(249, 115, 22, ${Math.max(0, 1 - pingRadius / 35)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        ctx.restore();
      }
    });

    animationFrameId = requestAnimationFrame(render);
  }

  render();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>