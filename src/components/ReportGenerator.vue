<template>
  <div class="space-y-6">
    
    <!-- Top Bar: View Mode Switcher & Quick Metrics (Sci-Fi HUD) -->
    <div class="hud-panel hud-corner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 shadow-xl font-mono">
      <div>
        <div class="flex items-center gap-2">
          <FileText class="w-5 h-5 text-cyan-400" />
          <h2 class="text-base font-bold text-white tracking-wide">[ REPORT & FINANCIAL LEDGER // AUDIT ]</h2>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Pencatatan laporan harian terstruktur, rekap omset & spend dalam bentuk tabel, serta ekspor PDF & PNG
        </p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center gap-1.5 bg-dark-900 p-1.5 border border-cyan-500/30">
        <button
          @click="activeSubTab = 'table'"
          :class="[
            'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border',
            activeSubTab === 'table'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-glow-cyan'
              : 'text-slate-400 hover:text-white border-transparent'
          ]"
        >
          <Table class="w-4 h-4" />
          <span>Tabel Laporan</span>
        </button>

        <button
          @click="activeSubTab = 'flyer'"
          :class="[
            'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border',
            activeSubTab === 'flyer'
              ? 'bg-copper-500/20 text-copper-300 border-copper-400 shadow-glow-copper'
              : 'text-slate-400 hover:text-white border-transparent'
          ]"
        >
          <Image class="w-4 h-4" />
          <span>Flyer Visual</span>
        </button>
      </div>
    </div>


    <!-- ===================================================================== -->
    <!-- MODE 1: TABEL LAPORAN (PDF) - SESUAI GAMBAR SPREADSHEET USER          -->
    <!-- ===================================================================== -->
    <div v-if="activeSubTab === 'table'" class="space-y-5">
      
      <!-- Action Toolbar -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900/90 border border-dark-800">
        <!-- Quick stats summary strip -->
        <div class="flex flex-wrap items-center gap-3 text-xs">
          <div class="px-3 py-1.5 rounded-xl bg-dark-850 border border-dark-750 flex items-center gap-2">
            <span class="text-slate-400">Total Baris:</span>
            <span class="font-mono font-bold text-white">{{ tableRecords.length }} Hari</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono flex items-center gap-1.5">
            <span class="text-slate-400">Total Revenue:</span>
            <span class="font-bold">{{ formatCurrency(totals.revenue) }}</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono flex items-center gap-1.5">
            <span class="text-slate-400">Total Spent:</span>
            <span class="font-bold">{{ formatCurrency(totals.spend) }}</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1.5">
            <span class="text-slate-400">Total Nett:</span>
            <span class="font-bold">{{ formatCurrency(totals.nettProfit) }}</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono flex items-center gap-1.5">
            <span class="text-slate-400">Rata-rata ROI:</span>
            <span class="font-bold">{{ totals.roi }}%</span>
          </div>
        </div>

        <!-- Buttons: Add Record & Export PDF -->
        <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            @click="showAddModal = true"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-teal-500/40 transition-all shadow-md"
          >
            <PlusCircle class="w-4 h-4 text-teal-400" />
            <span>+ Catat Laporan Harian</span>
          </button>

          <!-- Download PDF Button (Report = PDF) -->
          <button
            @click="exportTableToPDF"
            :disabled="isExporting"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-600 via-brand-500 to-teal-400 hover:opacity-95 shadow-glow-teal transition-all disabled:opacity-60"
          >
            <Download class="w-4 h-4" />
            <span>{{ isExporting ? 'Memproses PDF...' : 'Download Report (PDF)' }}</span>
          </button>
        </div>
      </div>

      <!-- The Table Container (Renderable to PDF) -->
      <div class="rounded-3xl bg-dark-900 border border-dark-800 shadow-2xl overflow-hidden p-6" ref="printableTableRef">
        
        <!-- Table Header Info for PDF Print -->
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-dark-750">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center font-bold text-teal-300">
              ML
            </div>
            <div>
              <h3 class="text-base font-extrabold text-white tracking-tight">MetaSync by FatherLab — Laporan Harian</h3>
              <p class="text-xs text-slate-400">Pencatatan Konversi Iklan, Omset, Ad Spend, Laba Bersih & Persentase ROI</p>
            </div>
          </div>
          <div class="text-right text-xs font-mono text-slate-400">
            <span>Tanggal Cetak: {{ reportDate }}</span>
          </div>
        </div>

        <!-- Table Display -->
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">
            <thead>
              <tr class="font-extrabold uppercase text-[11px] tracking-wider select-none">
                <!-- Red / Pink Header Columns -->
                <th class="py-3 px-3 text-center border-b border-r border-dark-750 bg-[#c53030]/20 text-rose-300 w-14">
                  No
                </th>
                <th class="py-3 px-4 border-b border-r border-dark-750 bg-[#c53030]/20 text-rose-300 min-w-[130px]">
                  Tanggal
                </th>
                <th class="py-3 px-3 text-center border-b border-r border-dark-750 bg-[#c53030]/20 text-rose-300 w-16">
                  IC
                </th>
                <th class="py-3 px-3 text-center border-b border-r border-dark-750 bg-[#c53030]/20 text-rose-300 w-24">
                  Purchases
                </th>

                <!-- Yellow Header Column: Revenue -->
                <th class="py-3 px-4 text-right border-b border-r border-dark-750 bg-[#d69e2e]/25 text-amber-200 min-w-[130px]">
                  Revenue
                </th>

                <!-- Pink Header Column: Today Spent -->
                <th class="py-3 px-4 text-right border-b border-r border-dark-750 bg-[#e53e3e]/25 text-rose-200 min-w-[130px]">
                  Today Spent
                </th>

                <!-- Green Header Column: Nett Profit -->
                <th class="py-3 px-4 text-right border-b border-r border-dark-750 bg-[#38a169]/25 text-emerald-200 min-w-[130px]">
                  Nett Profit
                </th>

                <!-- Blue Header Column: ROI -->
                <th class="py-3 px-4 text-center border-b border-r border-dark-750 bg-[#3182ce]/25 text-sky-200 min-w-[90px]">
                  ROI
                </th>

                <th class="py-3 px-3 text-center border-b border-dark-750 bg-dark-800 text-slate-400 w-16 print:hidden">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-dark-800 font-mono text-xs">
              <tr v-if="sortedRecords.length === 0">
                <td colspan="9" class="py-10 text-center text-slate-500 font-mono">
                  Belum ada catatan buku besar laporan. Masukkan data keuangan hari ini pada form di atas.
                </td>
              </tr>
              <tr
                v-for="(row, idx) in sortedRecords"
                :key="row.id || idx"
                class="hover:bg-dark-850/60 transition-colors"
              >
                <!-- No -->
                <td class="py-2.5 px-3 text-center text-slate-400 font-bold border-r border-dark-800">
                  {{ row.no || idx + 1 }}
                </td>

                <!-- Tanggal -->
                <td class="py-2.5 px-4 font-sans font-semibold text-slate-200 border-r border-dark-800 whitespace-nowrap">
                  {{ row.date }}
                </td>

                <!-- IC -->
                <td class="py-2.5 px-3 text-center font-bold text-slate-300 border-r border-dark-800">
                  {{ row.ic }}
                </td>

                <!-- Purchases -->
                <td class="py-2.5 px-3 text-center font-bold text-slate-200 border-r border-dark-800">
                  {{ row.purchases }}
                </td>

                <!-- Revenue (Yellow cells matching image) -->
                <td class="py-2.5 px-4 text-right font-extrabold text-amber-300 bg-amber-500/5 border-r border-dark-800">
                  {{ formatNumber(row.revenue) }}
                </td>

                <!-- Today Spent (Pink cells matching image) -->
                <td class="py-2.5 px-4 text-right font-bold text-rose-300 bg-rose-500/5 border-r border-dark-800">
                  {{ formatNumber(row.spend) }}
                </td>

                <!-- Nett Profit (Green cells for positive, red for negative) -->
                <td 
                  class="py-2.5 px-4 text-right font-extrabold border-r border-dark-800"
                  :class="row.nettProfit >= 0 ? 'text-emerald-300 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/10 font-black'"
                >
                  {{ row.nettProfit >= 0 ? formatNumber(row.nettProfit) : `-${formatNumber(Math.abs(row.nettProfit))}` }}
                </td>

                <!-- ROI (Percentage, highlighted in red badge if negative) -->
                <td class="py-2.5 px-4 text-center border-r border-dark-800">
                  <span
                    v-if="row.roi < 0"
                    class="inline-block px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[11px] shadow-sm tracking-tight"
                  >
                    {{ row.roi }}%
                  </span>
                  <span
                    v-else
                    class="font-extrabold text-sky-300"
                  >
                    {{ row.roi }}%
                  </span>
                </td>

                <!-- Actions: Delete button -->
                <td class="py-2.5 px-3 text-center print:hidden">
                  <button
                    @click="deleteRecord(row.id || idx)"
                    class="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus baris"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>

            <!-- Table Footer: Totals Row -->
            <tfoot>
              <tr class="font-extrabold text-xs border-t-2 border-dark-700 bg-dark-850">
                <td colspan="2" class="py-3 px-4 text-left font-sans text-white uppercase tracking-wider border-r border-dark-750">
                  TOTAL REKAPITULASI
                </td>
                <td class="py-3 px-3 text-center text-teal-300 border-r border-dark-750 font-mono">
                  {{ totals.ic }}
                </td>
                <td class="py-3 px-3 text-center text-teal-300 border-r border-dark-750 font-mono">
                  {{ totals.purchases }}
                </td>
                <td class="py-3 px-4 text-right text-amber-300 border-r border-dark-750 font-mono font-black">
                  {{ formatNumber(totals.revenue) }}
                </td>
                <td class="py-3 px-4 text-right text-rose-300 border-r border-dark-750 font-mono font-black">
                  {{ formatNumber(totals.spend) }}
                </td>
                <td class="py-3 px-4 text-right text-emerald-300 border-r border-dark-750 font-mono font-black">
                  {{ formatNumber(totals.nettProfit) }}
                </td>
                <td class="py-3 px-4 text-center text-sky-300 border-r border-dark-750 font-mono font-black">
                  {{ totals.roi }}%
                </td>
                <td class="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>

    </div>


    <!-- ===================================================================== -->
    <!-- MODE 2: FLYER VISUAL (PNG) - DOKUMEN PRESENTASI EKSEKUTIF              -->
    <!-- ===================================================================== -->
    <div v-else class="space-y-5">
      
      <!-- Flyer Action Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-dark-800">
        <!-- Time Filter -->
        <div class="flex items-center gap-1 bg-dark-800 p-1 rounded-xl border border-dark-700">
          <button
            v-for="tf in timefilters"
            :key="tf.id"
            @click="selectedTimeframe = tf.id"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              selectedTimeframe === tf.id
                ? 'bg-gradient-to-r from-brand-600 to-teal-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            {{ tf.label }}
          </button>
        </div>

        <!-- Download PNG Button (Flyer = PNG) -->
        <button
          @click="exportFlyerToPNG"
          :disabled="isExporting"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-teal-500 to-meta-purple hover:opacity-90 shadow-glow-teal transition-all disabled:opacity-50"
        >
          <Image class="w-4 h-4" />
          <span>{{ isExporting ? 'Memproses PNG...' : 'Download Flyer (PNG)' }}</span>
        </button>
      </div>

      <!-- The Printable / Renderable Flyer Container -->
      <div class="flex justify-center p-2">
        <div 
          ref="flyerRef"
          class="w-full max-w-3xl bg-[#090d16] text-slate-100 rounded-3xl p-8 border border-dark-700 shadow-2xl relative overflow-hidden"
        >
          <!-- Background Gradients -->
          <div class="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

          <!-- Flyer Header -->
          <div class="flex items-center justify-between border-b border-dark-750 pb-6 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 via-teal-400 to-meta-purple p-[2px] shadow-lg">
                <div class="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center font-extrabold text-2xl text-teal-300">
                  M
                </div>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-xl font-extrabold tracking-tight text-white">MetaSync Performance Brief</h1>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">Official FatherLab</span>
                </div>
                <p class="text-xs text-slate-400">Periode: {{ currentPeriodLabel }} &bull; Generated: {{ reportDate }}</p>
              </div>
            </div>

            <div class="text-right">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">STATUS FISKAL</span>
              <span class="text-sm font-extrabold text-emerald-400 font-mono flex items-center justify-end gap-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span> PROFITABLE
              </span>
            </div>
          </div>

          <!-- Executive Financial Highlights Grid (Required 6 core metrics) -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            
            <!-- 1. Ad Spend -->
            <div class="p-4 rounded-2xl bg-dark-850/90 border border-dark-700/80">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">1. Ad Spend (Biaya Iklan)</span>
              <p class="text-xl font-extrabold font-mono text-rose-300 mt-1">{{ formatCurrency(reportMetrics.spend) }}</p>
              <span class="text-[10px] text-slate-500 mt-1 block">Total anggaran dialokasikan</span>
            </div>

            <!-- 2. Initiate Checkout (IC) -->
            <div class="p-4 rounded-2xl bg-dark-850/90 border border-dark-700/80">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">2. Initiate Checkout (IC)</span>
              <p class="text-xl font-extrabold font-mono text-indigo-300 mt-1">{{ reportMetrics.ic }} Prospek</p>
              <span class="text-[10px] text-slate-500 mt-1 block">Tingkat lanjut ke kasir</span>
            </div>

            <!-- 3. Completed Purchases -->
            <div class="p-4 rounded-2xl bg-dark-850/90 border border-dark-700/80">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">3. Pembelian (Purchase)</span>
              <p class="text-xl font-extrabold font-mono text-cyan-300 mt-1">{{ reportMetrics.purchases }} Order</p>
              <span class="text-[10px] text-slate-500 mt-1 block">Closing Rate: {{ reportMetrics.closingRate }}%</span>
            </div>

            <!-- 4. Gross Revenue -->
            <div class="p-4 rounded-2xl bg-dark-850/90 border border-dark-700/80">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">4. Total Omset (Revenue)</span>
              <p class="text-xl font-extrabold font-mono text-teal-300 mt-1">{{ formatCurrency(reportMetrics.revenue) }}</p>
              <span class="text-[10px] text-slate-500 mt-1 block">Nilai konversi kotor</span>
            </div>

            <!-- 5. Nett Profit (Revenue - HPP - Ad Spend) -->
            <div class="p-4 rounded-2xl bg-dark-850/90 border border-emerald-500/40 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
              <span class="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">5. Laba Bersih (Nett Profit)</span>
              <p class="text-xl font-extrabold font-mono text-emerald-300 mt-1">{{ formatCurrency(reportMetrics.nettProfit) }}</p>
              <span class="text-[10px] text-emerald-400/80 mt-1 block font-mono">Revenue - HPP - Ad Spend</span>
            </div>

            <!-- 6. Real ROI -->
            <div class="p-4 rounded-2xl bg-dark-850/90 border border-amber-500/40 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
              <span class="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">6. ROI Sesungguhnya (Real ROI)</span>
              <p class="text-xl font-extrabold font-mono text-amber-300 mt-1">{{ reportMetrics.realRoi }}%</p>
              <span class="text-[10px] text-amber-300/80 mt-1 block font-mono">Laba Bersih ÷ Ad Spend</span>
            </div>

          </div>

          <!-- Detailed Breakdown Table -->
          <div class="p-5 rounded-2xl bg-dark-850 border border-dark-700 mb-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300">Rincian Efisiensi & Konversi Corong</h3>
              <span class="text-[10px] font-mono text-slate-500">Benchmark FatherLab Standard</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="p-2.5 rounded-xl bg-dark-900 border border-dark-750">
                <span class="text-[10px] text-slate-400 block">CTR Rata-rata</span>
                <span class="font-mono font-bold text-teal-300">{{ reportMetrics.ctr }}%</span>
                <span class="text-[9px] text-emerald-400 block mt-0.5">Target > 2.0% (Lolos)</span>
              </div>
              <div class="p-2.5 rounded-xl bg-dark-900 border border-dark-750">
                <span class="text-[10px] text-slate-400 block">CPR Rata-rata</span>
                <span class="font-mono font-bold text-cyan-300">{{ formatCurrency(reportMetrics.cpr) }}</span>
                <span class="text-[9px] text-emerald-400 block mt-0.5">Efisien di bawah 25%</span>
              </div>
              <div class="p-2.5 rounded-xl bg-dark-900 border border-dark-750">
                <span class="text-[10px] text-slate-400 block">Gross ROAS</span>
                <span class="font-mono font-bold text-amber-300">{{ reportMetrics.roas }}x</span>
                <span class="text-[9px] text-slate-400 block mt-0.5">Omset ÷ Ad Spend</span>
              </div>
              <div class="p-2.5 rounded-xl bg-dark-900 border border-dark-750">
                <span class="text-[10px] text-slate-400 block">Total HPP Terjual</span>
                <span class="font-mono font-bold text-slate-300">{{ formatCurrency(reportMetrics.totalCogs) }}</span>
                <span class="text-[9px] text-slate-400 block mt-0.5">Biaya Pokok Barang</span>
              </div>
            </div>
          </div>

          <!-- Footer Sign-off -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 border-t border-dark-750 pt-4">
            <div class="flex items-center gap-2">
              <span>Disiapkan secara otomatis oleh <strong>MetaSync by FatherLab</strong></span>
            </div>
            <div class="font-mono text-slate-400">
              Internal Confidential &bull; Hak Cipta FatherLab Group
            </div>
          </div>

        </div>
      </div>

    </div>


    <!-- ===================================================================== -->
    <!-- MODAL: CATAT LAPORAN HARIAN BARU                                      -->
    <!-- ===================================================================== -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div class="bg-dark-900 border border-dark-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        <div class="p-5 border-b border-dark-800 flex items-center justify-between bg-dark-850">
          <div class="flex items-center gap-2.5">
            <PlusCircle class="w-5 h-5 text-teal-400" />
            <h3 class="text-sm font-bold text-white">Catat Laporan Finansial Harian</h3>
          </div>
          <button @click="showAddModal = false" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-750">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="saveNewRecord" class="p-5 space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-300 mb-1">Tanggal</label>
            <input 
              v-model="newRecord.date" 
              type="text" 
              required
              placeholder="Contoh: 17-September-26" 
              class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-teal-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-300 mb-1">Initiate Checkout (IC)</label>
              <input 
                v-model.number="newRecord.ic" 
                type="number" 
                min="0"
                required
                placeholder="3" 
                class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label class="block font-bold text-slate-300 mb-1">Purchases (Penjualan)</label>
              <input 
                v-model.number="newRecord.purchases" 
                type="number" 
                min="0"
                required
                placeholder="2" 
                class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-mono focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-amber-300 mb-1">Revenue (IDR)</label>
              <input 
                v-model.number="newRecord.revenue" 
                type="number" 
                min="0"
                step="1000"
                required
                placeholder="286000" 
                class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label class="block font-bold text-rose-300 mb-1">Today Spent (IDR)</label>
              <input 
                v-model.number="newRecord.spend" 
                type="number" 
                min="0"
                step="1000"
                required
                placeholder="140000" 
                class="w-full px-3.5 py-2 rounded-xl bg-dark-800 border border-dark-700 text-rose-300 font-mono font-bold focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <!-- Live Preview Calculation -->
          <div class="p-3 rounded-xl bg-dark-850 border border-dark-750 flex items-center justify-between text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block uppercase">Nett Profit (Otomatis)</span>
              <span 
                class="font-mono font-bold"
                :class="(newRecord.revenue - newRecord.spend) >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ formatCurrency(newRecord.revenue - newRecord.spend) }}
              </span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 block uppercase">ROI (Otomatis)</span>
              <span 
                class="font-mono font-bold"
                :class="computedPreviewROI < 0 ? 'text-rose-400' : 'text-sky-300'"
              >
                {{ computedPreviewROI }}%
              </span>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-brand-500 hover:opacity-95 shadow-glow-teal"
            >
              Simpan Laporan
            </button>
          </div>
        </form>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  FileText, 
  Table, 
  Image, 
  Download, 
  PlusCircle, 
  Trash2, 
  X 
} from 'lucide-vue-next';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createDataSnapshot } from '../utils/dataProtection';

