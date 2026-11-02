<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
    <div class="hud-card hud-corner rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-cyan-500/30">
      
      <!-- Modal Header -->
      <div class="p-6 border-b border-dark-750 flex items-center justify-between bg-dark-900/90 relative">
        <div class="scanline-effect"></div>
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-glow-cyan">
            <ShieldCheck class="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-extrabold text-white tracking-wide">Data Protection Sentinel</h2>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE & PROTECTED
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono mt-0.5">Anti-Reset & Anti-Overwrite Engine FatherLab v1.0</p>
          </div>
        </div>
        <button 
          @click="$emit('close')" 
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-all border border-dark-700"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body Container -->
      <div class="p-6 overflow-y-auto space-y-6 text-xs font-sans">
        
        <!-- Live Integrity Telemetry Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-2xl bg-dark-850/90 border border-cyan-500/20">
            <span class="text-[10px] font-mono uppercase text-slate-400 block">Campaigns Aktif</span>
            <span class="text-base font-mono font-bold text-cyan-300 mt-0.5 block">{{ stats.campaigns }} Data</span>
            <span class="text-[9px] text-emerald-400 font-mono">100% Persisten</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-dark-850/90 border border-cyan-500/20">
            <span class="text-[10px] font-mono uppercase text-slate-400 block">Buku Kas (Report)</span>
            <span class="text-base font-mono font-bold text-amber-300 mt-0.5 block">{{ stats.reportRecords }} Hari</span>
            <span class="text-[9px] text-emerald-400 font-mono">Tersimpan Aman</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-dark-850/90 border border-cyan-500/20">
            <span class="text-[10px] font-mono uppercase text-slate-400 block">Hypnowriting Arsip</span>
            <span class="text-base font-mono font-bold text-purple-300 mt-0.5 block">{{ stats.hypnowritingLogs }} Naskah</span>
            <span class="text-[9px] text-emerald-400 font-mono">Protected Cache</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-dark-850/90 border border-cyan-500/20">
            <span class="text-[10px] font-mono uppercase text-slate-400 block">Auto-Snapshots</span>
            <span class="text-base font-mono font-bold text-emerald-300 mt-0.5 block">{{ snapshots.length }} Titik</span>
            <span class="text-[9px] text-cyan-400 font-mono">Rolling History</span>
          </div>
        </div>

        <!-- Protection Guarantees -->
        <div class="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 space-y-2">
          <span class="font-bold text-cyan-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-cyan-400" />
            Protokol Keamanan Data Kerja Anda:
          </span>
          <ul class="text-[11px] text-slate-300/90 space-y-1.5 list-disc list-inside">
            <li><strong class="text-white">Anti-Reset Guard:</strong> Memuat data dari cache lokal yang telah diverifikasi; tidak akan mereset data kampanye atau rekap harian Anda kembali ke template awal saat halaman dimuat ulang.</li>
            <li><strong class="text-white">Anti-Overwrite Sync:</strong> Penarikan data Meta Graph API dan Supabase menggabungkan data secara cerdas (Safe-Merge by ID) tanpa menghapus kampanye lokal kustom Anda.</li>
            <li><strong class="text-white">Auto-Snapshotting:</strong> Setiap penambahan kampanye atau entri laporan secara otomatis membuat titik pemulihan instan di riwayat snapshot.</li>
          </ul>
        </div>

        <!-- 1-Click Backup & Restore Actions -->
        <div class="p-4 rounded-2xl bg-dark-850/90 border border-dark-750 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 class="font-bold text-white text-xs">Cadangkan & Pulihkan Database Lengkap</h4>
            <p class="text-[11px] text-slate-400 mt-0.5">Simpan salinan offline file JSON berisi seluruh konfigurasi & histori kerja Anda.</p>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <!-- Export JSON -->
            <button
              @click="handleExportBackup"
              class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-dark-800 hover:bg-dark-750 border border-cyan-500/40 hover:border-cyan-400 shadow-glow-cyan transition-all"
            >
              <Download class="w-3.5 h-3.5 text-cyan-400" />
              <span>Ekspor Backup JSON</span>
            </button>

            <!-- Import JSON Button & Hidden File Input -->
            <label class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-amber-500/40 cursor-pointer transition-all">
              <Upload class="w-3.5 h-3.5 text-amber-400" />
              <span>Impor Backup</span>
              <input type="file" accept=".json" @change="handleImportBackup" class="hidden" />
            </label>
          </div>
        </div>

        <!-- Snapshots Rolling History Table -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <History class="w-3.5 h-3.5 text-purple-400" />
              Riwayat Titik Pemulihan (Snapshots)
            </span>
            <button 
              @click="handleCreateManualSnapshot"
              class="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
            >
              + Buat Snapshot Sekarang
            </button>
          </div>

          <div class="rounded-xl border border-dark-750 bg-dark-900 overflow-hidden max-h-48 overflow-y-auto">
            <table class="w-full text-left border-collapse text-[11px]">
              <thead class="bg-dark-850 text-slate-400 font-mono text-[10px] uppercase border-b border-dark-750 sticky top-0">
                <tr>
                  <th class="py-2 px-3">Waktu Pemulihan</th>
                  <th class="py-2 px-3">Pemicu Snapshot</th>
                  <th class="py-2 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-dark-800 font-mono text-slate-300">
                <tr v-for="snap in snapshots" :key="snap.id" class="hover:bg-dark-850/60">
                  <td class="py-2 px-3 text-cyan-300 font-bold whitespace-nowrap">{{ snap.formattedTime }}</td>
                  <td class="py-2 px-3 text-slate-300 font-sans truncate max-w-[200px]">{{ snap.reason }}</td>
                  <td class="py-2 px-3 text-right whitespace-nowrap">
                    <button
                      @click="handleRollback(snap.id)"
                      class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-bold border border-purple-500/30 text-[10px]"
                    >
                      Rollback
                    </button>
                  </td>
                </tr>
                <tr v-if="snapshots.length === 0">
                  <td colspan="3" class="py-4 text-center text-slate-500 font-sans">
                    Belum ada riwayat snapshot. Lakukan perubahan untuk memicu auto-snapshot.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-dark-750 bg-dark-900/90 flex items-center justify-between">
        <span class="text-[10px] font-mono text-slate-500">Security Checksum: SHA-256 Verified Storage</span>
        <button
          @click="$emit('close')"
          class="px-5 py-2 rounded-xl text-xs font-bold text-white bg-dark-800 hover:bg-dark-750 border border-dark-700"
        >
          Tutup
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Download, 
  Upload, 
  History 
} from 'lucide-vue-next';
import { 
  getSnapshotHistory, 
  createDataSnapshot, 
  restoreFromSnapshot, 
  exportFullBackupFile, 
  importFullBackupFile 
} from '../utils/dataProtection';

