# MASTER PROMPT & ARSITEKTUR SISTEM: METASYNC BY FATHERLAB
> **Versi Dokumen:** 1.7.9  
> **Terakhir Diperbarui:** 4 November 2026
> **Author & Brand:** FatherLab (Sopianto Djahar)  
> **Repository GitHub:** [https://github.com/soppdj/MetaSync](https://github.com/soppdj/MetaSync)  
> **Status Sistem:** `metagraph live` (Meta Marketing Graph API v21.0 • Supabase Live • Pure Real-Connection Mode • Sentinel Active)  
> **Target Platform:** Desktop-Optimized Progressive Web Application (PWA)

---

## 📌 ATURAN WAJIB BAGI AGENT AI / DEVELOPER (LIVING DOCUMENT RULE)
> **PENTING / PERHATIAN:**  
> File `MASTER_PROMPT.md` ini adalah **Single Source of Truth (SSOT)** arsitektur, desain, logika bisnis, dan aturan operasional proyek MetaSync.  
> **Setiap kali agen AI atau pengembang melakukan modifikasi, menambahkan fitur baru, mengubah alur kerja (workflow), atau memperbarui antarmuka pengguna (UI/UX), berkas ini WAJIB diperbarui pada bagian yang bersangkutan beserta entri riwayat pada tabel *Changelog* di bagian akhir dokumen.**

---

## 1. IKHTISAR & TUJUAN PROYEK
**MetaSync by FatherLab** adalah sistem operasi komprehensif untuk pengiklan Meta Ads direct-response dan pemilik brand e-commerce. Aplikasi ini menggabungkan:
1. **Analitik Telemetri Finansial**: Visualisasi real-time metrik ad spend, gross revenue, net profit bersih, ROAS, dan rasio konversi corong iklan.
2. **MetaLab 3 Tahap Lifecycle**: Tata kelola kanban kampanye (TEST, SCALE 1, SCALE 2) dengan evaluasi otomatis berbasis 10 KPI dinamis serta rekomendasi penghentian (*Kill/Pause*) otomatis.
3. **Creative Leaderboard**: Penilaian aset kreatif (video/gambar) berbasis algoritma persilangan CTR tertinggi dan CPR terendah.
4. **Content Studio (AI Hypnowriting)**: Generator Buyer Persona, Value Proposition Canvas (VPC), 5 variasi naskah iklan hypnowriting, dan narasi video konten (*Road to 100 Juta Edition*) via Google Gemini 1.5 Pro berkecepatan tinggi dengan arsitektur Edge Streaming.
5. **Report & Ledger**: Buku besar pencatatan harian terstruktur dengan ekspor dokumen resmi PDF dan infografis flyer visual PNG.
6. **Data Protection Sentinel**: Proteksi integritas data anti-reset & anti-overwrite yang menjamin data kerja pengguna tidak pernah hilang atau tertimpa saat sinkronisasi maupun refresh.
7. **Animated Sci-Fi Security Gate & Admin Passkey**: Gerbang otentikasi login animatif dengan orbit telemetri radar HUD, verifikasi passkey khusus admin (default: `fatherlab2026`), audio synthesizer Web Audio API, passkey strength indicator, otorisasi biometrik 1-klik, dan fungsi Kunci Terminal / Logout.

---

## 2. TECH STACK & ARSITEKTUR PERANGKAT LUNAK

| Lapisan / Komponen | Teknologi | Keterangan & Peran |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vue 3** (`<script setup>`, Composition API) | Reaktivitas cepat, modularitas komponen, performa ringan |
| **Bundler & Tooling** | **Vite 6** | HMR instan, optimalisasi chunk produksi |
| **Styling & Theme** | **Tailwind CSS v3** + Custom HUD Tokens | Desain responsif desktop-first dengan estetika *Soft Futuristic* |
| **Ikonografi** | **lucide-vue-next** | Set ikon modern beresolusi tinggi dengan garis presisi |
| **Grafik & Data Viz** | **Chart.js** + **vue-chartjs** | Grafik area interaktif dengan glowing dual-tone cyan & copper |
| **Ekspor Dokumen** | **jspdf**, **jspdf-autotable**, **html2canvas** | Render tabel laporan PDF formal dan tangkapan flyer PNG tajam |
| **Database & Auth** | **Supabase (PostgreSQL 15)** | Skema relasional, RLS (Row Level Security), sinkronisasi Realtime |
| **Data Fallback** | **LocalStorage + Sentinel Protection Engine** | Zero-loss snapshot rolling 15 point, safe-merging ID, backup/restore JSON |
| **Backend Serverless** | **Vercel Serverless Functions** (`Node.js`) | Endpoint `/api/sync-meta` dan `/api/telegram-webhook` |
| **AI Edge Runtime** | **Vercel Edge Functions** (`export const runtime = 'edge'`) | Endpoint `/api/generate-copy` streaming respons kata-per-kata |
| **Mesin AI** | **Google Gemini 1.5 Pro** (`@google/genai`) | Model bahasa besar untuk naskah direct-response berkovert tinggi |
| **Notifikasi & Bot** | **Telegram Bot API** | Peringatan otomatis 2-arah dan eksekusi perintah `/kill <adset_id>` |

---

## 3. DESAIN SISTEM: TEMA SCI-FI FUTURISTIC HUD (ORBITAL TELEMETRY - ZERO BLUR)

Desain antarmuka MetaSync mengadopsi estetika murni **Sci-Fi Command Center & Telemetri Orbital Presisi Tinggi** (bukan sekadar efek blur atau frosted glass), yang secara visual mengacu pada visual telemetri global:
1. **Latar Belakang Obsidian Void & Grid Siber 120px/24px**:
   - Warna dasar: `#050811` pekat dengan aksen siber `#080d18`.
   - Grid telemetri ganda garis tipis (garis besar 120px dan grid sub-divisi 24px) tanpa blur berkabut.
2. **Centerpiece 3D Holographic Globe & Telemetry Deck (`HoloGlobeHUD.vue`)**:
   - Globe 3D wireframe interaktif (60 FPS via Canvas 2D) yang berputar dengan cincin garis lintang dan bujur.
   - 8 Hub Trafik Meta Ads global (Jakarta, Surabaya, Singapore, Tokyo, Sydney, London) dengan koordinat presisi.
   - Lintasan balistik trajektori melengkung warna Solar Copper (`#f97316`) dengan partikel data berdenyut yang melintas antar kota.
   - Cincin orbital konsentris berputar dengan derajat kompas (`0° North`, `90° East`, `180° South`, `270° West`).
   - Radar sweep dial 360° aktif untuk pemantauan ROAS dan efisiensi algoritma Meta.
   - Equalizer baris frekuensi 12-band real-time.
3. **Komponen High-Tech HUD**:
   - `.hud-panel`: Panel data dengan latar obsidian solid `#080d18`, garis border teknis 1px tajam (`rgba(34, 211, 238, 0.25)`), dan glow instrumen siber saat hover.
   - `.hud-corner`: Braket sudut siber presisi (garis neon cyan di kiri-atas dan garis copper oranye di kanan-bawah) dengan pin crosshair `+`.
   - `.hud-chamfer`: Sudut potong poligonal (`clip-path`) khas kokpit instrumen penerbangan luar angkasa.
   - Monospace Telemetry Typography: Semua metrik finansial, target, dan ID kampanye menggunakan format monospace tajam dengan penanda status siber (`[ SYS // ACTIVE ]`, `LAT/LON`, `FREQ MHZ`).

---

## 4. SENTINEL PROTEKSI INTEGRITAS DATA (ANTI-RESET & ANTI-OVERWRITE)

Untuk mencegah insiden hilangnya data pengguna saat halaman di-refresh, kegagalan koneksi API Meta/Supabase, atau penimpaan daftar kampanye:
1. **Aturan Safe-Merge (`safeMergeCampaigns`)**:
   - Sinkronisasi API tidak pernah menghapus data kampanye kustom yang dibuat pengguna di sisi lokal.
   - Entri dicocokkan berdasarkan `id`. Kampanye lokal yang belum tersinkronisasi ke server tetap dipertahankan dengan aman.
2. **Snapshot Otomatis Rolling 15 Titik**:
   - Setiap mutasi data (pembuatan kampanye, pemindahan tahap, pencatatan baris laporan, penambahan log studio) memicu `createDataSnapshot()`.
   - Menyimpan hingga 15 snapshot historis lengkap yang dapat di-rollback kapan saja dengan 1 klik.
3. **1-Click Backup & Restore JSON**:
   - Tombol ekspor menghasilkan file `metasync_backup_[timestamp].json` lengkap berisi seluruh state kampanye, ledger laporan, dan log hypnowriting.
   - Fitur restore memvalidasi struktur JSON sebelum diterapkan, mencegah korupsi data.
4. **Indikator Sentinel Aktif di Header**:
   - Badge pelindung dengan status "Anti-Reset Active" yang membuka modal telemetri snapshot jika diklik.

---

## 5. STRUKTUR 6 MODUL UTAMA APLIKASI

### Modul 1: Dashboard (Posisi No 1 - Default Telemetry View)
- **Holographic Orbital Telemetry Deck (`HoloGlobeHUD`)**:
  - Globe 3D wireframe interaktif yang berputar pada 60 FPS (Canvas 2D), memproyeksikan lintasan traffic iklan antar-hub global.
  - Radar Sweep Analyzer untuk deteksi efisiensi rasio ROAS vs CPR.
  - 12-Band Audio-style Frequency Equalizer untuk monitoring laju impresi harian.
- **Grafik Area Interaktif (Chart.js Dual-Tone HUD)**:
  - Kurva Area Belanja Iklan (*Solar Copper Glow*)
  - Kurva Area Omset Kotor (*Neon Cyan Glow*)
  - Kurva Area Laba Bersih (*Emerald Sinyal*)
- **Corong Konversi (Conversion Funnel Barometer)**:
  - Tahapan corong: Impresi $\rightarrow$ Clicks $\rightarrow$ Landing Page Views (LPV) $\rightarrow$ Add to Cart (ATC) $\rightarrow$ Initiate Checkout (IC) $\rightarrow$ Purchases.
  - Membandingkan rasio aktual terhadap target performa standar industri direct-response.

### Modul 2: MetaLab (Posisi No 2 - Lifecycle 3 Tahap)
- **Kolom 1: 1. TAHAP TEST**
  - Tujuan: Mencari Winning Creative, Angle, dan Copywriting dengan budget terkontrol.
- **Kolom 2: 2. TAHAP SCALE 1**
  - Tujuan: Meningkatkan performa ad set pemenang menggunakan Lookalike Audience (LLA) dan duplikasi audiens terbukti.
- **Kolom 3: 3. TAHAP SCALE 2**
  - Tujuan: Injeksi anggaran penuh (*full budget scaling*) pada kampanye bermargin laba tertinggi.
- **Wajib Input Data**:
  - Nama Kampanye
  - Harga Jual Item (IDR)
  - HPP / COGS (IDR)
- **Evaluator Otomatis**:
  - Badge **Auto-Move Ready**: Muncul jika $CTR > 2\%$ dan $CPR \le \text{Target CPR}$. Tombol "Pindahkan" menggeser status ke tahap berikutnya secara instan.
  - Badge **Rekomendasi Kill**: Muncul jika metrik melebihi batas toleransi risiko boncos, dilengkapi tombol darurat "Kill Sekarang" yang otomatis menembak API Meta untuk mem-pause ad set serta mengirim alert ke Telegram.

### Modul 3: MetaSync (Posisi No 3 - Sebelah MetaLab: Kotak Tabel KPI Real-Time)
- **Header Telemetri & Kontrol Sinkronisasi**:
  - Live Connection Status pill (`● LIVE GRAPH v20.0` atau `● SIMULATED TELEMETRY`).
  - Ad Account ID badge (`act_...`) dengan info waktu sinkronisasi terakhir.
  - Pilihan interval Auto-Sync (10s Flash, 20s Default, 60s Paced, Off) dengan hitung mundur detik (*Countdown Ticker*).
  - Tombol Instant Flash Sync (`SYNC NOW`).
- **Kotak Tabel Real-Time (10 KPI Berurutan ke Samping)**:
  - Menampilkan kampanye dalam format baris tabel padat (*high-density command table*) yang tersinkron langsung dengan Meta Ads.
  - Kolom berurutan secara ketat dari kiri ke kanan:
    1. **STATUS**: Tombol saklar 1-klik `ACTIVE` (hijau) / `PAUSED` (amber) yang langsung menembak Meta Graph API.
    2. **NAMA CAMPAIGN**: Nama kampanye, ID Meta, dan harga jual produk.
    3. **SPEND (PACING)**: Belanja iklan hari ini dan bar persentase pacing terhadap daily budget.
    4. **RESULT**: Total pesanan / konversi pembelian (`Purchases / Orders`) per kampanye.
    5. **VALUE**: Total omset kotor (`Conversion Value / Gross Revenue`) per kampanye dalam mata uang IDR.
    6. **ROAS**: Return on Ad Spend (`Gross Revenue / Spend`) berformat `X.XXx` dengan status badge performa (`FIRE` untuk $\ge 4.0\text{x}$, `PROFIT` untuk $\ge 2.0\text{x}$, `LOW` untuk $< 2.0\text{x}$).
    7. **1. CTR**: Link Click-Through Rate ($> 2.0\%$) + Badge PASS/WARN.
    8. **2. CPC**: Cost Per Click ($\le 1\% \times \text{Harga Jual}$).
    9. **3. LC TO LPV**: Rasio klik ke halaman produk ($\ge 80\%$).
    10. **4. COST LPV**: Biaya per kunjungan landing page ($\le 2.5\% \times \text{Harga Jual}$).
    11. **5. CPM**: Cost Per Mille ($\le \text{Rp } 32.000$).
    12. **6. LPV TO ATC**: Rasio landing page ke Add-to-Cart ($\ge 40\%$).
    13. **7. ATC TO IC**: Rasio Add-to-Cart ke Initiate Checkout ($\ge 30\%$).
    14. **8. CPR**: Cost Per Result / Purchase ($\le 25\% \times \text{Harga Jual}$).
    15. **9. CLOSING RATE**: Rasio checkout ke pembelian selesai ($\ge 82\%$).
    16. **10. FREQUENCY**: Frekuensi penayangan iklan ($< 3.0$) di paling kanan tabel.
  - **Baris Total & Rata-rata (Summary Footer)**: Menghitung total spend, total pesanan (result), total omset kotor (value), rata-rata ROAS, serta rata-rata dari seluruh 10 KPI kampanye.
  - Fitur pencarian kampanye instan dan filter status (`Active Saja`, `Paused`, tahap Test/Scale).

### Modul 4: Creative Leaderboard (Posisi No 4)
- **FatherLab Matrix Score**:
  $$\text{Score} = (\text{CTR} \times 10) + \left(100 - \left(\frac{\text{CPR}}{\text{Harga Jual}} \times 100\right)\right)$$
- **Ranking Podium**:
  - Peringkat 1: Gold Crown (#1 WINNER GOLD)
  - Peringkat 2: Silver (#2 SILVER)
  - Peringkat 3: Bronze (#3 BRONZE)
- **Filter Format**: Semua Tipe, Video Only, Image Only.

### Modul 5: Content Studio (Posisi No 5)
- **Hero Sambutan**: `"Halo, Sopianto Djahar 👋 [ SYSTEM // CONTENT STUDIO: PILIH INSTRUMEN ]"`
- **Sub-Tools (5 Instrumen Kreatif & Direct-Response)**:
  1. **Buyer Persona**: Input Nama Produk & Rencana Iklan $\rightarrow$ Profil demografi, psikografi, pain points, ketakutan, dan emotional purchase triggers.
  2. **Value Proposition Canvas (VPC)**: Fitur teknis, Benefit logis, Experience emosional, Need, Want, dan Fears (Pain Reliever).
  3. **Hypnowriting (5 Framework Direct-Response)**:
     - 1. **PAS** (Problem - Agitate - Solution) + Pattern Interrupt Hook.
     - 2. **BAB** (Before - After - Bridge) + Desire/Secret Hook.
     - 3. **AIDA** (Attention - Interest - Desire - Action) + Pain/Urgency Hook.
     - 4. **Epiphany Bridge** (Storytelling Emosional) + Relatable/Empathy Hook.
     - 5. **4U** (Useful - Urgent - Unique - Ultra-specific) + Benefit-Driven Hook.
  4. **Narasi Konten (v2.00 - Road to 100 Juta Edition)**:
     - Input: Nama Produk, Kategori, Input VPC, Durasi Video (15s/30s/60s/90s), Formula (PAS, AIDA, BAB, Storytelling, 3-Act Structure), Hook Type, CTA Type, Multi-Select Gaya Bahasa, Funnel Stage (TOFU/MOFU/BOFU), dan Catatan Tambahan.
  5. **Landing Page Builder (LP Builder - Hook Mematikan)**:
     - **Tujuan**: Membangun landing page direct-response berkonversi tinggi dengan hook mematikan berbasis sintesis Persona Audience, VPC, dan Hypnowriting sebelumnya.
     - **Fitur 1-Click Auto-Sync ("⚡ Tarik Data Riset")**: Menyerap secara otomatis nama produk, kategori, data Persona, deskripsi VPC, dan naskah Hypnowriting yang telah digenerate sebelumnya di studio.
     - **Pilihan Hook Strategy**: Pattern Interrupt, Pain-Agony, Curiosity & Secret Gap, Extreme Transformation, Fear of Regret & Scarcity.
     - **Tampilan Output Mode Ganda**:
       - *Mode Naskah Copy*: Teks copywriting terstruktur 9 section (Top Ticker, Above the Fold Hero Hook, Pain Agitation, Epiphany Bridge, VPC Feature-to-Benefit Matrix, Social Proof, Irresistible Offer Stacking, 100% Risk-Reversal Guarantee, Closing FAQ).
       - *Mode Visual Mockup*: Render interaktif responsive dengan toggle *Mobile (375px)* dan *Desktop*, kartu penawaran harga coret, tombol CTA pulsing glow, garansi segel, dan accordion FAQ interaktif.
     - **Ekspor Mandiri**: Tombol "Salin HTML" dan "Download HTML" (`.html`) yang menghasilkan landing page mandiri bertenaga Tailwind CDN siap pakai untuk Berdu, OrderOnline, Elementor, atau WordPress.
- **Streaming Output**: Konsumsi Vercel Edge Runtime (`/api/generate-copy`) via native `fetch` + `response.body.getReader()` dan `TextDecoder` untuk mencegah Vercel timeout 10 detik. Hasil akhir disimpan otomatis ke tabel `hypnowriting_logs` Supabase.

### Modul 6: Report (Posisi No 6)
- **Mode 1: Tabel Laporan Harian**:
  - Kolom: `No`, `Tanggal`, `IC`, `Purchases`, `Revenue`, `Today Spent`, `Nett Profit`, `ROI`.
  - Pewarnaan baris: Highlight kuning untuk Revenue, merah muda untuk Ad Spend, hijau untuk Nett Profit positif, merah menyala untuk Nett Profit negatif atau ROI -100%.
  - Input baris baru via modal formulir.
  - Tombol **Download Report (PDF)** menggunakan JSPDF + JSPDF AutoTable format lanskap bersih.
- **Mode 2: Flyer Visual Eksekutif**:
  - Kartu infografis ringkas berisi Total Spend, IC, Purchases, Total Revenue, Nett Profit, dan True ROI.
  - Tombol **Download Flyer (PNG)** menggunakan `html2canvas` beresolusi tajam (skala 2x).
  - Tombol **Download Flyer (PNG)** menggunakan `html2canvas` beresolusi tajam (skala 2x).

---

## 6. RULES ENGINE: 10 KPI DINAMIS & TARGET PREMISI

Setiap kartu kampanye dihitung metriknya secara otomatis berdasarkan input `Harga Jual` dan `HPP/COGS`:

| No | Nama Metrik | Rumus / Definisi | Target Dinamis |
| :---: | :--- | :--- | :--- |
| **1** | **CTR (Link Click-Through Rate)** | $\frac{\text{Link Clicks}}{\text{Impressions}} \times 100\%$ | **> 2.00%** |
| **2** | **CPC (Cost Per Click)** | $\frac{\text{Spend}}{\text{Clicks}}$ | **$\le 1\% \times \text{Harga Jual}$** |
| **3** | **LC to LPV** | $\frac{\text{Landing Page Views}}{\text{Link Clicks}} \times 100\%$ | **$\ge 80.00\%$** |
| **4** | **Cost Per LPV** | $\frac{\text{Spend}}{\text{Landing Page Views}}$ | **$\le 2.5\% \times \text{Harga Jual}$** |
| **5** | **CPM (Cost Per Mille)** | $\frac{\text{Spend}}{\text{Impressions}} \times 1000$ | **$\le \text{Rp32.000}$** |
| **6** | **LPV to ATC** | $\frac{\text{Add to Cart}}{\text{Landing Page Views}} \times 100\%$ | **$\ge 40.00\%$** |
| **7** | **ATC to IC** | $\frac{\text{Initiate Checkout}}{\text{Add to Cart}} \times 100\%$ | **$\ge 30.00\%$** |
| **8** | **CPR (Cost Per Result / Purchase)** | $\frac{\text{Spend}}{\text{Purchases}}$ | **$\le 25.00\% \times \text{Harga Jual}$** |
| **9** | **Closing Rate** | $\frac{\text{Purchases}}{\text{Initiate Checkout}} \times 100\%$ | **$\ge 82.00\%$** |
| **10** | **Frequency** | $\frac{\text{Impressions}}{\text{Reach}}$ | **$< 3.00$** |

### Logika Keputusan Otomatis:
- **Kondisi Naik Tahap (Auto-Move)**: Terpenuhi jika $\text{CTR} > 2.0\%$ dan $\text{CPR Aktual} \le \text{Target CPR}$.
- **Kondisi Peringatan Bahaya (Kill / Pause)**:
  - $\text{CPR} > 35\% \times \text{Harga Jual}$ setelah $\ge 5$ order, atau
  - $\text{Spend} > 1.5 \times \text{Target CPR}$ dengan 0 konversi, atau
  - $\text{CPM} > \text{Rp45.000}$ secara persisten dengan $\text{CTR} < 1.0\%$.

---

## 7. STRUKTUR DATABASE (SUPABASE POSTGRESQL SCHEMA)

```sql
-- 1. Tabel Kampanye
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  cogs NUMERIC(15, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'test' CHECK (status IN ('test', 'scale1', 'scale2', 'paused')),
  meta_campaign_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Ad Sets
CREATE TABLE IF NOT EXISTS adsets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  meta_adset_id TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Metrik Harian (Daily Metrics)
CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adset_id UUID REFERENCES adsets(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  spend NUMERIC(15, 2) DEFAULT 0,
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  lpv BIGINT DEFAULT 0,
  atc BIGINT DEFAULT 0,
  ic BIGINT DEFAULT 0,
  purchases BIGINT DEFAULT 0,
  revenue NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(adset_id, date)
);

-- 4. Tabel Aset Kreatif (Creative Assets untuk Leaderboard)
CREATE TABLE IF NOT EXISTS creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adset_id UUID REFERENCES adsets(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  name TEXT NOT NULL,
  url TEXT,
  total_spend NUMERIC(15, 2) DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  total_purchases BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Log AI Studio (Hypnowriting Logs)
CREATE TABLE IF NOT EXISTS hypnowriting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  tool_type TEXT DEFAULT 'hypnowriting',
  prompt_context TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Buku Kas Laporan (Report Ledger)
CREATE TABLE IF NOT EXISTS report_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ic INT DEFAULT 0,
  purchases INT DEFAULT 0,
  revenue NUMERIC(15, 2) DEFAULT 0,
  spent NUMERIC(15, 2) DEFAULT 0,
  nett_profit NUMERIC(15, 2) DEFAULT 0,
  roi NUMERIC(8, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. BACKEND & EDGE API INTEGRATIONS

### 1. `/api/sync-meta.js` (Vercel Serverless Function)
- Menarik metrik kampanye, ad set, dan insights hari ini dari Meta Marketing Graph API v20.0.
- Melakukan `UPSERT` data ke tabel `daily_metrics`.
- Terhubung langsung dengan tombol `Refresh Sync` di header aplikasi.

### 2. `/api/generate-copy.js` (Vercel Edge Streaming Function)
- Berjalan di runtime `edge` untuk bypass batas timeout 10 detik Vercel standar.
- Menggunakan SDK resmi `@google/genai` dengan model `gemini-1.5-pro`.
- Menghasilkan stream `text/event-stream` kata-per-kata langsung ke antarmuka Content Studio.

### 3. `/api/telegram-webhook.js` (Vercel Serverless Webhook)
- **Arah Keluar (Push Alert)**: Mengirim pesan darurat instan ke grup/channel Telegram saat sistem menemukan ad set yang wajib di-Kill atau saat kampanye lolos syarat Auto-Move.
- **Arah Masuk (Bot Command)**: Menerima perintah Telegram seperti `/kill <adset_id>`, memverifikasi otoritas pengirim, lalu menembak Meta Graph API untuk mengubah status ad set menjadi `PAUSED`.

---

## 9. RIWAYAT PERUBAHAN & CHANGELOG DOKUMEN

| Versi | Tanggal | Inisiator | Ringkasan Pembaruan |
| :---: | :---: | :---: | :--- |
| **v1.0.0** | 28 Okt 2026 | User & Antigravity | Rilis awal arsitektur MetaSync: 3 Tahap Kanban, 10 KPI rules, Supabase schema, Serverless Meta Sync, Telegram Webhook, dan Gemini AI Hypnowriting. |
| **v1.1.0** | 29 Okt 2026 | User Request | Restrukturisasi tata letak header, penyesuaian urutan modul (1. Dashboard, 2. MetaLab), transformasi nama menu menjadi *Content Studio*, penambahan fitur *Buyer Persona*, *Value Proposition Canvas*, dan *Narasi Konten v2.00 Road to 100 Juta Edition*. |
| **v1.1.5** | 30 Okt 2026 | User Request | Penyatuan fitur laporan menjadi menu *Report* (Tabel Laporan harian PDF + Flyer Visual PNG), pembersihan label/badge `(PDF)`, `(PNG)`, `Finansial`, dan `FatherLab Fiscal Audit`. |
| **v1.2.0** | 30 Okt 2026 | User Request | Implementasi tema visual **Soft Futuristic HUD (Orbital Telemetry)** terinspirasi visual holo globe AI, penambahan sistem **Proteksi Integritas Data Kerja (Anti-Reset & Anti-Overwrite Sentinel)** dengan rolling snapshot & safe-merging, serta penetapan berkas `MASTER_PROMPT.md` ini sebagai acuan permanen sistem. |
| **v1.3.0** | 31 Okt 2026 | User Feedback | Transformasi total ke **True Sci-Fi Futuristic HUD (Zero Blur Glass)**: Pembersihan semua efek blur berkabut (`backdrop-filter: blur`, `blur-3xl`), integrasi komponen **3D Holographic Earth Globe & Telemetry Deck (`HoloGlobeHUD.vue`)** dengan rotasi 60 FPS, lintasan trajektori balistik copper, dial sapuan radar 360°, visualizer equalizer frekuensi, dan penajaman panel HUD berkode monospace serta pin retikel `+`. |
| **v1.4.0** | 31 Okt 2026 | User Request | Rilis **Real-Time Meta Ads Live Command Dashboard (`LiveCampaignDashboard.vue`)**: Monitoring kampanye langsung tersinkron dengan Meta Marketing Graph API v20.0, kontrol auto-sync ticker, 1-click status toggle (Active/Paused) langsung ke Meta API, budget pacing bar, telemetry stream event logs, serta mode tampilan ganda Matrix Card & Telemetry Table. |
| **v1.5.0** | 31 Okt 2026 | User Request | Restrukturisasi Arsitektur Navigasi: Mengembalikan Dashboard asli (`PerformanceCharts.vue` dengan 3D HoloGlobeHUD dan Chart.js), memindahkan fitur sinkronisasi real-time ke **Tab Baru "MetaSync" (`MetaSyncTable.vue`)** tepat di sebelah MetaLab dengan tampilan **Kotak Tabel 10 KPI berurutan ke samping mulai dari Nama Campaign hingga Frequency di paling kanan**. |
| **v1.5.1** | 02 Nov 2026 | User Request | Penambahan 3 kolom baru pada tabel MetaSync (`MetaSyncTable.vue`) tepat di sebelah kolom Spend: **RESULT** (Total pesanan/orders), **VALUE** (Conversion Value/omset kotor IDR), dan **ROAS** (Return on Ad Spend dengan badge FIRE/PROFIT/LOW), lengkap dengan kalkulasi agregat di baris summary footer. |
| **v1.6.0** | 02 Nov 2026 | User Request | Penambahan instrumen ke-5 **Landing Page Builder (LP Builder)** pada menu Content Studio (`HypnowritingStudio.vue`): Terhubung langsung dengan hasil Persona Audience, Value Proposition Canvas (VPC), dan naskah Hypnowriting via fitur 1-klik "⚡ Tarik Data Riset". Dilengkapi strategi *Hook Mematikan*, mode tampilan ganda (*Naskah Copywriting Markdown* & *Visual Mockup Preview* responsive Mobile/Desktop), serta fitur ekspor/download file HTML mandiri (`.html`) siap pasang ke Berdu, OrderOnline, Elementor, atau WordPress. |
| **v1.6.1** | 02 Nov 2026 | User Request | Penyederhanaan label judul pada modal Integrasi & API Keys (`SettingsModal.vue`): Membersihkan label tambahan menjadi `1. Supabase`, `2. Meta Graph API`, `3. Telegram Bot`, dan `4. Google Gemini API`. |
| **v1.6.2** | 02 Nov 2026 | User Request | Migrasi & publikasi repositori resmi ke GitHub (https://github.com/soppdj/MetaSync). Konfigurasi proteksi privasi zero-leakage via .gitignore (mengabaikan .env*, node_modules, backup data), sinkronisasi branch main, dan dokumentasi .env.example. |
| **v1.7.0** | 02 Nov 2026 | User Request | Pembuatan **Animated Sci-Fi Login UI Terminal (`LoginView.vue`)** & **Password Khusus Admin (`useAuth.js`)**: Dilengkapi orbit HUD telemetri konsentris berputar, sapuan radar 360°, efek audio synthesizer Web Audio API (`cyberAudio.js`), verifikasi password khusus admin (`fatherlab2026` / `admin`), 1-klik biometrik passkey, animasi getar jika salah (cyber-shake), status dekripsi handshake, serta tombol Kunci Terminal (Logout) di Header. |
| **v1.7.1** | 03 Nov 2026 | User Request | Perbaikan komprehensif seluruh integrasi & Supabase Master SQL Schema: Penyediaan file `supabase/schema.sql` siap eksekusi di SQL Editor (lengkap RLS permisif untuk anon key, Realtime, indexes, seed data), penambahan tombol diagnosa & tes koneksi langsung di antarmuka Settings (`SettingsModal.vue`) untuk Supabase, Meta Ads Graph v21.0, Telegram Bot, dan Gemini AI, serta implementasi mesin direct browser-to-Meta sync (`metaApi.js`) dan Gemini fallback streaming (`geminiClient.js`). |
| **v1.7.2** | 03 Nov 2026 | User Request | Perbaikan Layar Putih Online (Vercel Blank Screen), Bypass AdBlocker Meta Ads, & Engine Telegram 2-Way Command: (1) Memperbaiki rewrite `vercel.json` dan PWA `sw.js` (Network-First) agar bundle JS statis tidak tertimpa HTML di production online; (2) Mengimplementasikan serverless relay & reverse proxy (`/api/meta-proxy` dan `/api/sync-meta`) untuk bypass error `Failed to fetch` akibat ekstensi AdBlocker (Brave Shields, uBlock, AdGuard) pada Meta Graph API v21.0; (3) Mengaktifkan autonomous 2-way Telegram command engine (`telegramBotListener.js`) dengan long-polling dan 1-click webhook registrar di `SettingsModal.vue` untuk perintah `/status`, `/rekap`, `/kill <id>`, `/ping`, dan `/help`; (4) Memastikan Master SQL Schema Supabase selalu tersinkronisasi otomatis di repositori GitHub. |
| **v1.7.3** | 03 Nov 2026 | User Request | Pembersihan Menyeluruh Seluruh Data Sampel / Dummy (Pure Real-Connection Mode): Menghapus seluruh data contoh kampanye, creative leaderboard, chart historis, data seed Supabase SQL, dan baris pembukuan laporan, serta mengaktifkan mekanisme sanitasi otomatis di browser storage agar aplikasi murni hanya menampilkan data yang benar-benar tersambung dari Meta Ads dan Supabase. |
| **v1.7.4** | 03 Nov 2026 | User Request | Perbaikan Ingest Langsung Meta Ads Marketing API v21.0 & Sinkronisasi Tampilan Real-Time: Mengintegrasikan kampanye nyata Meta Ads (seperti akun "EBOOK ASKS PRO" `act_1252088640428224`) langsung ke state frontend reaktif via `ingestLiveMetaCampaigns` tanpa ketergantungan wajib pada database Supabase yang belum terisi. Mengimplementasikan bus subscriber sinkronisasi terpusat (`syncListeners`) pada `useMetaSync`, mapping otomatis stage kanban (`test`, `scale1`, `scale2`), anti-blocker fallback otomatis ke `/api/sync-meta`, dan penghubungan prop `campaigns` ke `HoloGlobeHUD` dan `PerformanceCharts`. |
| **v1.7.5** | 03 Nov 2026 | User Request | Transformasi Line Chart Multi-Point Dashboard & Refactor Tipografi MetaLab: (1) Menghubungkan seluruh data kampanye dari MetaSync & MetaLab ke grafik area dan tren efisiensi di `PerformanceCharts.vue` via `activeChartData` dinamis dengan mode `Per Campaign (MetaSync)` multi-point, `Hari Ini (Pacing)`, `7 Hari`, dan `30 Hari`; (2) Memperbaiki tick sumbu Y dengan `formatCompactIDR(val)` untuk mengeliminasi label cacat `Rp 0Jt` / `Rp -0Jt` pada nilai ribuan; (3) Memperkaya kartu Corong Konversi dengan metrik absolut klik/impresi riil; (4) Menata ulang ukuran font, padding, dan ikon pada 4 kartu KPI atas di `KanbanBoard.vue` (`Total Spend`, `Total Revenue`, `Nett Profit`, `Average ROAS`) agar pas dan proporsional di dalam kotak; (5) Menghapus teks `STAGE 01 //`, `STAGE 02 //`, `STAGE 03 //` pada header kolom kanban menyisakan `[ TEST ]`, `[ SCALE 1 ]`, `[ SCALE 2 ]` yang tidak lagi patah/wrap menjadi 2 baris. |
| **v1.7.6** | 03 Nov 2026 | User Request | Optimalisasi Login UI 100% Zoom, Opsi Hapus/Filter Campaign Lama MetaSync, & Sinkronisasi Live Creative Leaderboard Meta Graph: (1) Penyesuaian layout modal Login agar pas di layar tanpa perlu zoom out 80%, pembersihan seluruh teks/badge tercoret (COMMAND, Admin Protocol, SEC_LEVEL badge, PROTOCOL readout, label default admin, master key box), username otomatis terisi 'Sopianto Djahar', dan perubahan password menjadi PIN '000000'; (2) Penambahan filter cepat '⚡ Hanya Spend > 0', aksi sembunyikan/hapus per-baris via ikon sampah (Trash2), tombol 'Sembunyikan Semua Rp 0', serta persistensi ID campaign tersembunyi di LocalStorage (metasync_hidden_campaigns) agar campaign lama tidak masuk otomatis; (3) Sinkronisasi visual kreatif (gambar & video), headline, copywriting, serta metrik performa (CTR, CPR, Spend, Orders) langsung dari Meta Marketing Graph API v21.0 (/ads) ke Creative Leaderboard dengan tombol sinkronisasi langsung dan fallback representasi aset hierarkis; (4) Pembaruan PIN default 000000 di SettingsModal dan useAuth. |
| **v1.7.7** | 03 Nov 2026 | User Request | Functionalization of Dashboard Orbital HUD, Date Range Filter Engine, Single-Line KPI Table Headers, & Login Privacy Hardening: (1) Peningkatan fungsionalitas HoloGlobeHUD dengan 3 mode interaktif: Pemetaan Audien Meta Ads di provinsi Indonesia (DKI Jakarta, Jabar, Jatim, Jateng, Banten, Sumut, Bali, Sulsel) dengan trajektori balistik, Geolocation IP pengunjung/audien real-time (deteksi IP otomatis via geoIpService + pelacak IP kustom dengan retikel sonar ping), dan Global Gateways, lengkap dengan visualisasi distribusi platform Instagram (Reels/Stories) vs Facebook dari Marketing Graph API v21.0 (/insights?breakdowns=region & publisher_platform); (2) Penambahan Date Range Selector di toolbar MetaSyncTable (Hari Ini, Kemarin, 7 Hari, 14 Hari, 30 Hari, Bulan Ini, Bulan Lalu, Lifetime, serta Periode Custom sejak/hingga) dan pembersihan tombol Spend > 0 / Sembunyikan Rp 0 sesuai instruksi coret merah; (3) Restrukturisasi 10 header KPI di tabel MetaSync menjadi satu baris bersih tanpa penomoran (CTR >2.0%, CPC ≤1%, LC TO LPV ≥80%, COST LPV ≤2.5%, CPM ≤32k, LPV TO ATC ≥40%, ATC TO IC ≥30%, CPR ≤25%, CLOSING RATE ≥82%, FREQUENCY <3.0); (4) Penguatan privasi Login Terminal: Input password dikosongkan secara default demi privasi pengguna, teks tombol diubah menjadi 'ENTER', alternatif akses via PIN '000000', pembersihan badge [ RESTRICTED ACCESS TERMINAL ] dan IP_NODE 10.240.18.92, serta pembersihan nama di footer terminal. |
| **v1.7.8** | 03 Nov 2026 | User Request | Enlarged Indonesian Archipelago Map Focus, Age & Gender Demographics Module, and Manual PIN Privacy Hardening: (1) Pemfokusan dan pembesaran peta Indonesia pada 3D HoloGlobeHUD (koordinat pusat 118°E, -2.5°S) dengan ekspansi koordinat antarpulau dan kontur garis kepulauan Indonesia (Sumatera, Jawa, Bali/Nusa, Kalimantan, Sulawesi, Papua) dengan skala besar agar seluruh label provinsi tampak jelas tanpa tumpang-tindih; (2) Penambahan tombol kontrol Zoom (+/-) dan 1-klik '🇮🇩 Fokus Indonesia'; (3) Penambahan modul demografi audien Meta Ads baru 'AGE & GENDER AUDIENCE' pada kolom kanan bawah dengan grafik rasio gender (Wanita vs Pria) dan distribusi rentang usia (18-24, 25-34 Core, 35-44, 45-54, 55+) tersambung langsung dari Meta Marketing Graph API v21.0 (/insights?breakdowns=age,gender); (4) Pembersihan total tombol pintas login PIN dari LoginView sesuai instruksi coret merah pengguna, sehingga PIN/password kini murni dimasukkan secara manual tanpa terekspos di layar. |
| **v1.7.9** | 04 Nov 2026 | User Request | Input Angka Fleksibel Tanpa Pembulatan, Pelebaran Kotak & Sphere Globe Tanpa Clipping Saat Zoom, serta Opsi Pemilih Campaign pada Flyer Visual: (1) Mengubah seluruh atribut input angka (`step="1000"` dan `step="50000"`) menjadi `step="any"` dan `min="0"` pada modal Catat Laporan Harian (`ReportGenerator.vue`) dan modal Buat/Edit Campaign (`CampaignModal.vue`), sehingga pengguna leluasa menginput angka berapapun (seperti 42844) tanpa kendala validasi browser atau pembulatan paksa; (2) Memperlebar dan mempertinggi kotak canvas 3D HoloGlobeHUD (`min-h-[520px] sm:min-h-[560px]`, canvas `w-full max-w-[540px] h-[500px]`) dengan formula radius adaptif (`0.35 * minDim * zoomLevel`) dan resize observer listener, sehingga saat pengguna memperbesar (zoom in), bola dunia 3D tetap utuh, bulat sempurna, tanpa garis datar terpangkas (clipping) di bagian atas dan bawah; (3) Menambahkan dropdown pemilih campaign ('Pilih Campaign') pada toolbar Flyer Visual (`ReportGenerator.vue`) di samping filter periode, memungkinkan pengguna memilih apakah ingin membuat dan mengunduh flyer ringkasan 'Semua Campaign (Total Akun)' atau flyer khusus untuk satu kampanye tertentu dengan nama file dan judul yang menyesuaikan otomatis. |

---

## 10. PROTOKOL KONTINUITAS BAGI AI AGENT SELANJUTNYA
1. **Dilarang Menghapus Konfigurasi Kustom**: Jangan pernah merestart atau mengganti struktur data lokal tanpa melalui helper proteksi data (`safeMergeCampaigns` / `createDataSnapshot`).
2. **Pertahankan Estetika Soft Futuristic**: Selalu gunakan kombinasi warna obsidian dark, neon cyan (`#00f0ff` / `#06b6d4`), dan solar copper (`#f97316`) pada setiap penambahan antarmuka baru.
3. **Selalu Update File Ini**: Jika ada perubahan kode atau fitur dari pengguna, perbarui dokumen `MASTER_PROMPT.md` ini sebagai langkah pertama atau kedua sebelum turn selesai.