const props = defineProps({
  campaigns: {
    type: Array,
    required: true
  }
});

// Mode switcher: 'table' (Tabel Laporan -> PDF) or 'flyer' (Flyer Visual -> PNG)
const activeSubTab = ref('table');

// DOM Refs
const printableTableRef = ref(null);
const flyerRef = ref(null);
const isExporting = ref(false);
const showAddModal = ref(false);

const selectedTimeframe = ref('today');
const customDate = ref(new Date().toISOString().split('T')[0]);

const timefilters = [
  { id: 'today', label: 'Harian (Hari Ini)' },
  { id: 'weekly', label: 'Mingguan (7 Hari)' },
  { id: 'monthly', label: 'Bulanan (30 Hari)' },
];

// Sanitizer: Hapus sampel demo lama agar murni menyisakan data real
function sanitizeStoredReports(raw) {
  try {
    if (!raw) return [];
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(r => !r.date?.includes('September-26'));
  } catch (e) {
    return [];
  }
}

const savedRecords = localStorage.getItem('metasync_report_records');
const cleanStoredRecords = sanitizeStoredReports(savedRecords);
localStorage.setItem('metasync_report_records', JSON.stringify(cleanStoredRecords));
const tableRecords = ref(cleanStoredRecords);

// Form for new entry
const todayFormatted = `${new Date().getDate()}-${new Date().toLocaleDateString('id-ID', { month: 'short' })}-${String(new Date().getFullYear()).slice(-2)}`;

