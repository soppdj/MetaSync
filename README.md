# MetaSync by FatherLab 🚀
> **Desktop-Optimized PWA untuk Manajemen, Analitik, dan Creative Studio Meta Ads.**  
> Powered by: Vue 3 (Vite), Tailwind CSS, Supabase (PostgreSQL & Realtime), Vercel Serverless & Edge Functions, Meta Marketing Graph API v20.0, Google Gemini 1.5 Pro, and Telegram Bot API.

---

## 🌟 Fitur Utama & Modul

### 1. Dashboard Kanban Lifecycle Kampanye (Desktop-Focused Grid)
Grid horizontal lebar bernuansa *dark-mode* modern dengan 3 kolom tahap:
- **1. TEST**: Eksplorasi sudut pandang (*angle*) & materi kreatif pemenang (*winning creative*).
- **2. SCALE 1**: Ad set pemenang & audiens LLA (Lookalike Audience).
- **3. SCALE 2**: Penetrasi pasar maksimal & injeksi anggaran penuh (*full budget injection*).
- **IDR Formatting**: Seluruh nilai finansial (Spend, Revenue, HPP, CPR, CPC, Laba Bersih) diformat rapi dalam Rupiah (IDR).
- **Header Global Sync**: Tombol *"Refresh Sync"* memicu penarikan data mutakhir dari Meta Graph API ke Supabase.

### 2. 10 KPI Rules Engine dengan Dynamic Target
Setiap kartu campaign dan adset dilengkapi kalkulasi 10 metrik KPI dengan target dinamis yang diturunkan langsung dari **Harga Jual Item** dan **HPP / COGS**:
1. **CTR (Click-Through Rate)** — Target: `> 2.0%`
2. **CPC (Cost Per Click)** — Target: `≤ 1% x Harga Jual`
3. **LC to LPV (Link Click to Landing Page View)** — Target: `≥ 80%`
4. **Cost LPV** — Target: `2% - 3% x Harga Jual`
5. **CPM (Cost Per Mille)** — Target: `≤ Rp 32.000`
6. **LPV to ATC (Landing Page to Add-To-Cart)** — Target: `≥ 40%`
7. **ATC to IC (Add-To-Cart to Initiate Checkout)** — Target: `≥ 30%`
8. **CPR (Cost Per Result / Purchase)** — Target: `≤ 25% x Harga Jual`
9. **Closing Rate (IC to Purchase)** — Target: `≥ 82%`
10. **Frequency** — Target: `< 3.0x`

- **Evaluasi Otomatis (Auto-Move)**: Jika CTR `> 2.0%` dan CPR aktual `≤ Target CPR` konsisten, kartu mendapatkan badge *"Auto-Move Ready"* dan dapat dipromosikan ke tahap berikutnya dengan 1 klik atau trigger otomatis.
- **Rekomendasi "Kill"**: Badge merah muda/rose lembut berkedip jika CPR jauh melampaui batas (`> 135%` target atau `0 purchase` dengan *spend* tinggi) atau CPM tetap buruk. Dilengkapi tombol darurat *"Kill Sekarang"* untuk menjeda iklan di Meta dan mengirim alert ke Telegram.

### 3. Vercel Serverless Backend & Meta Sync (`/api/sync-meta`)
- Mengambil *real-time insights* hari ini dari Meta Marketing Graph API v20.0 (`/act_<id>/insights`).
- Memetakan `landing_page_view`, `add_to_cart`, `initiate_checkout`, dan `purchase`.
- Melakukan `UPSERT` secara atomic ke tabel `daily_metrics` di Supabase dengan constraint `(adset_id, date)`.

### 4. Integrasi Telegram Bot 2-Arah (`/api/telegram-webhook`)
- **Arah Keluar (Push Alert)**: Mengirim alert otomatis ke Telegram saat sistem mendeteksi rekomendasi *Kill* atau promosi *Auto-Move*.
- **Arah Masuk (Command Control)**: 
  - `/kill <adset_id>`: Menjeda (*pause*) adset langsung di Meta API dan mengupdate status adset di Supabase ke `PAUSED`.
  - `/status`: Ringkasan performa harian (Spend, Omset, ROAS, Top Creative).
  - `/help`: Panduan perintah bot.

