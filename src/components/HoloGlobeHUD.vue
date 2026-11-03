<template>
  <div class="hud-panel p-5 rounded-2xl relative overflow-hidden">
    <!-- Top HUD Banner with System Telemetry -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/20 mb-4">
      <div class="flex items-center gap-2.5">
        <div class="w-2.5 h-2.5 bg-cyan-400 rounded-none animate-ping"></div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-mono font-black uppercase tracking-widest text-cyan-400">
              [ ORBITAL HUD // GLOBAL METAGRAPH TELEMETRY ]
            </h3>
            <span class="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              LIVE 60FPS
            </span>
          </div>
          <p class="text-[10px] font-mono text-slate-400">
            Real-time Meta Graph v20.0 Traffic Nodes & Global Direct-Response Ad Trajectories
          </p>
        </div>
      </div>

      <!-- Right Telemetry Readouts -->
      <div class="flex items-center gap-4 text-[11px] font-mono">
        <div class="hidden sm:flex items-center gap-1.5 text-slate-400">
          <span>LAT/LON:</span>
          <span class="text-cyan-300 font-bold">-06°12'S // 106°50'E</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-400">
          <span>FREQ:</span>
          <span class="text-copper-400 font-bold">142.85 MHZ</span>
        </div>
        <div class="flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
          <span>SYNC: 99.98%</span>
        </div>
      </div>
    </div>

    <!-- Center Display Grid: Left World Telemetry Deck, Center Hologram 3D Globe, Right Target Vectors -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
      
      <!-- Left Column: Node Channels & Equalizer Levels (3 cols) -->
      <div class="lg:col-span-3 space-y-3 font-mono text-xs">
        <div class="p-3 bg-dark-900/90 border border-cyan-500/20 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px] text-slate-400 border-b border-dark-750 pb-1">
            <span class="uppercase font-bold text-cyan-400">ACTIVE TRAFFIC HUBS</span>
            <span class="text-emerald-400">8 NODES ONLINE</span>
          </div>
          <div class="space-y-1.5 text-[11px]">
            <div 
              v-for="hub in trafficHubs" 
              :key="hub.name"
              class="flex items-center justify-between py-1 px-1.5 bg-dark-950/60 hover:bg-cyan-950/40 border border-dark-800 hover:border-cyan-500/40 transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5" :class="hub.isPrimary ? 'bg-copper-400' : 'bg-cyan-400'"></span>
                <span class="font-bold text-slate-200">{{ hub.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400">{{ hub.roas }}x ROAS</span>
                <span class="text-[10px] font-bold" :class="hub.statusColor">{{ hub.ping }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Frequency Equalizer Mini-Module -->
        <div class="p-3 bg-dark-900/90 border border-copper-500/25 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="uppercase font-bold text-copper-400">AD TRAFFIC FREQUENCY</span>
            <span class="text-copper-300">INDEX: 0.84</span>
          </div>
          <div class="grid grid-cols-12 gap-1 h-12 items-end pt-1">
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

      <!-- Center Column: The 3D Holographic Globe Canvas (6 cols) -->
      <div class="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[380px]">
        <!-- Orbital Decorative Reticles (SVG Background) -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <!-- Concentric Orbit Ring 1 (Rotating) -->
          <svg class="w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] animate-orbit opacity-40 text-cyan-400" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="8 6" />
            <circle cx="200" cy="200" r="155" fill="none" stroke="currentColor" stroke-width="0.7" stroke-dasharray="3 15" />
            <!-- Angle Marks -->
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

        <!-- Bottom Orbit Legend -->
        <div class="relative z-10 flex items-center gap-4 mt-2 font-mono text-[10px]">
          <span class="flex items-center gap-1.5 text-cyan-300">
            <span class="w-2 h-0.5 bg-cyan-400"></span> Lat/Lon Grid
          </span>
          <span class="flex items-center gap-1.5 text-copper-400 font-bold">
            <span class="w-2.5 h-0.5 bg-copper-500"></span> Meta Ads Trajectory Arcs
          </span>
          <span class="flex items-center gap-1.5 text-emerald-300">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Hub
          </span>
        </div>
      </div>

      <!-- Right Column: Target Telemetry & Radar Dials (3 cols) -->
      <div class="lg:col-span-3 space-y-3 font-mono text-xs">
        
        <!-- Radar Dial 1: Algorithmic Efficiency -->
        <div class="p-3 bg-dark-900/90 border border-cyan-500/20 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px] text-slate-400">
            <span class="uppercase font-bold text-cyan-400">ALGO RADAR SWEEP</span>
            <span class="text-cyan-300">STABLE</span>
          </div>

          <div class="flex items-center justify-center py-2 relative">
            <div class="relative w-28 h-28 flex items-center justify-center">
              <!-- Radar Background Rings -->
              <svg class="w-full h-full text-cyan-500/30" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="0.8" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 2" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="0.6" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="0.5" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" stroke-width="0.5" />
              </svg>
              <!-- Rotating Radar Sweep Line -->
              <div class="absolute inset-0 flex items-center justify-center animate-radar-sweep pointer-events-none">
                <div class="w-1/2 h-[1.5px] bg-gradient-to-r from-transparent to-cyan-400 origin-right ml-[-50%] shadow-glow-cyan"></div>
              </div>
              <!-- Center Target Blip -->
              <div class="absolute text-center z-10">
                <span class="text-base font-black text-white font-mono">{{ totalMetrics.roas }}x</span>
                <span class="text-[8px] text-cyan-300 block">AVG ROAS</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-dark-750">
            <div class="bg-dark-950 p-1 border border-dark-800">
              <span class="text-slate-500 block">CPR ACTUAL</span>
              <span class="text-emerald-400 font-bold">{{ formatIDR(totalMetrics.cpr) }}</span>
            </div>
            <div class="bg-dark-950 p-1 border border-dark-800">
              <span class="text-slate-500 block">STATUS</span>
              <span class="text-copper-400 font-bold">{{ totalMetrics.purchases }} Orders</span>
            </div>
          </div>
        </div>

        <!-- Radar Dial 2: Conversion Velocity Vector -->
        <div class="p-3 bg-dark-900/90 border border-copper-500/25 rounded-lg space-y-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="uppercase font-bold text-copper-400">CONVERSION VELOCITY</span>
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
                <span>Closing Rate Efficiency:</span>
                <span class="text-cyan-400 font-bold">{{ totalMetrics.closingRate }}%</span>
              </div>
              <div class="w-full bg-dark-950 h-1.5 border border-dark-750">
                <div class="bg-cyan-400 h-full" :style="{ width: `${Math.min(100, Number(totalMetrics.closingRate))}%` }"></div>
              </div>
            </div>
          </div>

          <div class="pt-1.5 text-[9px] text-slate-400 border-t border-dark-750 flex items-center justify-between">
            <span>PACKET SENT: {{ (props.campaigns || []).length }} CAMPAIGNS</span>
            <span class="text-copper-300 font-bold">REAL TELEMETRY</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Bottom Telemetry Ticker Ribbon -->
    <div class="mt-4 pt-3 border-t border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-[10px]">
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-cyan-400"></span>
        <span class="text-slate-400">PROTOCOL:</span>
        <span class="text-cyan-300 font-bold">META-MARKETING-v20</span>
      </div>
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-copper-400"></span>
        <span class="text-slate-400">SENTINEL:</span>
        <span class="text-copper-300 font-bold">ZERO-LOSS ACTIVE</span>
      </div>
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-emerald-400"></span>
        <span class="text-slate-400">DATABASE:</span>
        <span class="text-emerald-300 font-bold">SUPABASE REALTIME</span>
      </div>
      <div class="p-1.5 bg-dark-900 border border-dark-750 flex items-center justify-center gap-1.5">
        <span class="w-1.5 h-1.5 bg-purple-400"></span>
        <span class="text-slate-400">AI STREAM:</span>
        <span class="text-purple-300 font-bold">GEMINI 1.5 PRO EDGE</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { formatIDR } from '../utils/currency';

const props = defineProps({
  campaigns: {
    type: Array,
    default: () => []
  }
});

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

const globeCanvas = ref(null);
let animationFrameId = null;

// Global Traffic Hubs (Cities with latitude, longitude)
const trafficHubs = [
  { name: 'Jakarta Hub', lat: -6.2, lon: 106.8, roas: '14.2', ping: '8ms', statusColor: 'text-emerald-400', isPrimary: true },
  { name: 'Surabaya Node', lat: -7.25, lon: 112.75, roas: '11.8', ping: '12ms', statusColor: 'text-emerald-400', isPrimary: false },
  { name: 'Singapore Gateway', lat: 1.35, lon: 103.8, roas: '12.5', ping: '15ms', statusColor: 'text-cyan-300', isPrimary: false },
  { name: 'Tokyo Node', lat: 35.68, lon: 139.76, roas: '9.4', ping: '42ms', statusColor: 'text-cyan-300', isPrimary: false },
  { name: 'Sydney Orbit', lat: -33.86, lon: 151.2, roas: '8.7', ping: '58ms', statusColor: 'text-slate-400', isPrimary: false },
  { name: 'London Link', lat: 51.5, lon: -0.12, roas: '7.9', ping: '120ms', statusColor: 'text-slate-400', isPrimary: false },
];

// Frequency Equalizer randomizing values
const eqValues = ref([35, 62, 85, 45, 90, 78, 60, 95, 40, 70, 88, 52]);

// Dragging controls for manual globe rotation
let rotationY = 1.2;
let rotationX = 0.28;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

function startDrag(e) {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function onDrag(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - lastMouseX;
  const deltaY = e.clientY - lastMouseY;
  rotationY += deltaX * 0.008;
  rotationX += deltaY * 0.008;
  // Limit X tilt
  rotationX = Math.max(-0.6, Math.min(0.6, rotationX));
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
}

function endDrag() {
  isDragging = false;
}

// 3D Geometry Utilities
function projectPoint(latDeg, lonDeg, radius, rotY, rotX) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;

  // Spherical coordinates
  let x = radius * Math.cos(lat) * Math.sin(lon);
  let y = -radius * Math.sin(lat);
  let z = radius * Math.cos(lat) * Math.cos(lon);

  // Rotate around Y axis
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  let x1 = x * cosY + z * sinY;
  let z1 = -x * sinY + z * cosY;

  // Rotate around X axis (tilt)
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  let y2 = y * cosX - z1 * sinX;
  let z2 = y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

onMounted(() => {
  const canvas = globeCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Set crisp canvas dimensions
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 320;
  const height = rect.height || 320;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  const radius = width * 0.38;
  const centerX = width / 2;
  const centerY = height / 2;

  let animTime = 0;

  function render() {
    animTime += 0.016;
    if (!isDragging) {
      rotationY += 0.004; // Smooth automatic orbit rotation
    }

    // Randomize slight equalizer bars periodically
    if (Math.random() < 0.04) {
      eqValues.value = eqValues.value.map(v => Math.max(25, Math.min(100, v + (Math.random() * 20 - 10))));
    }

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Globe Atmospheric Outer Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Subtle atmospheric glow gradient
    const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius);
    grad.addColorStop(0, 'rgba(8, 15, 28, 0)');
    grad.addColorStop(0.9, 'rgba(0, 240, 255, 0.06)');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0.18)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 2. Draw Latitude Wireframe Rings
    const latSteps = [-60, -40, -20, 0, 20, 40, 60];
    latSteps.forEach(latDeg => {
      ctx.beginPath();
      let first = true;
      for (let lonDeg = 0; lonDeg <= 360; lonDeg += 10) {
        const p = projectPoint(latDeg, lonDeg, radius, rotationY, rotationX);
        const screenX = centerX + p.x;
        const screenY = centerY + p.y;
        if (first) {
          ctx.moveTo(screenX, screenY);
          first = false;
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      ctx.strokeStyle = latDeg === 0 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = latDeg === 0 ? 1.2 : 0.7;
      ctx.stroke();
    });

    // 3. Draw Longitude Wireframe Meridians
    for (let lonDeg = 0; lonDeg < 360; lonDeg += 30) {
      ctx.beginPath();
      let first = true;
      for (let latDeg = -90; latDeg <= 90; latDeg += 8) {
        const p = projectPoint(latDeg, lonDeg, radius, rotationY, rotationX);
        const screenX = centerX + p.x;
        const screenY = centerY + p.y;
        if (first) {
          ctx.moveTo(screenX, screenY);
          first = false;
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // 4. Draw Ballistic Trajectory Arcs (Solar Copper / Orange #f97316)
    // Connecting Jakarta to Singapore, Tokyo, Sydney, London
    const arcs = [
      { from: trafficHubs[0], to: trafficHubs[2], offset: 0 },
      { from: trafficHubs[0], to: trafficHubs[3], offset: 0.33 },
      { from: trafficHubs[0], to: trafficHubs[4], offset: 0.66 },
      { from: trafficHubs[2], to: trafficHubs[5], offset: 0.5 },
    ];

    arcs.forEach((arc, arcIdx) => {
      const p1 = projectPoint(arc.from.lat, arc.from.lon, radius, rotationY, rotationX);
      const p2 = projectPoint(arc.to.lat, arc.to.lon, radius, rotationY, rotationX);

      // Only draw if at least one point is on front hemisphere
      if (p1.z > -radius * 0.4 || p2.z > -radius * 0.4) {
        // Compute elevated midpoint in 3D orbit
        const midLat = (arc.from.lat + arc.to.lat) / 2;
        const midLon = (arc.from.lon + arc.to.lon) / 2;
        const pMid = projectPoint(midLat, midLon, radius * 1.32, rotationY, rotationX);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX + p1.x, centerY + p1.y);
        ctx.quadraticCurveTo(
          centerX + pMid.x,
          centerY + pMid.y,
          centerX + p2.x,
          centerY + p2.y
        );
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.75)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated traveling pulse packet along arc
        const t = (animTime * 0.7 + arc.offset) % 1;
        // Quadratic bezier formula
        const qx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * pMid.x + t * t * p2.x;
        const qy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * pMid.y + t * t * p2.y;

        ctx.beginPath();
        ctx.arc(centerX + qx, centerY + qy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffedd5';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }
    });

    // 5. Draw Hub Nodes on Globe Surface
    trafficHubs.forEach(hub => {
      const p = projectPoint(hub.lat, hub.lon, radius, rotationY, rotationX);
      // If node is on front hemisphere
      if (p.z > -radius * 0.2) {
        const sx = centerX + p.x;
        const sy = centerY + p.y;

        ctx.save();
        // Outer pulsing ring
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.strokeStyle = hub.isPrimary ? '#f97316' : '#00f0ff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = hub.isPrimary ? '#fb923c' : '#38bdf8';
        ctx.fill();

        // If highly visible on front, draw tech tag
        if (p.z > radius * 0.2) {
          ctx.font = '9px monospace';
          ctx.fillStyle = hub.isPrimary ? '#fdba74' : '#67e8f9';
          ctx.fillText(hub.name, sx + 7, sy + 3);

          // Small indicator tick
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + 5, sy);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 0.8;
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