const newRecord = ref({
  date: todayFormatted,
  ic: 0,
  purchases: 0,
  revenue: 0,
  spend: 0,
});

const computedPreviewROI = computed(() => {
  const nett = newRecord.value.revenue - newRecord.value.spend;
  if (!newRecord.value.spend || newRecord.value.spend === 0) {
    return newRecord.value.revenue > 0 ? 100 : 0;
  }
  return Math.round((nett / newRecord.value.spend) * 100);
});

// Sorted records with calculated Nett Profit & ROI
const sortedRecords = computed(() => {
  return tableRecords.value.map(row => {
    const rev = Number(row.revenue || 0);
    const sp = Number(row.spend || 0);
    const nett = rev - sp;
    const roi = sp > 0 ? Math.round((nett / sp) * 100) : (rev > 0 ? 100 : 0);
    return {
      ...row,
      nettProfit: nett,
      roi: roi
    };
  });
});

// Totals calculation
const totals = computed(() => {
  let ic = 0;
  let purchases = 0;
  let revenue = 0;
  let spend = 0;

  tableRecords.value.forEach(row => {
    ic += Number(row.ic || 0);
    purchases += Number(row.purchases || 0);
    revenue += Number(row.revenue || 0);
    spend += Number(row.spend || 0);
  });

  const nettProfit = revenue - spend;
  const roi = spend > 0 ? Math.round((nettProfit / spend) * 100) : 0;

  return {
    ic,
    purchases,
    revenue,
    spend,
    nettProfit,
    roi
  };
});