### 5. Creative Leaderboard & Matrix Scoring
- Menghitung skor pemenang (*Matrix Score*) dari tabel `creative_assets` menggunakan rumus persilangan: **CTR Tertinggi** dikombinasikan dengan **CPR Terendah**.
- Preview thumbnail, headline, primary copy, video/image filter, serta rincian spend & jumlah order.

### 6. Executive Report Generator (Flyer & PDF)
- Rangkuman eksekutif dengan 6 metrik utama: **Ad Spend, Initiate Checkout (IC), Purchases, Gross Revenue, Nett Profit (Revenue - HPP - Ad Spend), dan Real ROI (%)**.
- Filter waktu fleksibel: Harian (Hari Ini), Mingguan (7 Hari), Bulanan (30 Hari), dan Custom Date.
- Ekspor 1-klik ke PDF berkualitas tinggi menggunakan `html2canvas` dan `jspdf`.

### 7. AI Hypnowriting Studio (Gemini 1.5 Pro + Vercel Edge Streaming)
- Endpoint Vercel Edge Function `/api/generate-copy` (`export const runtime = 'edge'`).
- Mencegah Vercel timeout (10 detik) dengan *real-time streaming* via `ReadableStream` dan dikonsumsi frontend menggunakan `response.body.getReader()` dan `TextDecoder`.
- Output terstruktur Markdown dengan:
  - **Buyer Persona Lengkap** (Demografi, Psikografi, Trigger Emosional).
  - **Value Proposition Canvas** (Benefits, Experience, Need, Want, Fears).
  - **5 Variasi Naskah Iklan Meta**:
    1. **PAS** (Problem-Agitate-Solution) + *Pattern Interrupt Hook*
    2. **BAB** (Before-After-Bridge) + *Desire / Secret Hook*
    3. **AIDA** (Attention-Interest-Desire-Action) + *Pain / Urgency Hook*
    4. **Epiphany Bridge** (Storytelling Emosional) + *Relatable / Empathy Hook*
    5. **4U** (Useful-Urgent-Unique-Ultra-specific) + *Benefit-Driven Hook*
- Auto-simpan riwayat copywriting ke tabel `copywriting_logs` di Supabase.

---

## 🛠️ Struktur Database Supabase PostgreSQL

Skema lengkap tersedia di `supabase/schema.sql` dan data dummy di `supabase/seed.sql`:

1. `users`: ID pengguna privat, email, chat ID Telegram, Meta Ad Account ID.
2. `campaigns`: `id`, `name`, `base_price` (Harga Jual), `cogs` (HPP), `status` (`test`/`scale1`/`scale2`/`paused`), `meta_campaign_id`, `created_at`.
3. `adsets`: `id`, `campaign_id`, `meta_adset_id`, `name`, `status`.
4. `daily_metrics`: `id`, `adset_id`, `date`, `spend`, `impressions`, `clicks`, `lpv`, `atc`, `ic`, `purchases`, `revenue`.
5. `creative_assets`: `id`, `adset_id`, `type` (`image`/`video`), `url`, `thumbnail_url`, `total_spend`, `total_clicks`, `total_purchases`.
6. `copywriting_logs`: `id`, `campaign_id`, `prompt_context`, `generated_text`, `framework`, `created_at`.

---

## 🚀 Panduan Menjalankan Proyek

### 1. Jalankan di Lokal (Development Mode)
```bash
cd metasync
npm install
npm run dev
```
Buka `http://localhost:5173` di browser.

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` ke `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
META_ACCESS_TOKEN=EAAG...
META_AD_ACCOUNT_ID=act_123456789
GEMINI_API_KEY=AIzaSy...
TELEGRAM_BOT_TOKEN=123456789:ABC...
TELEGRAM_CHAT_ID=619284710
```

*Catatan: Anda juga dapat memasukkan dan menyimpan API keys langsung dari antarmuka Settings modal di dalam aplikasi (disimpan aman di browser LocalStorage).*

### 3. Deploy ke Vercel
```bash
vercel
```
Vercel akan otomatis mengenali fungsi di folder `/api` (termasuk Vercel Edge Runtime untuk `/api/generate-copy`).
