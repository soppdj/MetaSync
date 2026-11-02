<template>
  <div class="space-y-6">

    <!-- ===================================================================== -->
    <!-- TAMPILAN AWAL (HUB SELEKSI TOOLS) - SESUAI GAMBAR 1 (CRISP SCI-FI HUD) -->
    <!-- ===================================================================== -->
    <div v-if="!activeTool" class="p-6 md:p-10 hud-panel hud-corner shadow-2xl relative overflow-hidden">
      <!-- Welcome Greeting Header -->
      <div class="mb-8 font-mono">
        <h1 class="text-2xl md:text-3xl font-black text-white flex items-center gap-2 tracking-tight">
          Halo, <span class="text-cyan-400">Sopianto Djahar</span>
          <span class="inline-block text-2xl animate-pulse">👋</span>
        </h1>
        <p class="text-xs text-slate-400 mt-2 font-mono">[ SYSTEM // CONTENT STUDIO: PILIH INSTRUMEN ]</p>
      </div>

      <!-- 4 Tools Grid (2x2 layout matching Gambar 1) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- CARD 1: Buyer Persona -->
        <div 
          @click="selectTool('buyer-persona')"
          class="group p-6 rounded-2xl bg-dark-900/90 border border-dark-800 hover:border-purple-500/50 hover:bg-dark-850/90 transition-all cursor-pointer flex items-start gap-4 shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-glow-purple transition-all">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              Buyer Persona
            </h3>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
              Generate buyer persona lengkap untuk produkmu
            </p>
          </div>
        </div>

        <!-- CARD 2: Value Proposition Canvas -->
        <div 
          @click="selectTool('vpc')"
          class="group p-6 rounded-2xl bg-dark-900/90 border border-dark-800 hover:border-purple-500/50 hover:bg-dark-850/90 transition-all cursor-pointer flex items-start gap-4 shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-glow-purple transition-all">
            <FileText class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              Value Proposition Canvas
            </h3>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
              Buat VPC dengan fitur, benefit, experience, need, want & fears
            </p>
          </div>
        </div>

        <!-- CARD 3: Hypnowriting (formerly Copywriting) -->
        <div 
          @click="selectTool('hypnowriting')"
          class="group p-6 rounded-2xl bg-dark-900/90 border border-dark-800 hover:border-purple-500/50 hover:bg-dark-850/90 transition-all cursor-pointer flex items-start gap-4 shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-glow-purple transition-all">
            <PenTool class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              Hypnowriting
            </h3>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
              Generate hypnowriting promosi dengan struktur lengkap
            </p>
          </div>
        </div>

        <!-- CARD 4: Narasi Konten -->
        <div 
          @click="selectTool('narasi-konten')"
          class="group p-6 rounded-2xl bg-dark-900/90 border border-dark-800 hover:border-purple-500/50 hover:bg-dark-850/90 transition-all cursor-pointer flex items-start gap-4 shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-purple-400 group-hover:shadow-glow-purple transition-all">
            <Video class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
              Narasi Konten
            </h3>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
              Buat narasi & skrip video iklan dengan berbagai formula & hook
            </p>
          </div>
        </div>

        <!-- CARD 5: Landing Page Builder (LP Builder) -->
        <div 
          @click="selectTool('lp-builder')"
          class="group p-6 rounded-2xl bg-dark-900/90 border border-dark-800 hover:border-cyan-500/50 hover:bg-dark-850/90 transition-all cursor-pointer flex items-start gap-4 shadow-lg hover:shadow-cyan-500/10 relative overflow-hidden"
        >
          <div class="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-cyan-400 group-hover:shadow-glow-cyan transition-all">
            <LayoutTemplate class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Landing Page Builder
              </h3>
              <span class="text-[9px] px-1.5 py-0.5 rounded font-black font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 uppercase">
                Hook Mematikan
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
              Susun landing page direct-response berkonversi tinggi dengan hook mematikan dari hasil Persona, VPC & Hypnowriting
            </p>
          </div>
        </div>

      </div>
    </div>


    <!-- ===================================================================== -->
    <!-- TAMPILAN INTERAKTIF TOOL SPESIFIK                                     -->
    <!-- ===================================================================== -->
    <div v-else class="space-y-4">
      
      <!-- Top Navigation: Back to Tools Hub & Tool Title -->
      <div class="flex items-center justify-between">
        <button
          @click="backToHub"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-300 hover:text-white text-xs font-semibold border border-dark-750 transition-all group"
        >
          <ArrowLeft class="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Pilihan Tools</span>
        </button>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-slate-500">Content Studio /</span>
          <span class="text-xs font-bold text-purple-400 uppercase tracking-wide">{{ activeToolTitle }}</span>
        </div>
      </div>

      <!-- Main Title of Current Tool -->
      <div class="flex items-center gap-3">
        <h2 
          class="text-2xl font-extrabold tracking-tight"
          :class="activeTool === 'lp-builder' ? 'text-cyan-400' : 'text-purple-400'"
        >
          {{ activeToolTitle }}
        </h2>
        <span 
          v-if="activeTool === 'narasi-konten'" 
          class="text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 shadow-sm"
        >
          v2.00 — Road to 100 Juta Edition
        </span>
        <span 
          v-else-if="activeTool === 'lp-builder'" 
          class="text-[11px] font-bold font-mono px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-glow-cyan"
        >
          Direct-Response CRO • Hook Mematikan
        </span>
      </div>

      <!-- Workspace 2 Kolom (Input Data Kiri & Output Kanan) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- KOLOM KIRI: INPUT DATA (5 cols) -->
        <div class="lg:col-span-5 bg-dark-900/95 border border-dark-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div class="flex items-center gap-2.5 pb-2 border-b border-dark-800">
            <component 
              :is="activeToolIcon" 
              class="w-5 h-5" 
              :class="activeTool === 'lp-builder' ? 'text-cyan-400' : 'text-purple-400'"
            />
            <h3 class="text-base font-bold text-white">Input Data</h3>
          </div>

          <!-- FORM: BUYER PERSONA -->
          <form v-if="activeTool === 'buyer-persona'" @submit.prevent="runGenerateStream" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Produk
              </label>
              <input
                v-model="formBuyerPersona.productName"
                type="text"
                required
                placeholder="Contoh: Skincare Glow Serum"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Rencana Iklan
              </label>
              <input
                v-model="formBuyerPersona.adPlan"
                type="text"
                placeholder="Contoh: Instagram & Facebook Ads"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              :disabled="isGenerating"
              class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
            >
              <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
              <span>{{ isGenerating ? 'Sedang Memproses...' : '✨ Generate Prompt' }}</span>
            </button>
          </form>

          <!-- FORM: VALUE PROPOSITION CANVAS -->
          <form v-else-if="activeTool === 'vpc'" @submit.prevent="runGenerateStream" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Produk
              </label>
              <input
                v-model="formVpc.productName"
                type="text"
                required
                placeholder="Contoh: Skincare Glow Serum"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Rencana Iklan
              </label>
              <input
                v-model="formVpc.adPlan"
                type="text"
                placeholder="Contoh: Instagram & Facebook Ads"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Deskripsi Produk
              </label>
              <textarea
                v-model="formVpc.productDescription"
                rows="4"
                placeholder="Jelaskan detail produk kamu..."
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isGenerating"
              class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
            >
              <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
              <span>{{ isGenerating ? 'Sedang Memproses...' : '✨ Generate Prompt' }}</span>
            </button>
          </form>

          <!-- FORM: HYPNOWRITING (formerly Copywriting) -->
          <form v-else-if="activeTool === 'hypnowriting'" @submit.prevent="runGenerateStream" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Produk
              </label>
              <input
                v-model="formHypnowriting.productName"
                type="text"
                required
                placeholder="Contoh: Skincare Glow Serum"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Target Market
              </label>
              <input
                v-model="formHypnowriting.targetMarket"
                type="text"
                placeholder="Contoh: Wanita 25-35 tahun, ibu rumah tangga, pekerja kantoran..."
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Gaya Bahasa
              </label>
              <input
                v-model="formHypnowriting.languageStyle"
                type="text"
                placeholder="Contoh: Santai, Persuasif, Storytelling"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Jenis Produk
              </label>
              <div class="flex items-center gap-6 mt-1 text-xs text-slate-200">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    v-model="formHypnowriting.productType"
                    value="Produk Fisik"
                    class="accent-purple-500 w-4 h-4"
                  />
                  <span>Produk Fisik</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    v-model="formHypnowriting.productType"
                    value="Produk Digital"
                    class="accent-purple-500 w-4 h-4"
                  />
                  <span>Produk Digital</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Value Proposition Canvas (VPC)
              </label>
              <textarea
                v-model="formHypnowriting.vpcData"
                rows="3"
                placeholder="Paste hasil VPC kamu di sini (Fitur, Benefit, Experience, Need, Want, Fears)..."
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isGenerating"
              class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-2"
            >
              <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
              <span>{{ isGenerating ? 'Sedang Memproses...' : '✨ Generate Prompt' }}</span>
            </button>
          </form>

          <!-- FORM: NARASI KONTEN (v2.00 - Road to 100 Juta Edition) -->
          <form v-else-if="activeTool === 'narasi-konten'" @submit.prevent="runGenerateStream" class="space-y-4">
            
            <!-- Row 1: Nama Produk & Kategori -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">
                  Nama Produk
                </label>
                <input
                  v-model="formNarasi.productName"
                  type="text"
                  required
                  placeholder="Contoh: CCTV Luminox 360"
                  class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">
                  Kategori
                </label>
                <input
                  v-model="formNarasi.category"
                  type="text"
                  placeholder="Contoh: Elektronik / Kecantikan"
                  class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <!-- Field 2: Value Proposition Canvas (VPC) -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Value Proposition Canvas (VPC)
              </label>
              <textarea
                v-model="formNarasi.vpcData"
                rows="3"
                placeholder="Tuliskan / tempelkan detail VPC produk (Fitur, Benefit, Experience, Need, Want, Fear)..."
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              ></textarea>
            </div>

            <!-- Field 3: Durasi Video -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Durasi Video
              </label>
              <select
                v-model="formNarasi.videoDuration"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih durasi video</option>
                <option value="15 Detik (Shorts/Reels Hook Cepat)">15 Detik (Shorts/Reels Hook Cepat)</option>
                <option value="30 Detik (Standard Meta Ads)">30 Detik (Standard Meta Ads)</option>
                <option value="60 Detik (Storytelling & Bukti Klinis)">60 Detik (Storytelling & Bukti Klinis)</option>
                <option value="90 Detik (Full Explainer & Demo Ekstrem)">90 Detik (Full Explainer & Demo Ekstrem)</option>
              </select>
            </div>

            <!-- Field 4: Formula / Struktur -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Formula / Struktur
              </label>
              <select
                v-model="formNarasi.formula"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih formula copywriting</option>
                <option value="AIDA (Attention - Interest - Desire - Action)">AIDA (Attention - Interest - Desire - Action)</option>
                <option value="PAS (Problem - Agitate - Solution)">PAS (Problem - Agitate - Solution)</option>
                <option value="BAB (Before - After - Bridge)">BAB (Before - After - Bridge)</option>
                <option value="FAB (Feature - Advantage - Benefit)">FAB (Feature - Advantage - Benefit)</option>
                <option value="4U (Useful - Urgent - Unique - Ultra-specific)">4U (Useful - Urgent - Unique - Ultra-specific)</option>
                <option value="Hook, Story, Offer (Russell Brunson)">Hook, Story, Offer (Russell Brunson)</option>
                <option value="Epiphany Bridge Story">Epiphany Bridge Story</option>
                <option value="Problem - Solution - Proof - Offer (Hard Sell)">Problem - Solution - Proof - Offer (Hard Sell)</option>
                <option value="3-Act Mini Drama">3-Act Mini Drama</option>
              </select>
            </div>

            <!-- Field 5: Hook -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Hook
              </label>
              <select
                v-model="formNarasi.hookType"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih hook untuk narasi</option>
                <option value="Pattern Interrupt (Mengejutkan & Hentikan Scroll)">Pattern Interrupt (Mengejutkan & Hentikan Scroll)</option>
                <option value="Visual Shock (Aksi Visual Ekstrem)">Visual Shock (Aksi Visual Ekstrem)</option>
                <option value="Pertanyaan Provokatif (Menampar Realita)">Pertanyaan Provokatif (Menampar Realita)</option>
                <option value="Rahasia Tersembunyi (Curiosity / Secret)">Rahasia Tersembunyi (Curiosity / Secret)</option>
                <option value="Testimoni / Kutipan Ekstrem">Testimoni / Kutipan Ekstrem</option>
                <option value="Kontroversial / Debunking Mitos">Kontroversial / Debunking Mitos</option>
                <option value="Relatable / Empati ('Ini Gue Banget')">Relatable / Empati ("Ini Gue Banget")</option>
                <option value="Urgency / Peringatan Darurat">Urgency / Peringatan Darurat</option>
              </select>
            </div>

            <!-- Field 6: CTA (Call to Action) -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                CTA (Call to Action)
              </label>
              <select
                v-model="formNarasi.ctaType"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih CTA untuk akhir narasi</option>
                <option value="Klik Link di Bawah (Pesan Sekarang)">Klik Link di Bawah (Pesan Sekarang)</option>
                <option value="Beli Sekarang (Diskon / Promo Terbatas)">Beli Sekarang (Diskon / Promo Terbatas)</option>
                <option value="Klik Tombol WhatsApp (Konsultasi Gratis)">Klik Tombol WhatsApp (Konsultasi Gratis)</option>
                <option value="Kunjungi Website / Checkout Sekarang">Kunjungi Website / Checkout Sekarang</option>
                <option value="Cek Keranjang Kuning / Link di Bio">Cek Keranjang Kuning / Link di Bio</option>
                <option value="Klaim Voucher Subsidi Bebas Ongkir">Klaim Voucher Subsidi Bebas Ongkir</option>
              </select>
            </div>

            <!-- Field 7: Gaya Bahasa (Pilih satu atau lebih) -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-2">
                Gaya Bahasa <span class="text-slate-400 font-normal">(pilih satu atau lebih)</span>
              </label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  v-for="style in languageStyleOptions"
                  :key="style"
                  @click="toggleLanguageStyle(style)"
                  class="flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all"
                  :class="[
                    formNarasi.languageStyles.includes(style)
                      ? 'bg-purple-950/50 border-purple-500 text-purple-200 ring-1 ring-purple-500/40 shadow-glow-purple/20'
                      : 'bg-dark-850/80 border-dark-750 text-slate-300 hover:bg-dark-800'
                  ]"
                >
                  <span 
                    class="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-all"
                    :class="[
                      formNarasi.languageStyles.includes(style)
                        ? 'border-purple-400 bg-purple-500'
                        : 'border-slate-600 bg-dark-900'
                    ]"
                  >
                    <span v-if="formNarasi.languageStyles.includes(style)" class="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <span class="truncate">{{ style }}</span>
                </button>
              </div>
            </div>

            <!-- Field 8: Tahap Funnel -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Tahap Funnel
              </label>
              <select
                v-model="formNarasi.funnelStage"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Pilih tahap funnel</option>
                <option value="TOFU (Top of Funnel - Cold Traffic / Awareness)">TOFU (Top of Funnel - Cold Traffic / Awareness)</option>
                <option value="MOFU (Middle of Funnel - Warm Traffic / Consideration)">MOFU (Middle of Funnel - Warm Traffic / Consideration)</option>
                <option value="BOFU (Bottom of Funnel - Hot Traffic / Conversion & Retargeting)">BOFU (Bottom of Funnel - Hot Traffic / Conversion & Retargeting)</option>
              </select>
            </div>

            <!-- Field 9: Catatan Tambahan (opsional) -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Catatan Tambahan <span class="text-slate-400 font-normal">(opsional)</span>
              </label>
              <textarea
                v-model="formNarasi.additionalNotes"
                rows="2.5"
                placeholder="Tulis catatan khusus, misal: fokus ke promo akhir tahun, gunakan bahasa gaul, dll.."
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="isGenerating"
              class="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-glow-purple flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-3"
            >
              <Sparkles class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" />
              <span>{{ isGenerating ? 'Sedang Memproses...' : '✨ Generate Prompt' }}</span>
            </button>
          </form>

          <!-- FORM: LANDING PAGE BUILDER (LP BUILDER) -->
          <form v-else-if="activeTool === 'lp-builder'" @submit.prevent="runGenerateStream" class="space-y-4">
            
            <!-- Quick Auto-Sync Bar from Persona, VPC & Hypnowriting -->
            <div class="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                  <Flame class="w-3.5 h-3.5 text-copper-400" />
                  Sintesis Riset Studio
                </span>
                <button
                  type="button"
                  @click="syncFromPreviousTools"
                  class="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-dark-950 bg-gradient-to-r from-brand-400 to-cyan-300 hover:opacity-90 rounded-lg shadow-glow-cyan transition-all font-mono"
                  title="Tarik data otomatis dari Persona, VPC dan Hypnowriting"
                >
                  <RefreshCw class="w-3 h-3 text-dark-950" />
                  <span>⚡ Tarik Data Riset</span>
                </button>
              </div>
              <p class="text-[10px] text-slate-400 leading-normal font-sans">
                Landing Page ini menggabungkan data Buyer Persona, VPC &amp; naskah Hypnowriting menjadi susunan penawaran berdaya konversi tinggi dengan hook mematikan.
              </p>
              <div class="flex flex-wrap gap-1.5 text-[9px] font-mono">
                <span 
                  class="px-2 py-0.5 rounded border font-semibold flex items-center gap-1"
                  :class="hasPersonaData ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50' : 'bg-dark-900 text-slate-500 border-dark-750'"
                >
                  <CheckCircle2 v-if="hasPersonaData" class="w-2.5 h-2.5" />
                  {{ hasPersonaData ? 'Persona Terhubung' : 'Persona Kosong' }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded border font-semibold flex items-center gap-1"
                  :class="hasVpcData ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50' : 'bg-dark-900 text-slate-500 border-dark-750'"
                >
                  <CheckCircle2 v-if="hasVpcData" class="w-2.5 h-2.5" />
                  {{ hasVpcData ? 'VPC Terhubung' : 'VPC Kosong' }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded border font-semibold flex items-center gap-1"
                  :class="hasHypnowritingData ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50' : 'bg-dark-900 text-slate-500 border-dark-750'"
                >
                  <CheckCircle2 v-if="hasHypnowritingData" class="w-2.5 h-2.5" />
                  {{ hasHypnowritingData ? 'Hypnowriting Terhubung' : 'Hypnowriting Kosong' }}
                </span>
              </div>
            </div>

            <!-- Row 1: Nama Produk & Kategori -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">
                  Nama Produk <span class="text-cyan-400">*</span>
                </label>
                <input
                  v-model="formLpBuilder.productName"
                  type="text"
                  required
                  placeholder="Contoh: Anti-Acne Clarifying Serum 30ml"
                  class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">
                  Kategori / Niche
                </label>
                <input
                  v-model="formLpBuilder.category"
                  type="text"
                  placeholder="Contoh: Skincare / Kecantikan"
                  class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <!-- Row 2: Harga Jual & Penawaran (Offer) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">
                  Harga Jual (IDR)
                </label>
                <input
                  v-model="formLpBuilder.price"
                  type="text"
                  placeholder="Contoh: 149000"
                  class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1.5">
                  Penawaran Utama (Offer / Promo)
                </label>
                <input
                  v-model="formLpBuilder.offer"
                  type="text"
                  placeholder="Contoh: Promo Diskon 50% + Garansi 30 Hari"
                  class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <!-- Field 3: Riset Persona Audience -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold text-slate-300">
                  Data Persona Audience (Pain, Desire, Fears)
                </label>
                <span v-if="hasPersonaData" class="text-[10px] text-emerald-400 font-bold font-mono">✓ Tersinkron</span>
              </div>
              <textarea
                v-model="formLpBuilder.personaData"
                rows="2"
                placeholder="Rangkuman profil pembeli, ketakutan, rasa minder, dan impian mereka..."
                class="w-full px-3 py-2 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
              ></textarea>
            </div>

            <!-- Field 4: Riset VPC (Value Proposition Canvas) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold text-slate-300">
                  Data Value Proposition Canvas (VPC)
                </label>
                <span v-if="hasVpcData" class="text-[10px] text-emerald-400 font-bold font-mono">✓ Tersinkron</span>
              </div>
              <textarea
                v-model="formLpBuilder.vpcData"
                rows="2"
                placeholder="Fitur teknis, benefit emosional, need, want, dan pereda masalah (pain reliever)..."
                class="w-full px-3 py-2 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
              ></textarea>
            </div>

            <!-- Field 5: Riset Hypnowriting & Winning Angles -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold text-slate-300">
                  Data Hypnowriting &amp; Winning Angles
                </label>
                <span v-if="hasHypnowritingData" class="text-[10px] text-emerald-400 font-bold font-mono">✓ Tersinkron</span>
              </div>
              <textarea
                v-model="formLpBuilder.hypnowritingData"
                rows="2"
                placeholder="Hook tajam, formula PAS/BAB/AIDA, dan cerita transformasi..."
                class="w-full px-3 py-2 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-mono"
              ></textarea>
            </div>

            <!-- Field 6: Strategi Hook Mematikan -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Strategi Hook Mematikan
              </label>
              <select
                v-model="formLpBuilder.hookStrategy"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Pattern Interrupt (Hentikan Kebiasaan Salah &amp; Bongkar Mitos)">
                  ⚡ Pattern Interrupt (Hentikan Kebiasaan Salah &amp; Bongkar Mitos)
                </option>
                <option value="Pain-Agony (Menampar Realita Masalah Menahun Tanpa Basa-Basi)">
                  💔 Pain-Agony (Menampar Realita Masalah Menahun Tanpa Basa-Basi)
                </option>
                <option value="Curiosity &amp; Secret Gap (Bongkar Rahasia Formula yang Disembunyikan)">
                  🔍 Curiosity &amp; Secret Gap (Bongkar Rahasia Formula yang Disembunyikan)
                </option>
                <option value="Extreme Transformation (Janji Before-After Nyata &amp; Terukur 14 Hari)">
                  🚀 Extreme Transformation (Janji Before-After Nyata &amp; Terukur 14 Hari)
                </option>
                <option value="Fear of Regret &amp; Scarcity (Peringatan Kerugian Besar Akibat Menunda)">
                  ⏳ Fear of Regret &amp; Scarcity (Peringatan Kerugian Besar Akibat Menunda)
                </option>
              </select>
            </div>

            <!-- Field 7: Target Platform CMS -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">
                Target Platform / CMS Landing Page
              </label>
              <select
                v-model="formLpBuilder.targetPlatform"
                class="w-full px-4 py-2.5 rounded-xl bg-dark-850 border border-dark-750 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Universal (Berdu, OrderOnline, Elementor, WordPress)">
                  🌐 Universal (Berdu, OrderOnline, Elementor, WordPress)
                </option>
                <option value="Berdu.id (Direct Checkout Form Optimized)">
                  📦 Berdu.id (Direct Checkout Form Optimized)
                </option>
                <option value="OrderOnline.id (Sales Funnel &amp; Pixel Tracking)">
                  🛒 OrderOnline.id (Sales Funnel &amp; Pixel Tracking)
                </option>
                <option value="WordPress + Elementor Pro">
                  💻 WordPress + Elementor Pro
                </option>
                <option value="Shopify / Custom Web Landing Page">
                  🛍️ Shopify / Custom Web Landing Page
                </option>
              </select>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isGenerating"
              class="w-full py-3 px-4 rounded-xl text-xs font-black text-dark-950 bg-gradient-to-r from-brand-400 via-cyan-300 to-copper-400 hover:opacity-95 shadow-glow-cyan flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-3 font-mono tracking-wider"
            >
              <Sparkles class="w-4 h-4 text-dark-950" :class="{ 'animate-spin': isGenerating }" />
              <span>{{ isGenerating ? 'Membangun Landing Page...' : '🔥 GENERATE LANDING PAGE (HOOK MEMATIKAN)' }}</span>
            </button>
          </form>

        </div>

        <!-- KOLOM KANAN: OUTPUT HASIL (7 cols) -->
        <div class="lg:col-span-7 bg-dark-900/95 border border-dark-800 rounded-3xl p-6 shadow-xl flex flex-col min-h-[500px]">
          
          <!-- Header Bar Output -->
          <div class="flex flex-wrap items-center justify-between pb-3 border-b border-dark-800 mb-3 gap-2">
            <div class="flex items-center gap-2">
              <span 
                class="w-2.5 h-2.5 rounded-full" 
                :class="isGenerating ? (activeTool === 'lp-builder' ? 'bg-cyan-400 animate-ping' : 'bg-purple-400 animate-ping') : 'bg-emerald-400'"
              ></span>
              <span class="text-xs font-bold text-white">
                {{ isGenerating ? 'Sedang Merancang (Live Stream)...' : (currentOutput ? 'Hasil Siap Pakai' : 'Pratinjau Output') }}
              </span>
              <span v-if="savedStatus" class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold font-mono">
                ✓ Auto-Saved
              </span>
            </div>

            <!-- View Mode Switcher (For LP Builder) -->
            <div v-if="activeTool === 'lp-builder'" class="flex items-center gap-1 bg-dark-950 p-0.5 rounded-xl border border-dark-800 text-[11px] font-mono">
              <button 
                type="button"
                @click="lpViewMode = 'preview'"
                class="px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
                :class="lpViewMode === 'preview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' : 'text-slate-400 hover:text-white'"
              >
                <Monitor class="w-3 h-3" />
                <span>Visual Mockup</span>
              </button>
              <button 
                type="button"
                @click="lpViewMode = 'copy'"
                class="px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1"
                :class="lpViewMode === 'copy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan' : 'text-slate-400 hover:text-white'"
              >
                <FileText class="w-3 h-3" />
                <span>Naskah Copy</span>
              </button>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <!-- LP Builder HTML Actions -->
              <template v-if="activeTool === 'lp-builder'">
                <button
                  type="button"
                  @click="copyLpHtml"
                  class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all font-mono"
                  title="Salin kode HTML landing page"
                >
                  <Copy class="w-3 h-3 text-cyan-400" />
                  <span>Salin HTML</span>
                </button>
                <button
                  type="button"
                  @click="downloadLpHtml"
                  class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-dark-950 text-xs font-bold shadow-glow-cyan transition-all font-mono"
                  title="Download file HTML mandiri siap pakai"
                >
                  <Download class="w-3 h-3 text-dark-950" />
                  <span>.HTML</span>
                </button>
              </template>

              <!-- Copy Output Text -->
              <button
                v-if="currentOutput"
                type="button"
                @click="copyOutput"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-850 hover:bg-dark-800 text-slate-300 text-xs font-semibold border border-dark-700 transition-all"
              >
                <Copy class="w-3.5 h-3.5" :class="activeTool === 'lp-builder' ? 'text-cyan-400' : 'text-purple-400'" />
                <span>{{ copyButtonText }}</span>
              </button>
            </div>
          </div>

          <!-- The Output Box -->
          <div 
            ref="streamContainerRef"
            class="flex-1 overflow-y-auto max-h-[620px] rounded-2xl bg-dark-950 p-4 sm:p-5 border border-dark-850 font-mono text-xs leading-relaxed text-slate-200 select-text"
          >
            <!-- 1. LP BUILDER VISUAL MOCKUP PREVIEW MODE -->
            <div v-if="activeTool === 'lp-builder' && lpViewMode === 'preview'" class="space-y-4 font-sans">
              
              <!-- Device Selector & Controls Bar -->
              <div class="flex items-center justify-between pb-3 border-b border-dark-800 text-[11px] font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-slate-400">Pratinjau Layar:</span>
                  <div class="flex items-center gap-1 bg-dark-900 p-0.5 rounded-lg border border-dark-800">
                    <button
                      type="button"
                      @click="previewDevice = 'mobile'"
                      class="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all"
                      :class="previewDevice === 'mobile' ? 'bg-cyan-400 text-dark-950 font-black shadow-glow-cyan' : 'text-slate-400 hover:text-white'"
                    >
                      <Smartphone class="w-3 h-3" />
                      <span>Mobile 375px</span>
                    </button>
                    <button
                      type="button"
                      @click="previewDevice = 'desktop'"
                      class="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all"
                      :class="previewDevice === 'desktop' ? 'bg-cyan-400 text-dark-950 font-black shadow-glow-cyan' : 'text-slate-400 hover:text-white'"
                    >
                      <Monitor class="w-3 h-3" />
                      <span>Desktop</span>
                    </button>
                  </div>
                </div>

                <div class="flex items-center gap-1 text-[10px] text-cyan-300 font-bold">
                  <Flame class="w-3.5 h-3.5 text-copper-400" />
                  <span>Hook Mematikan &amp; CRO Ready</span>
                </div>
              </div>

              <!-- Interactive Device Frame -->
              <div 
                class="mx-auto transition-all overflow-hidden bg-slate-950 text-slate-100 shadow-2xl rounded-2xl border"
                :class="previewDevice === 'mobile' ? 'max-w-[390px] border-4 border-slate-700 rounded-[32px]' : 'w-full border-dark-800'"
              >
                <!-- 1. Top Urgency Announcement Bar -->
                <div class="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white text-[10px] sm:text-[11px] font-extrabold py-2 px-3 text-center tracking-wide flex items-center justify-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>⚡ FLASH SALE: Diskon 50% + Bebas Ongkir Tersisa 19 Paket!</span>
                </div>

                <!-- 2. Hero Section (Above The Fold) -->
                <div class="p-4 sm:p-6 bg-gradient-to-b from-dark-950 via-dark-900 to-dark-950 border-b border-dark-800 text-center space-y-3">
                  <!-- Audience Pre-headline -->
                  <span class="inline-block text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-mono">
                    Khusus Pria &amp; Wanita yang Lelah Gonta-Ganti Skincare Bekas Jerawat...
                  </span>
                  
                  <!-- Main Headline (Deadly Hook) -->
                  <h1 class="text-base sm:text-2xl font-black text-white leading-tight tracking-tight">
                    Hentikan Kebiasaan "Mendempul" Bekas Jerawat dengan Bedak Tebal!
                  </h1>
                  
                  <!-- Sub-headline (Unique Mechanism) -->
                  <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                    Pudarkan hingga 80% noda hitam membandel dalam 14 hari dengan penetrasi ganda Niacinamide 10% + Tranexamic 3% langsung ke sumber melanin, tanpa rasa perih dan tanpa ketergantungan.
                  </p>

                  <!-- Visual Hero Product Mockup Box -->
                  <div class="my-3 p-4 rounded-2xl bg-dark-900/90 border border-cyan-500/30 shadow-glow-cyan/20 max-w-xs mx-auto text-center space-y-2">
                    <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Sparkles class="w-8 h-8 animate-pulse text-cyan-400" />
                    </div>
                    <div class="font-black text-white text-xs sm:text-sm">
                      {{ formLpBuilder.productName || 'Anti-Acne Clarifying Serum 30ml' }}
                    </div>
                    <div class="flex items-center justify-center gap-1.5 text-[9px] text-emerald-400 font-mono">
                      <span class="px-2 py-0.5 bg-emerald-950/80 rounded border border-emerald-500/40">✓ Resmi BPOM RI</span>
                      <span class="px-2 py-0.5 bg-emerald-950/80 rounded border border-emerald-500/40">✓ Halal MUI</span>
                    </div>
                  </div>

                  <!-- Pulsing CTA Button -->
                  <a 
                    href="#order-box"
                    class="block w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black text-dark-950 bg-gradient-to-r from-emerald-400 via-cyan-300 to-copper-400 hover:opacity-95 shadow-glow-cyan text-center tracking-wide font-mono transition-transform hover:scale-[1.02]"
                  >
                    👉 YA! SAYA MAU KULIT BERSIH (AMBIL DISKON 50%)
                  </a>

                  <!-- Trust Badges -->
                  <div class="flex flex-wrap items-center justify-center gap-2 text-[9px] sm:text-[10px] text-slate-400 pt-1 font-mono">
                    <span>🛡️ Garansi 30 Hari</span>
                    <span>&bull;</span>
                    <span>🚚 Kirim Hari Ini</span>
                    <span>&bull;</span>
                    <span>💵 Bayar di Tempat (COD)</span>
                  </div>
                </div>

                <!-- 3. Pain Agitation Section -->
                <div class="p-4 sm:p-5 bg-dark-950 border-b border-dark-800 space-y-3">
                  <div class="text-center">
                    <span class="text-[9px] font-bold text-rose-400 uppercase tracking-wider font-mono">Pain Agitation</span>
                    <h3 class="text-xs sm:text-sm font-extrabold text-white mt-0.5">Pernahkah Anda Mengalami Ini?</h3>
                  </div>
                  <div class="space-y-2">
                    <div class="p-2.5 rounded-xl bg-dark-900 border border-rose-500/20 flex items-start gap-2 text-[11px] text-slate-300">
                      <span class="text-rose-400 shrink-0 font-bold">⚠️</span>
                      <span>Menghabiskan 30 menit tiap pagi hanya untuk menutupi bintik hitam dengan concealer tebal.</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-dark-900 border border-rose-500/20 flex items-start gap-2 text-[11px] text-slate-300">
                      <span class="text-rose-400 shrink-0 font-bold">⚠️</span>
                      <span>Refleks memalingkan wajah dan cemas saat diajak bicara tatap muka jarak dekat.</span>
                    </div>
                    <div class="p-2.5 rounded-xl bg-dark-900 border border-rose-500/20 flex items-start gap-2 text-[11px] text-slate-300">
                      <span class="text-rose-400 shrink-0 font-bold">⚠️</span>
                      <span>Boncos ratusan ribu beli skincare viral tapi hasilnya nihil dan jerawat makin meradang.</span>
                    </div>
                  </div>
                </div>

                <!-- 4. VPC Feature-to-Benefit Matrix -->
                <div class="p-4 sm:p-5 bg-dark-900 border-b border-dark-800 space-y-3">
                  <div class="text-center">
                    <span class="text-[9px] font-bold text-cyan-400 uppercase tracking-wider font-mono">Sintesis VPC</span>
                    <h3 class="text-xs sm:text-sm font-extrabold text-white mt-0.5">Mengapa Formula Ini Bekerja Nyata?</h3>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                    <div class="p-2.5 rounded-xl bg-dark-950 border border-cyan-500/20 space-y-1">
                      <div class="text-xs font-bold text-cyan-300">🔬 Niacinamide 10%</div>
                      <div class="text-[10px] text-slate-300">Menghambat transfer melanin ke permukaan kulit secara ilmiah.</div>
                    </div>
                    <div class="p-2.5 rounded-xl bg-dark-950 border border-cyan-500/20 space-y-1">
                      <div class="text-xs font-bold text-cyan-300">🌿 Tranexamic 3%</div>
                      <div class="text-[10px] text-slate-300">Meredakan mikronutrisi kemerahan tanpa rasa perih atau panas.</div>
                    </div>
                    <div class="p-2.5 rounded-xl bg-dark-950 border border-cyan-500/20 space-y-1">
                      <div class="text-xs font-bold text-cyan-300">💧 Water-Gel Light</div>
                      <div class="text-[10px] text-slate-300">Meresap tuntas dalam 15 detik, tidak lengket saat dipakai tidur.</div>
                    </div>
                  </div>
                </div>

                <!-- 5. Testimonial Social Proof -->
                <div class="p-4 sm:p-5 bg-dark-950 border-b border-dark-800 space-y-3">
                  <div class="text-center">
                    <div class="text-amber-400 text-xs">★★★★★</div>
                    <h3 class="text-xs sm:text-sm font-extrabold text-white mt-0.5">Cerita Nyata Pengguna</h3>
                  </div>
                  <div class="p-3 rounded-xl bg-dark-900 border border-dark-800 text-xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-white text-[11px]">Amanda R. (28 th, Jakarta)</span>
                      <span class="text-[9px] text-emerald-400 font-mono">✓ Verified Buyer</span>
                    </div>
                    <p class="text-slate-300 text-[10px] italic leading-relaxed">
                      "Baru 10 hari rutin pakai noda hitam memudar drastis! Sekarang ke kantor cukup pakai sunscreen aja tanpa dempul tebal. Game changer banget!"
                    </p>
                  </div>
                </div>

                <!-- 6. Irresistible Offer & Packages -->
                <div id="order-box" class="p-4 sm:p-5 bg-dark-900 border-b border-dark-800 space-y-3">
                  <div class="text-center">
                    <span class="text-[9px] font-bold text-copper-400 uppercase tracking-wider font-mono">Penawaran Eksklusif</span>
                    <h3 class="text-xs sm:text-sm font-extrabold text-white mt-0.5">Pilih Paket Transformasi Anda</h3>
                  </div>
                  <div class="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/60 to-dark-950 border-2 border-cyan-400 text-center space-y-2 relative shadow-glow-cyan">
                    <span class="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-copper-500 text-dark-950 text-[9px] font-black uppercase font-mono">
                      PALING LARIS
                    </span>
                    <div class="text-[10px] font-bold text-slate-400 uppercase font-mono">PAKET 2: REKOMENDASI DOKTER</div>
                    <div class="text-sm sm:text-base font-black text-white">BELI 2 GRATIS 1 BOTOL (90 Hari)</div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-xs text-slate-500 line-through">Rp 894.000</span>
                      <span class="text-lg font-black text-cyan-300 font-mono">Rp 269.000</span>
                    </div>
                    <p class="text-[10px] text-emerald-400 font-bold">
                      🎁 Gratis Pouch Waterproof + Subsidi Bebas Ongkir!
                    </p>
                    <button class="w-full py-3 rounded-xl text-xs font-black text-dark-950 bg-gradient-to-r from-emerald-400 to-cyan-300 hover:opacity-95 shadow-glow-cyan font-mono mt-1">
                      PESAN PAKET 2 (BAYAR COD)
                    </button>
                  </div>
                </div>

                <!-- 7. 100% Risk Reversal Guarantee -->
                <div class="p-4 bg-dark-950 border-b border-dark-800 text-center space-y-1.5">
                  <div class="w-8 h-8 mx-auto rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 flex items-center justify-center">
                    <ShieldCheck class="w-4 h-4" />
                  </div>
                  <h4 class="text-xs font-bold text-white">Garansi 30 Hari Uang Kembali 100%</h4>
                  <p class="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Jika dalam 30 hari pemakaian rutin Anda merasa tidak ada perubahan nyata, kirimkan botolnya kembali dan kami kembalikan 100% uang Anda tanpa potongan!
                  </p>
                </div>

                <!-- 8. Interactive FAQ Accordion -->
                <div class="p-4 bg-dark-900 space-y-2">
                  <h4 class="text-xs font-bold text-white text-center mb-2">Pertanyaan Yang Sering Diajukan</h4>
                  <div 
                    v-for="(faq, fIdx) in sampleFaqs" 
                    :key="fIdx"
                    class="rounded-xl bg-dark-950 border border-dark-800 overflow-hidden text-xs"
                  >
                    <button 
                      type="button"
                      @click="toggleFaq(fIdx)"
                      class="w-full p-2.5 text-left font-bold text-slate-200 hover:text-white flex items-center justify-between gap-2"
                    >
                      <span class="text-[11px]">{{ faq.q }}</span>
                      <ChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform" :class="{ 'rotate-180': openFaqIndex === fIdx }" />
                    </button>
                    <div v-show="openFaqIndex === fIdx" class="px-2.5 pb-2.5 text-[10px] text-slate-400 leading-relaxed border-t border-dark-850 pt-1.5">
                      {{ faq.a }}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- 2. REGULAR MARKDOWN / TEXT OUTPUT STREAM -->
            <div v-else-if="currentOutput" class="whitespace-pre-wrap">
              {{ currentOutput }}
              <span v-if="isGenerating" class="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse"></span>
            </div>

            <!-- 3. EMPTY STATE -->
            <div v-else class="h-full min-h-[360px] flex flex-col items-center justify-center text-center text-slate-500 gap-3">
              <div 
                class="w-14 h-14 rounded-2xl bg-dark-850/80 border border-dark-750 flex items-center justify-center"
                :class="activeTool === 'lp-builder' ? 'text-cyan-400' : 'text-purple-400/70'"
              >
                <Sparkles class="w-7 h-7" />
              </div>
              <p class="text-xs text-slate-400 max-w-xs font-medium font-sans">
                {{ emptyStateMessage }}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { generateGeminiDirect } from '../utils/geminiClient';
import { 
  Users, 
  FileText, 
  PenTool, 
  Video, 
  ArrowLeft, 
  Sparkles, 
  Copy,
  LayoutTemplate,
  Smartphone,
  Monitor,
  Download,
  Flame,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  RefreshCw
} from 'lucide-vue-next';

const emit = defineEmits(['save-log']);

// Active tool state: null = Hub Tampilan Awal (Gambar 1), or 'buyer-persona' | 'vpc' | 'hypnowriting' | 'narasi-konten' | 'lp-builder'
const activeTool = ref(null);

// LP Builder UI State
const lpViewMode = ref('preview'); // 'copy' | 'preview'
const previewDevice = ref('mobile'); // 'mobile' | 'desktop'
const openFaqIndex = ref(0);

const toggleFaq = (idx) => {
  openFaqIndex.value = openFaqIndex.value === idx ? null : idx;
};

// Forms state for each tool
const formBuyerPersona = ref({
  productName: '',
  adPlan: 'Instagram & Facebook Ads'
});

const formVpc = ref({
  productName: '',
  adPlan: 'Instagram & Facebook Ads',
  productDescription: ''
});

const formHypnowriting = ref({
  productName: '',
  targetMarket: '',
  languageStyle: 'Santai, Persuasif, Storytelling',
  productType: 'Produk Fisik',
  vpcData: ''
});

const formNarasi = ref({
  productName: '',
  category: '',
  vpcData: '',
  videoDuration: '',
  formula: '',
  hookType: '',
  ctaType: '',
  languageStyles: ['Persuasif (Membujuk)', 'Santai (Casual)'],
  funnelStage: '',
  additionalNotes: ''
});

const formLpBuilder = ref({
  productName: '',
  category: '',
  price: '149000',
  offer: 'Promo Diskon 50% + Garansi 30 Hari Uang Kembali',
  personaData: '',
  vpcData: '',
  hypnowritingData: '',
  hookStrategy: 'Pattern Interrupt (Hentikan Kebiasaan Salah & Bongkar Mitos)',
  targetPlatform: 'Universal (Berdu, OrderOnline, Elementor, WordPress)'
});

// Presence check for data from previous tools
const hasPersonaData = computed(() => {
  return !!(outputs.value['buyer-persona'] || formBuyerPersona.value.productName);
});

const hasVpcData = computed(() => {
  return !!(outputs.value['vpc'] || formVpc.value.productDescription || formHypnowriting.value.vpcData);
});

const hasHypnowritingData = computed(() => {
  return !!(outputs.value['hypnowriting'] || formHypnowriting.value.targetMarket);
});

// Auto-sync data from previously generated tools to LP Builder
const syncFromPreviousTools = () => {
  // Sync Product Name
  if (!formLpBuilder.value.productName) {
    formLpBuilder.value.productName = 
      formBuyerPersona.value.productName || 
      formVpc.value.productName || 
      formHypnowriting.value.productName || 
      formNarasi.value.productName || 
      'Anti-Acne Clarifying Serum 30ml';
  }

  // Sync Category
  if (!formLpBuilder.value.category) {
    formLpBuilder.value.category = formNarasi.value.category || 'Skincare / Perawatan Kulit';
  }

  // Sync Persona
  if (outputs.value['buyer-persona']) {
    formLpBuilder.value.personaData = outputs.value['buyer-persona'];
  } else if (formBuyerPersona.value.productName) {
    formLpBuilder.value.personaData = `Produk: ${formBuyerPersona.value.productName}. Platform: ${formBuyerPersona.value.adPlan || 'Facebook & Instagram'}. Persona: Target pembeli yang mencari solusi cepat, aman dan terbukti.`;
  }

  // Sync VPC
  if (outputs.value['vpc']) {
    formLpBuilder.value.vpcData = outputs.value['vpc'];
  } else if (formVpc.value.productDescription) {
    formLpBuilder.value.vpcData = formVpc.value.productDescription;
  } else if (formHypnowriting.value.vpcData) {
    formLpBuilder.value.vpcData = formHypnowriting.value.vpcData;
  }

  // Sync Hypnowriting
  if (outputs.value['hypnowriting']) {
    formLpBuilder.value.hypnowritingData = outputs.value['hypnowriting'];
  } else if (formHypnowriting.value.targetMarket) {
    formLpBuilder.value.hypnowritingData = `Target Market: ${formHypnowriting.value.targetMarket}. Gaya Bahasa: ${formHypnowriting.value.languageStyle}. Tipe: ${formHypnowriting.value.productType}`;
  }
};

const sampleFaqs = ref([
  {
    q: 'Apakah produk ini sudah resmi terdaftar di BPOM?',
    a: 'Ya, 100% resmi terdaftar di BPOM RI dan tersertifikasi Halal MUI. Nomor registrasi izin edar resmi dicetak jelas di setiap kemasan produk.'
  },
  {
    q: 'Berapa lama estimasi hasil mulai terlihat?',
    a: 'Berdasarkan uji panel pengguna, perubahan awal dan peredaan kemerahan terlihat dalam 48 jam, serta noda hitam memudar signifikan dalam 14 hari pemakaian rutin.'
  },
  {
    q: 'Apakah bisa bayar tunai di tempat (COD)?',
    a: 'Tentu bisa! Anda cukup bayar saat kurir mengantarkan paket langsung ke depan pintu rumah Anda tanpa biaya tambahan.'
  },
  {
    q: 'Bagaimana jika dalam 30 hari saya merasa tidak cocok?',
    a: 'Kami menjamin Garansi 30 Hari 100% Uang Kembali. Hubungi WhatsApp CS kami dan kirimkan botolnya kembali untuk pengembalian dana utuh!'
  }
]);

const languageStyleOptions = [
  'Informatif (Mengedukasi)',
  'Persuasif (Membujuk)',
  'Storytelling (Bercerita)',
  'Antusias (Bersemangat)',
  'Santai (Casual)',
  'Profesional (Formal)',
  'Empati (Memahami)',
  'Urgent (Mendesak)'
];

const toggleLanguageStyle = (style) => {
  const index = formNarasi.value.languageStyles.indexOf(style);
  if (index > -1) {
    formNarasi.value.languageStyles.splice(index, 1);
  } else {
    formNarasi.value.languageStyles.push(style);
  }
};

// Outputs state keyed by tool
const outputs = ref({
  'buyer-persona': '',
  'vpc': '',
  'hypnowriting': '',
  'narasi-konten': '',
  'lp-builder': ''
});

const isGenerating = ref(false);
const savedStatus = ref(false);
const copyButtonText = ref('Salin');
const streamContainerRef = ref(null);

const selectTool = (toolKey) => {
  activeTool.value = toolKey;
  savedStatus.value = false;
  copyButtonText.value = 'Salin';
  if (toolKey === 'lp-builder') {
    syncFromPreviousTools();
  }
};

const backToHub = () => {
  activeTool.value = null;
};

const activeToolTitle = computed(() => {
  switch (activeTool.value) {
    case 'buyer-persona': return 'Buyer Persona';
    case 'vpc': return 'Value Proposition Canvas';
    case 'hypnowriting': return 'Hypnowriting';
    case 'narasi-konten': return 'Narasi Konten';
    case 'lp-builder': return 'Landing Page Builder';
    default: return 'Content Studio';
  }
});

const activeToolIcon = computed(() => {
  switch (activeTool.value) {
    case 'buyer-persona': return Users;
    case 'vpc': return FileText;
    case 'hypnowriting': return PenTool;
    case 'narasi-konten': return Video;
    case 'lp-builder': return LayoutTemplate;
    default: return Sparkles;
  }
});

const emptyStateMessage = computed(() => {
  if (activeTool.value === 'lp-builder') {
    return 'Isi parameter atau klik "Tarik Data Riset", lalu klik Generate untuk membangun landing page berkonversi tinggi dengan hook mematikan';
  }
  if (activeTool.value === 'narasi-konten') {
    return 'Isi semua field dan klik Generate untuk membuat prompt narasi konten';
  }
  if (activeTool.value === 'hypnowriting') {
    return 'Isi semua field dan klik Generate untuk membuat prompt';
  }
  return 'Isi form dan klik Generate untuk membuat prompt';
});

const currentOutput = computed(() => {
  return activeTool.value ? outputs.value[activeTool.value] : '';
});

// Run Streaming generation via Gemini Edge Endpoint
const runGenerateStream = async () => {
  if (isGenerating.value || !activeTool.value) return;

  const toolKey = activeTool.value;
  isGenerating.value = true;
  outputs.value[toolKey] = '';
  savedStatus.value = false;
  copyButtonText.value = 'Salin';

  let payload = { toolType: toolKey };

  if (toolKey === 'buyer-persona') {
    payload = { ...payload, ...formBuyerPersona.value };
  } else if (toolKey === 'vpc') {
    payload = { ...payload, ...formVpc.value };
  } else if (toolKey === 'hypnowriting') {
    payload = { ...payload, ...formHypnowriting.value };
  } else if (toolKey === 'narasi-konten') {
    payload = { ...payload, ...formNarasi.value };
  } else if (toolKey === 'lp-builder') {
    payload = { ...payload, ...formLpBuilder.value };
  }

    let streamWorked = false;
  try {
    const response = await fetch('/api/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        outputs.value[toolKey] += chunk;

        if (streamContainerRef.value) {
          streamContainerRef.value.scrollTop = streamContainerRef.value.scrollHeight;
        }
      }
      streamWorked = true;
    }
  } catch (err) {
    console.warn('Serverless endpoint unavailable, trying direct client fallback:', err);
  }

  // Client-side fallback if serverless /api/generate-copy returned 404 or failed
  if (!streamWorked) {
    const savedKey = localStorage.getItem('metasync_gemini_key') || '';
    if (savedKey) {
      try {
        await generateGeminiDirect(payload, savedKey, (chunk) => {
          outputs.value[toolKey] += chunk;
          if (streamContainerRef.value) {
            streamContainerRef.value.scrollTop = streamContainerRef.value.scrollHeight;
          }
        });
        streamWorked = true;
      } catch (directErr) {
        outputs.value[toolKey] += `\n\n[Gagal terhubung ke Gemini: ${directErr.message}. Periksa API Key di menu Settings]`;
      }
    } else {
      outputs.value[toolKey] += "\n\n[Google Gemini API Key belum dimasukkan. Buka menu Settings (Integrasi) untuk memasukkan API Key Anda]";
    }
  }

  if (streamWorked) {
    savedStatus.value = true;
    emit('save-log', {
      prompt_context: payload,
      generated_text: outputs.value[toolKey],
      framework: activeToolTitle.value
    });
  }
  isGenerating.value = false;
};

const copyOutput = async () => {
  if (!currentOutput.value) return;
  try {
    await navigator.clipboard.writeText(currentOutput.value);
    copyButtonText.value = 'Tersalin!';
    setTimeout(() => {
      copyButtonText.value = 'Salin';
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }
};

// Generate Standalone Autonomous HTML Document for LP Builder
const generateStandaloneHtml = () => {
  const pName = formLpBuilder.value.productName || 'Anti-Acne Clarifying Serum 30ml';
  const priceVal = formLpBuilder.value.price ? `Rp ${Number(formLpBuilder.value.price).toLocaleString('id-ID')}` : 'Rp 149.000';
  
  const tailwindScript = '<' + 'script src="https://cdn.tailwindcss.com"><' + '/script>';
  
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pName} - Landing Page Resmi Berkonversi Tinggi</title>
  ${tailwindScript}
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .shadow-glow { box-shadow: 0 0 35px rgba(34, 211, 238, 0.25); }
    .shadow-pulse { box-shadow: 0 0 25px rgba(16, 185, 129, 0.35); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">

  <!-- 1. Top Urgency Ticker -->
  <div class="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white text-xs font-black py-2.5 px-4 text-center tracking-wider sticky top-0 z-50 shadow-lg">
    ⚡ FLASH SALE: Subsidi Bebas Ongkir Seluruh Indonesia + Diskon Spesial 50% Khusus 19 Paket Terakhir!
  </div>

  <main class="max-w-xl mx-auto px-4 py-8 space-y-8">
    
    <!-- 2. Hero Section (Above The Fold) -->
    <header class="text-center space-y-4">
      <div class="inline-block px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono">
        Khusus Anda yang Lelah Gonta-Ganti Skincare Bekas Jerawat...
      </div>
      <h1 class="text-2xl sm:text-3xl font-black text-white leading-tight">
        Hentikan Kebiasaan "Mendempul" Bekas Jerawat dengan Bedak Tebal!
      </h1>
      <p class="text-sm text-slate-300 leading-relaxed">
        Pudarkan hingga 80% noda hitam membandel dalam 14 hari dengan penetrasi ganda Niacinamide 10% + Tranexamic 3% langsung ke sumber melanin tanpa perih dan tanpa ketergantungan.
      </p>

      <!-- Mockup Card -->
      <div class="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-glow text-center space-y-3">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-3xl">
          ✨
        </div>
        <h2 class="text-lg font-black text-white">${pName}</h2>
        <div class="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
          <span class="px-2.5 py-1 bg-emerald-950/80 rounded border border-emerald-500/40">✓ Resmi BPOM RI</span>
          <span class="px-2.5 py-1 bg-emerald-950/80 rounded border border-emerald-500/40">✓ Halal MUI</span>
        </div>
      </div>

      <!-- Main Pulsing CTA Button -->
      <a href="#order-form" class="block w-full py-4 px-6 rounded-2xl font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-cyan-300 to-amber-400 hover:opacity-95 shadow-pulse text-center text-sm font-mono tracking-wider transition-transform hover:scale-105">
        👉 YA! SAYA MAU KULIT BERSIH (AMBIL DISKON 50%)
      </a>
      <div class="flex justify-center gap-3 text-xs text-slate-400 font-mono">
        <span>🛡️ Garansi 30 Hari</span>
        <span>•</span>
        <span>🚚 Kirim Hari Ini</span>
        <span>•</span>
        <span>💵 Bayar di Tempat (COD)</span>
      </div>
    </header>

    <!-- 3. Pain Agitation Section -->
    <section class="p-5 rounded-3xl bg-slate-900 border border-rose-500/30 space-y-3">
      <h3 class="text-center font-bold text-rose-400 uppercase tracking-wider text-xs">Pernahkah Anda Mengalami Ini?</h3>
      <div class="space-y-2 text-xs text-slate-300">
        <div class="p-3 bg-slate-950 rounded-xl border border-rose-500/20">⚠️ Menghabiskan 30 menit tiap pagi menutupi noda hitam pakai concealer tebal.</div>
        <div class="p-3 bg-slate-950 rounded-xl border border-rose-500/20">⚠️ Minder dan refleks memalingkan wajah saat diajak bicara tatap muka jarak dekat.</div>
        <div class="p-3 bg-slate-950 rounded-xl border border-rose-500/20">⚠️ Boncos ratusan ribu beli skincare viral tapi hasilnya nihil dan jerawat makin meradang.</div>
      </div>
    </section>

    <!-- 4. VPC Feature-to-Benefit Section -->
    <section class="p-5 rounded-3xl bg-slate-900 border border-cyan-500/30 space-y-3">
      <h3 class="text-center font-bold text-cyan-400 uppercase tracking-wider text-xs">Mengapa Formula Ini Berbeda?</h3>
      <div class="space-y-2.5">
        <div class="p-3 bg-slate-950 rounded-xl border border-cyan-500/20 text-xs">
          <strong class="text-cyan-300 block mb-0.5">🔬 Niacinamide 10% Pharmaceutical Grade</strong>
          <span class="text-slate-300">Menghambat transfer melanin ke permukaan kulit secara klinis teruji.</span>
        </div>
        <div class="p-3 bg-slate-950 rounded-xl border border-cyan-500/20 text-xs">
          <strong class="text-cyan-300 block mb-0.5">🌿 Tranexamic Acid 3% Nano-Penetration</strong>
          <span class="text-slate-300">Meredakan peradangan dan hiperpigmentasi tanpa rasa perih atau panas.</span>
        </div>
      </div>
    </section>

    <!-- 5. Pricing & Offer Box -->
    <section id="order-form" class="p-6 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-slate-900 border-2 border-cyan-400 shadow-glow text-center space-y-3">
      <span class="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase font-mono">
        PAKET PALING LARIS
      </span>
      <h3 class="text-xl font-black text-white">BELI 2 GRATIS 1 BOTOL (90 Hari)</h3>
      <div class="flex items-center justify-center gap-3">
        <span class="text-sm text-slate-500 line-through">Rp 894.000</span>
        <span class="text-2xl font-black text-cyan-300 font-mono">Rp 269.000</span>
      </div>
      <p class="text-xs text-emerald-400 font-bold">🎁 Gratis Pouch Waterproof + Subsidi Ongkir Seluruh Indonesia!</p>
      
      <!-- Quick Order Form -->
      <form class="space-y-3 pt-3 text-left">
        <input type="text" placeholder="Nama Lengkap Anda" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400" required>
        <input type="tel" placeholder="Nomor WhatsApp (Aktif)" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400" required>
        <textarea rows="2" placeholder="Alamat Pengiriman Lengkap (Kecamatan & Kota)" class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400" required></textarea>
        <button type="submit" class="w-full py-4 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-300 hover:opacity-95 shadow-glow font-mono tracking-wider">
          KIRIM PESANAN SEKARANG (BAYAR COD)
        </button>
      </form>
    </section>

    <!-- 6. Guarantee Seal -->
    <footer class="text-center p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-2 text-xs text-slate-400">
      <div class="text-2xl">🛡️</div>
      <h4 class="font-bold text-white text-sm">Garansi 30 Hari 100% Uang Kembali</h4>
      <p class="leading-relaxed">Jika dalam 30 hari pemakaian rutin Anda merasa produk ini tidak memberikan hasil positif, hubungi CS kami dan kami kembalikan 100% uang Anda tanpa potongan!</p>
      <div class="pt-4 text-[10px] text-slate-600 font-mono">
        © 2026 ${pName}. All rights reserved. Powered by MetaSync FatherLab.
      </div>
    </footer>

  </main>
</body>
</html>`;
};

const downloadLpHtml = () => {
  const htmlContent = generateStandaloneHtml();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = (formLpBuilder.value.productName || 'landingpage').toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `${fileName}_hook_mematikan.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const copyLpHtml = async () => {
  const htmlContent = generateStandaloneHtml();
  try {
    await navigator.clipboard.writeText(htmlContent);
    copyButtonText.value = 'HTML Tersalin!';
    setTimeout(() => {
      copyButtonText.value = 'Salin';
    }, 2000);
  } catch (err) {
    console.error('HTML copy failed:', err);
  }
};
</script>