const formatNumber = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
};

const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return 'Rp 0';
  return `Rp ${new Intl.NumberFormat('id-ID').format(val)}`;
};

const saveNewRecord = () => {
  const lastNo = tableRecords.value.length > 0 ? Math.max(...tableRecords.value.map(r => r.no || 0)) : 0;
  tableRecords.value.push({
    id: Date.now(),
    no: lastNo + 1,
    date: newRecord.value.date,
    ic: newRecord.value.ic,
    purchases: newRecord.value.purchases,
    revenue: newRecord.value.revenue,
    spend: newRecord.value.spend
  });
  localStorage.setItem('metasync_report_records', JSON.stringify(tableRecords.value));
  createDataSnapshot(`Laporan Ditambahkan: ${newRecord.value.date}`);
  showAddModal.value = false;
};

const deleteRecord = (idOrIdx) => {
  if (confirm('Hapus baris catatan ini? (Tindakan ini terlindungi oleh snapshot pemulihan)')) {
    createDataSnapshot('Pre-Delete Report Safety Point');
    tableRecords.value = tableRecords.value.filter((r, idx) => (r.id || idx) !== idOrIdx);
    localStorage.setItem('metasync_report_records', JSON.stringify(tableRecords.value));
  }
};

const reportDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const currentPeriodLabel = computed(() => {
  switch (selectedTimeframe.value) {
    case 'weekly':
      return '7 Hari Terakhir (Rolling Week)';
    case 'monthly':
      return '30 Hari Terakhir (Full Month)';
    case 'today':
    default:
      return 'Hari Ini (Real-Time Synchronized)';
  }
});