const emit = defineEmits(['close', 'notify', 'reload-data']);

const snapshots = ref(getSnapshotHistory());

const stats = computed(() => {
  const camps = JSON.parse(localStorage.getItem('metasync_campaigns_cache') || '[]');
  const reports = JSON.parse(localStorage.getItem('metasync_report_records') || '[]');
  const hypno = JSON.parse(localStorage.getItem('metasync_hypnowriting_cache') || '[]');
  return {
    campaigns: camps.length,
    reportRecords: reports.length,
    hypnowritingLogs: hypno.length,
  };
});

const handleCreateManualSnapshot = () => {
  const snap = createDataSnapshot('Manual Snapshot oleh Pengguna');
  if (snap) {
    snapshots.value = getSnapshotHistory();
    emit('notify', 'Snapshot manual berhasil dibuat!', 'success');
  }
};

const handleExportBackup = () => {
  const res = exportFullBackupFile();
  if (res.success) {
    emit('notify', 'File backup JSON berhasil diunduh!', 'success');
  } else {
    emit('notify', `Gagal ekspor: ${res.error}`, 'danger');
  }
};

const handleImportBackup = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result;
    if (typeof content === 'string') {
      const res = importFullBackupFile(content);
      if (res.success) {
        snapshots.value = getSnapshotHistory();
        emit('notify', `Backup berhasil dipulihkan (${res.campaignsCount} campaign, ${res.reportsCount} baris laporan)!`, 'success');
        emit('reload-data');
      } else {
        emit('notify', `Gagal impor: ${res.error}`, 'danger');
      }
    }
  };
  reader.readAsText(file);
};

const handleRollback = (snapshotId) => {
  if (confirm('Yakin ingin mengembalikan (Rollback) data ke titik snapshot ini? Sistem akan membuat restore point cadangan sebelum memulihkan.')) {
    const res = restoreFromSnapshot(snapshotId);
    if (res.success) {
      snapshots.value = getSnapshotHistory();
      emit('notify', `Data berhasil dipulihkan ke titik: ${res.timestamp}!`, 'success');
      emit('reload-data');
    } else {
      emit('notify', `Rollback gagal: ${res.error}`, 'danger');
    }
  }
};
</script>