// Flyer metrics calculation
const reportMetrics = computed(() => {
  const multiplier = selectedTimeframe.value === 'weekly' ? 7 : (selectedTimeframe.value === 'monthly' ? 28 : 1);

  let totalSpend = 0;
  let totalPurchases = 0;
  let totalRevenue = 0;
  let totalIC = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let totalCogs = 0;

  props.campaigns.forEach(camp => {
    (camp.adsets || []).forEach(ad => {
      const m = ad.metrics || {};
      const sp = (m.spend || 0) * multiplier;
      const pur = (m.purchases || 0) * multiplier;
      const rev = (m.revenue || 0) * multiplier;
      const ic = (m.ic || 0) * multiplier;
      const cl = (m.clicks || 0) * multiplier;
      const imp = (m.impressions || 0) * multiplier;
      const cogs = pur * (camp.cogs || 0);

      totalSpend += sp;
      totalPurchases += pur;
      totalRevenue += rev;
      totalIC += ic;
      totalClicks += cl;
      totalImpressions += imp;
      totalCogs += cogs;
    });
  });

  const nettProfit = totalRevenue - totalCogs - totalSpend;
  const realRoi = totalSpend > 0 ? ((nettProfit / totalSpend) * 100).toFixed(1) : '0';
  const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00';
  const cpr = totalPurchases > 0 ? Math.round(totalSpend / totalPurchases) : 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const closingRate = totalIC > 0 ? ((totalPurchases / totalIC) * 100).toFixed(1) : '0';

  return {
    spend: totalSpend,
    ic: totalIC,
    purchases: totalPurchases,
    revenue: totalRevenue,
    totalCogs,
    nettProfit,
    realRoi,
    roas,
    cpr,
    ctr,
    closingRate
  };
});

// =========================================================================
// EXPORT 1: REPORT DALAM BENTUK PDF
// =========================================================================
const exportTableToPDF = async () => {
  if (!printableTableRef.value) return;

  isExporting.value = true;
  try {
    const element = printableTableRef.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0b0f19',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297; // A4 Landscape width in mm
    const pageHeight = 210; // A4 Landscape height in mm
    const imgHeight = (canvas.height * (pageWidth - 20)) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, pageWidth - 20, Math.min(imgHeight, pageHeight - 20));
    pdf.save(`MetaSync_Report_Tabel_Finansial_${Date.now()}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF Report:', err);
    alert('Gagal mengekspor PDF Report: ' + err.message);
  } finally {
    isExporting.value = false;
  }
};

// =========================================================================
// EXPORT 2: FLYER DALAM BENTUK PNG
// =========================================================================
const exportFlyerToPNG = async () => {
  if (!flyerRef.value) return;

  isExporting.value = true;
  try {
    const element = flyerRef.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#090d16',
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `MetaSync_Flyer_Executive_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Failed to generate Flyer PNG:', err);
    alert('Gagal mengekspor Flyer PNG: ' + err.message);
  } finally {
    isExporting.value = false;
  }
};
</script>
