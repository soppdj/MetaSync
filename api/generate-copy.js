// api/generate-copy.js
// Vercel Edge Function: Calls Google Gen AI SDK (Gemini 1.5 Pro) with generateContentStream()
// Streams text word-by-word via ReadableStream to prevent Vercel 10s execution timeout.

export const runtime = 'edge';

import { GoogleGenAI } from '@google/genai';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const { 
      toolType = 'hypnowriting',
      productName,
      targetMarket,
      languageStyle,
      productType,
      vpcData,
      adPlan,
      productDescription,
      category,
      videoDuration,
      formula,
      hookType,
      ctaType,
      languageStyles = [],
      funnelStage,
      additionalNotes,
      price,
      offer,
      personaData,
      hypnowritingData,
      hookStrategy,
      targetPlatform
    } = payload;

    const apiKey = process.env.GEMINI_API_KEY;

    let prompt = '';
    let fallbackText = '';

    // =========================================================================
    // 1. TOOL: BUYER PERSONA
    // =========================================================================
    if (toolType === 'buyer-persona') {
      prompt = `
Anda adalah Pakar Consumer Behavior & Lead Strategist FatherLab.
Buat analisis BUYER PERSONA LENGKAP & MENDALAM untuk produk berikut:

INFORMASI PRODUK:
- Nama Produk: ${productName || 'Skincare Glow Serum'}
- Rencana Iklan / Platform: ${adPlan || 'Instagram & Facebook Ads'}

FORMAT OUTPUT WAJIB (Gunakan Markdown terstruktur rapi):
# 👤 BUYER PERSONA LENGKAP: ${productName || 'PRODUK'}

## 1. PROFIL DEMOGRAFI & IDENTITAS
- **Nama Persona Representatif**: [Contoh: Rian si Eksekutif Muda / Sarah si Ibu Cerdas]
- **Rentang Usia**: [e.g. 24 - 34 tahun]
- **Gender & Status**: [e.g. Wanita, Menikah, Bekerja di Perkotaan]
- **Tingkat Penghasilan & Daya Beli**: [e.g. Rp 6 - 15 Juta/bulan, sering checkout via Shopee/TikTok/Web]
- **Platform Utama**: ${adPlan || 'Instagram & Facebook'}

## 2. PROFIL PSIKOGRAFI & GAYA HIDUP
- **Nilai Hidup Utama**: [Apa prinsip hidup mereka?]
- **Aspirasi Terbesar**: [Ingin dipandang seperti apa oleh lingkungan sosial?]
- **Rutinitas Harian**: [Kapan waktu mereka scrolling sosmed saat lelah/istirahat?]

## 3. PAIN POINTS & KETAKUTAN TERBESAR (FEARS)
- **Frustasi Utama**: [Masalah spesifik yang belum terselesaikan oleh produk kompetitor]
- **Biaya Emosional**: [Rasa minder, cemas, atau lelah saat bercermin atau bertemu orang]
- **Ketakutan Membeli**: [Takut tidak cocok, takut uang terbuang, takut efek samping]

## 4. EMOTIONAL PURCHASE TRIGGERS
- **Momen "Cukup Sudah!"**: [Kejadian apa yang membuat mereka akhirnya klik iklan dan beli sekarang juga?]
- **Alasan Emosional**: [Bukan sekadar fitur, melainkan perasaan lega/pujian]

## 5. REKOMENDASI ANGLE IKLAN & HOOK
- **Angle 1 (Logika/Bukti)**: [Hook berbasis angka & BPOM/klinis]
- **Angle 2 (Emosional/Empati)**: [Hook yang menyentuh rasa lelah/insecure]
- **Angle 3 (Social Proof)**: [Hook berbasis testimoni relatable]
`;

      fallbackText = `# 👤 BUYER PERSONA LENGKAP: ${productName || 'Skincare Glow Serum'}

## 1. PROFIL DEMOGRAFI & IDENTITAS
- **Nama Persona Representatif**: Amanda Putri (27 Tahun) — "The Ambitious Urban Professional"
- **Rentang Usia**: 24 – 33 Tahun
- **Gender & Status**: Wanita karir, belum menikah / baru menikah muda, berdomisili di kota tier 1 & 2 (Jabodetabek, Bandung, Surabaya, Medan).
- **Tingkat Penghasilan**: Rp 7.000.000 – Rp 16.000.000/bulan. Terbiasa belanja online via Instagram Shop, WhatsApp, dan e-commerce.
- **Platform Utama**: ${adPlan || 'Instagram & Facebook Ads'} (Aktif jam 07:00-08:30 pagi dan 20:00-23:00 malam).

## 2. PROFIL PSIKOGRAFI & GAYA HIDUP
- **Nilai Hidup Utama**: Menjaga citra profesional, efisiensi waktu, dan kesehatan kulit sebagai investasi jangka panjang.
- **Aspirasi Terbesar**: Tampil percaya diri saat presentasi di depan klien tanpa harus menumpuk riasan tebal.
- **Rutinitas Harian**: Jam kerja padat di ruangan ber-AC, terpapar polusi perjalanan, sering kurang tidur dan mengalami breakout hormonal.

## 3. PAIN POINTS & KETAKUTAN TERBESAR (FEARS)
- **Frustasi Utama**: Noda hitam bekas jerawat membandel yang tidak kunjung pudar meski sudah mencoba banyak produk viral di media sosial.
- **Biaya Emosional**: Merasa cemas saat kamera meeting menyala tanpa filter, merasa lelah karena harus bangun 20 menit lebih pagi hanya untuk menutupi bekas jerawat dengan concealer tebal.
- **Ketakutan Membeli**: Takut terjadi purging parah, takut ada zat berbahaya tersembunyi, dan takut uang ratusan ribu hangus sia-sia seperti produk sebelumnya.

## 4. EMOTIONAL PURCHASE TRIGGERS
- **Momen "Cukup Sudah!"**: Ketika rekan kantor menegur: *"Lagi kecapekan ya? Wajah kamu kelihatan kusam banget"*, atau saat bersiap untuk agenda penting (kencan, interview, reuni) dan makeup tidak bisa menutupi noda jerawat.
- **Alasan Emosional**: Membeli bukan demi botolnya, melainkan demi rasa tenang dan bebas dari rasa minder saat bertatap muka.

## 5. REKOMENDASI ANGLE IKLAN & HOOK
- **Angle 1 (Pattern Interrupt)**: *"Stop buang waktu 20 menit tiap pagi cuma buat nutupin bekas jerawat pakai bedak tebal!"*
- **Angle 2 (Emosional/Empati)**: *"Pernah nggak sih ngerasa udah habis jutaan buat skincare tapi mukanya gini-gini aja?"*
- **Angle 3 (Bukti Klinis)**: *"Formulasi Niacinamide 10% + Tranexamic 3% murni yang memudarkan flek dalam 14 hari tanpa sensasi perih."*
`;
    }

    // =========================================================================
    // 2. TOOL: VALUE PROPOSITION CANVAS (BENEFIT, EXPERIENCE, NEED, WANT, FEARS)
    // =========================================================================
    else if (toolType === 'vpc') {
      prompt = `
Anda adalah Chief Strategist FatherLab. Buat VALUE PROPOSITION CANVAS (VPC) komprehensif untuk produk berikut:

INFORMASI PRODUK:
- Nama Produk: ${productName || 'Skincare Glow Serum'}
- Rencana Iklan: ${adPlan || 'Instagram & Facebook Ads'}
- Deskripsi Produk: ${productDescription || 'Serum perawatan wajah untuk mencerahkan noda hitam dan meratakan warna kulit'}

FORMAT OUTPUT WAJIB (Gunakan Markdown terstruktur rapi):
# 📋 VALUE PROPOSITION CANVAS (VPC): ${productName || 'PRODUK'}

## SISI 1: CUSTOMER PROFILE (PROFIL PELANGGAN)
### 1. Customer Jobs (Tugas Pelanggan)
- **Fungsional**: [Apa yang ingin mereka capai secara teknis?]
- **Sosial**: [Bagaimana mereka ingin dipandang oleh orang lain?]
- **Emosional**: [Perasaan apa yang ingin mereka rasakan?]

### 2. Customer Pains (Masalah & Ketakutan)
- Hambatan terbesar saat menggunakan produk sejenis.
- Kerugian waktu, uang, dan ketidaknyamanan fisik.

### 3. Customer Gains (Harapan & Manfaat Ideal)
- Hasil nyata yang membuat mereka sangat puas dan merekomendasikan produk.

---

## SISI 2: VALUE MAP (PETA NILAI PRODUK)
### 1. Products & Services (Fitur Inti)
- Komposisi bahan unggulan, tekstur, sertifikasi resmi, dan kemasan.

### 2. Pain Relievers (Pereda Masalah)
- Bagaimana fitur produk secara langsung melenyapkan setiap Pain pelanggan.

### 3. Gain Creators (Pencipta Manfaat Nyata)
- Bagaimana produk menghadirkan pengalaman emosional yang melampaui ekspektasi.

---

## 💎 RINGKASAN INTISARI VPC (BENEFIT, EXPERIENCE, NEED, WANT, FEARS):
- **Fitur**: [Komposisi utama]
- **Benefit**: [Manfaat nyata terukur]
- **Experience**: [Sensasi saat menggunakan]
- **Need**: [Kebutuhan fungsional dasar]
- **Want**: [Keinginan emosional terdalam]
- **Fears**: [Keraguan sebelum membeli yang berhasil dimentahkan]
`;

      fallbackText = `# 📋 VALUE PROPOSITION CANVAS (VPC): ${productName || 'Skincare Glow Serum'}

## SISI 1: CUSTOMER PROFILE (PROFIL PELANGGAN)
### 1. Customer Jobs (Tugas Pelanggan)
- **Fungsional**: Menyamarkan noda hitam bekas jerawat (PIE/PIH) dan meratakan warna kulit dalam tempo kurang dari 1 bulan.
- **Sosial**: Tampil menawan dan berseri di lingkungan kantor atau pertemanan tanpa dicap "dempul berlebihan".
- **Emosional**: Merasa bangga dengan penampilan diri sendiri dan bebas dari rasa cemas saat bercermin di bawah cahaya terang.

### 2. Customer Pains (Masalah & Ketakutan)
- Kulit terasa perih atau terbakar saat mencoba serum berkonsentrasi tinggi.
- Wajah memerah atau mengalami *purging* berkepanjangan yang memperparah jerawat.
- Uang ratusan ribu terbuang sia-sia untuk produk viral yang tidak memberikan hasil nyata.

### 3. Customer Gains (Harapan & Manfaat Ideal)
- Hasil nyata yang terlihat mulai hari ke-14 pemakaian rutin.
- Tekstur cepat meresap, tidak lengket, dan nyaman dipakai sebelum makeup pagi hari.
- Kepercayaan diri meningkat drastis saat menghadiri acara penting tanpa alas bedak tebal.

---

## SISI 2: VALUE MAP (PETA NILAI PRODUK)
### 1. Products & Services (Fitur Inti)
- Formulasi Niacinamide 10% Pharmaceutical Grade + Tranexamic Acid 3%.
- Watery-gel formulation dengan pH seimbang (5.5) yang ramah untuk skin barrier sensitif.
- Teruji klinis, tersertifikasi BPOM, Halal MUI, dan bebas dari alkohol maupun fragrance sintetis.

### 2. Pain Relievers (Pereda Masalah)
- Menghilangkan risiko perih berkat agen penenang Centella Asiatica & Allantoin konsentrasi tinggi.
- Formula non-comedogenic yang tidak menyumbat pori sehingga aman dari ancaman jerawat batu baru.
- Garansi kepuasan pelanggan dengan jaminan kualitas bahan baku terstandar.

### 3. Gain Creators (Pencipta Manfaat Nyata)
- Menyamarkan noda hitam hingga 80% dalam 14 hari pemakaian rutin pagi dan malam.
- Memberikan kilau sehat (*natural glowing glass skin*) seketika setelah aplikasi.
- Menghemat waktu berdandan di pagi hari hingga 15 menit.

---

## 💎 RINGKASAN INTISARI VPC (BENEFIT, EXPERIENCE, NEED, WANT, FEARS):
- **Fitur**: Niacinamide 10% + Tranexamic Acid 3% + Centella Asiatica, pH 5.5, BPOM & Halal.
- **Benefit**: Memudarkan hiperpigmentasi hingga 80% dalam 14 hari tanpa sensasi perih.
- **Experience**: Tekstur watery-gel yang meresap dalam 15 detik, sejuk, dan tidak lengket di cuaca tropis.
- **Need**: Perawatan noda hitam yang aman bagi skin barrier sensitif.
- **Want**: Wajah glowing sehat alami dan percaya diri tampil tanpa riasan tebal.
- **Fears**: Takut breakout, takut perih, dan takut buang uang untuk produk yang tidak ada hasilnya.
`;
    }

    // =========================================================================
    // 3. TOOL: HYPNOWRITING (SUPER PROMPT 5 FRAMEWORKS)
    // =========================================================================
    else if (toolType === 'hypnowriting') {
      prompt = `
Anda adalah Chief Direct-Response Copywriter & Hypnowriting Master FatherLab kelas dunia.
Tugas Anda adalah membuat 5 Variasi Naskah Iklan Hypnowriting Meta Ads (Facebook & Instagram) berdaya konversi tinggi dengan format Markdown terstruktur:

INFORMASI PRODUK & BRIEF:
- Nama Produk: ${productName || 'Skincare Glow Serum'}
- Target Market: ${targetMarket || 'Wanita 25-35 tahun, ibu rumah tangga, pekerja kantoran'}
- Gaya Bahasa: ${languageStyle || 'Santai, Persuasif, Storytelling Emosional'}
- Jenis Produk: ${productType || 'Produk Fisik'}
- Value Proposition Canvas (VPC): ${vpcData || 'Fitur: Niacinamide 10%, Benefit: Noda pudar 14 hari, Experience: Cepat meresap 15 detik, Need: Kulit sehat, Want: Wajah glowing, Fears: Takut perih & buang uang'}

SUPER PROMPT INSTRUKSI - WAJIB MENG-GENERATE 5 VARIASI FORMAT MARKDOWN:

# ✍️ 5 VARIASI NASKAH IKLAN HYPNOWRITING (META ADS)

### 1. PAS (Problem - Agitate - Solution) + Pattern Interrupt Hook
- **Pattern Interrupt Hook**: [Tulis hook mengejutkan yang menghentikan scroll seketika]
- **Problem**: [Uraikan rasa sakit spesifik yang dirasakan audiens]
- **Agitate**: [Perparah konsekuensi emosional jika masalah ini dibiarkan berlarut-larut]
- **Solution**: [Perkenalkan produk sebagai solusi ilmiah tanpa kompromi]
- **Call To Action (CTA)**: [Instruksi klik yang mendesak]

### 2. BAB (Before - After - Bridge) + Desire / Secret Hook
- **Desire / Secret Hook**: [Hook yang memicu rasa penasaran rahasia transformasi]
- **Before**: [Kondisi frustasi saat ini yang dihadapi audiens]
- **After**: [Gambaran transformasi hidup yang diidamkan]
- **Bridge**: [Produk sebagai jembatan yang membawa mereka ke sana dengan mudah]
- **Call To Action (CTA)**: [Ajakan bertindak]

### 3. AIDA (Attention - Interest - Desire - Action) + Pain / Urgency Hook
- **Attention Hook**: [Hook darurat / urgency yang memicu FOMO]
- **Interest**: [Fakta menarik & cara kerja ilmiah yang mengejutkan]
- **Desire**: [Bukti sosial, testimoni ribuan pelanggan, garansi, dan legalitas BPOM]
- **Action**: [Instruksi checkout jelas dengan limit kuota promo]

### 4. Epiphany Bridge (Storytelling Emosional) + Relatable / Empathy Hook
- **Relatable / Empathy Hook**: [Hook yang membuat audiens merasa "Ini gue banget!"]
- **The Backstory**: [Kisah perjuangan nyata yang relevan]
- **The Epiphany**: [Momen penemuan formula/solusi]
- **The Transformation**: [Hasil nyata dan kebebasan emosional]
- **Call To Action (CTA)**: [Ajakan mencoba perjalanan yang sama]

### 5. 4U (Useful - Urgent - Unique - Ultra-specific) + Benefit-Driven Hook
- **Benefit-Driven Hook**: [Hook langsung ke hasil terbaik tanpa basa-basi]
- **Useful**: [Kegunaan tak terbantahkan bagi hidup pelanggan]
- **Urgent**: [Alasan harus ambil tindakan detik ini juga]
- **Unique**: [Satu hal yang tidak dimiliki kompetitor manapun]
- **Ultra-specific**: [Metrik hari, persentase hasil, dan takaran presisi]
- **Call To Action (CTA)**: [Klik link di bawah sekarang]

Gunakan bahasa Indonesia yang persuasif, tajam, natural, dan siap dipasang langsung di Meta Ads Manager.
`;

      fallbackText = `# ✍️ 5 VARIASI NASKAH IKLAN HYPNOWRITING: ${productName || 'Skincare Glow Serum'}

### 1. PAS (Problem - Agitate - Solution) + Pattern Interrupt Hook
- **Pattern Interrupt Hook**: *Stop beli bedak tebal buat nutupin bekas jerawat! Itu cuma nyembunyiin bom waktu di wajah kamu.*
- **Problem**: Kamu sudah bolak-balik coba berbagai serum viral, tapi noda hitam bekas jerawat masih nongkrong di pipi?
- **Agitate**: Makin sering ditutup concealer tebal tiap pagi, pori-pori makin tersumbat, bakteri makin berkembang biak, dan ujung-ujungnya memicu jerawat baru yang lebih meradang. Berapa lama lagi kamu mau pura-pura percaya diri di depan kamera?
- **Solution**: Kenalkan **${productName || 'FatherLab Glow Serum'}**. Diformulasikan dengan Niacinamide 10% + Tranexamic Acid 3%, bekerja memudarkan hiperpigmentasi langsung di sumber melanin tanpa rasa perih terbakar.
- **Call To Action (CTA)**: 👉 Klik tombol "Beli Sekarang" di bawah dan buktikan perbedaannya dalam 14 hari atau garansi 100%!

### 2. BAB (Before - After - Bridge) + Desire / Secret Hook
- **Desire / Secret Hook**: *Rahasia kulit bening mulus wanita karir tanpa harus bayar laser klinik jutaan rupiah tiap bulan.*
- **Before**: Dulu tiap mau keluar rumah atau ketemu pasangan selalu buru-buru cek cermin dengan rasa cemas. Noda hitam bekas jerawat tahun lalu bikin wajah terlihat kusam dan lelah.
- **After**: Sekarang, bangun pagi langsung percaya diri. Kulit terasa kenyal, noda hitam tersamarkan, dan bebas keluar rumah tanpa alas bedak tebal.
- **Bridge**: Kuncinya ada di 3 tetes rutin **${productName || 'FatherLab Glow Serum'}** setiap malam. Penetrasi molekul ultra-ringan yang bekerja saat kamu tidur pulas.
- **Call To Action (CTA)**: Dapatkan promo eksklusif Beli 1 Gratis 1 hari ini sebelum kuota 50 botol habis!

### 3. AIDA (Attention - Interest - Desire - Action) + Pain / Urgency Hook
- **Attention Hook**: *PERINGATAN: Promo 24 Jam Terakhir Khusus Batch Produksi Pertama!*
- **Interest**: Tahukah kamu? 82% serum di pasaran hanya bekerja di permukaan kulit. FatherLab menggunakan teknologi Liposomal Delivery System yang membawa zat aktif 5x lebih dalam langsung ke pusat melanin.
- **Desire**: 1.250+ ulasan bintang 5 membuktikan: 9 dari 10 pengguna melihat noda bekas jerawat tersamar jelas dalam 14 hari pemakaian. Terdaftar resmi di BPOM dan Halal MUI.
- **Action**: Klik link di bawah sekarang juga untuk klaim subsidi gratis ongkir seluruh Indonesia!

### 4. Epiphany Bridge + Relatable / Empathy Hook
- **Relatable / Empathy Hook**: *"Dulu aku kira bekas jerawat ini kutukan permanen yang nggak bakal bisa hilang..."*
- **The Backstory**: Aku pernah di posisi kamu. Menghabiskan gaji bulanan untuk berbagai krim dokter dan perawatan klinik yang hasilnya cuma bertahan seminggu, lalu jerawat kembali meradang.
- **The Epiphany**: Sampai akhirnya dokter dermatologi menjelaskan bahwa masalahnya bukan pada jerawatnya, tapi pada sel melanosit yang overaktif karena peradangan yang tidak ditenangkan dengan benar.
- **The Transformation**: Begitu beralih ke formula penenang Niacinamide + Tranexamic Acid dari FatherLab, tekstur kulit pulih total dalam tempo 3 minggu. Kulit kembali bersih, sehat, dan percaya diri pulih 100%.
- **Call To Action (CTA)**: Jangan biarkan noda hitam menahan potensimu. Pesan sekarang melalui link resmi FatherLab!

### 5. 4U (Useful - Urgent - Unique - Ultra-specific) + Benefit-Driven Hook
- **Benefit-Driven Hook**: *Pudarkan 80% noda hitam membandel dalam 14 hari tanpa rasa perih dan tanpa pengelupasan kulit.*
- **Useful**: Mengembalikan kecerahan alami kulit dan memperkuat skin barrier dari polusi perkotaan.
- **Urgent**: Slot promo subsidi batch ini tersisa 37 paket untuk pengiriman hari ini.
- **Unique**: Satu-satunya serum dengan formulasi Dual Melano-Blocker yang bebas alkohol, fragrance, dan paraben.
- **Ultra-specific**: Cukup 3 tetes pagi dan malam, hemat hingga 45 hari pemakaian per botol.
- **Call To Action (CTA)**: Klik pesan sekarang dan amankan paket hematmu sebelum kehabisan!
`;
    }

    // =========================================================================
    // 4. TOOL: NARASI KONTEN (v2.00 - Road to 100 Juta Edition)
    // =========================================================================
    else if (toolType === 'narasi-konten') {
      const stylesStr = Array.isArray(languageStyles) && languageStyles.length > 0 
        ? languageStyles.join(', ') 
        : 'Persuasif, Santai';

      prompt = `
Anda adalah Chief Video Creative Director FatherLab ("Road to 100 Juta Edition").
Tulis SKRIP NARASI VIDEO IKLAN META (Reels / TikTok / Feed 9:16) berdaya konversi tinggi berdasarkan data berikut:

INFORMASI INPUT:
- Nama Produk: ${productName || 'CCTV Luminox 360'}
- Kategori: ${category || 'Elektronik / Keamanan'}
- Value Proposition Canvas (VPC): ${vpcData || 'Fitur unggulan, pereda masalah, dan manfaat nyata'}
- Durasi Video: ${videoDuration || '30 Detik (Standard Meta Ads)'}
- Formula / Struktur: ${formula || 'PAS (Problem - Agitate - Solution)'}
- Hook Opening: ${hookType || 'Pattern Interrupt (Mengejutkan & Hentikan Scroll)'}
- CTA (Call to Action): ${ctaType || 'Klik Link di Bawah (Pesan Sekarang)'}
- Gaya Bahasa: ${stylesStr}
- Tahap Funnel: ${funnelStage || 'TOFU (Top of Funnel - Cold Traffic)'}
- Catatan Tambahan: ${additionalNotes || 'Fokus ke hasil nyata dan promo eksklusif'}

FORMAT OUTPUT WAJIB (Gunakan Markdown terstruktur rapi):
# 🎬 SKRIP NARASI KONTEN: ${productName || 'PRODUK'} (v2.00 - Road to 100 Juta Edition)
**Formula**: ${formula || 'PAS'} | **Durasi**: ${videoDuration || '30s'} | **Funnel**: ${funnelStage || 'TOFU'} | **Gaya**: ${stylesStr}

## ⚡ 1. 3 PILIHAN HOOK PEMBUKA (0 - 3 DETIK PERTAMA)
- **Hook 1 (Visual Shock / Pattern Interrupt)**: [Aksi visual mencengangkan + Audio penghenti scroll]
- **Hook 2 (Pain Relatable / Menampar Realita)**: [Pertanyaan tajam yang menyentuh ketakutan terbesar audiens]
- **Hook 3 (Curiosity / Rahasia Tersembunyi)**: [Kalimat misteri yang memaksa audiens menonton sampai detik terakhir]

## 📋 2. BREAKDOWN SKENARIO & TABEL STORYBOARD
| Detik | Visual Scene (Tampilan Kamera) | Voiceover / Audio (Narasi Talent) | Text on Screen (Teks Layar) |
|---|---|---|---|
| 00 - 03 | [Hook Scene: Close-up aksi/masalah] | "[Kalimat pembuka hook]" | **[TEKS BOLD KAPITAL]** |
| 03 - 10 | [Agitation Scene: Wajah cemas / bukti masalah] | "[Uraikan rasa sakit & frustasi]" | [Poin masalah utama] |
| 10 - 20 | [Solution Demo: Tunjukkan produk & unboxing] | "[Perkenalkan produk & fitur kunci]" | [Fitur unggulan produk] |
| 20 - 28 | [Transformation & Proof: Hasil nyata & rasa lega] | "[Buktikan manfaat VPC & keunggulan]" | [Garansi & BPOM/Hasil] |
| 28 - 30 | [Closer Scene: Produk + CTA mendesak] | "[${ctaType || 'Klik tombol di bawah sekarang!'}]" | **[PROMO & CTA KLIK]** |

## 🎙️ 3. CATATAN PRODUKSI & AUDIO DIRECTING
- **Rekomendasi BGM / Sound Effect**: [Jenis beat, sound whoosh, sfx pop]
- **Pacing & Tone Suara Talent**: [Cepat & bertenaga di 3 detik awal, empati saat membahas masalah, antusias saat demo]
- **Visual Hooks**: [Arahan kamera 9:16 vertical, ringlight natural]
`;

      fallbackText = `# 🎬 SKRIP NARASI KONTEN: ${productName || 'CCTV Luminox 360'} (v2.00 - Road to 100 Juta Edition)
**Formula**: ${formula || 'PAS (Problem - Agitate - Solution)'} | **Durasi**: ${videoDuration || '30 Detik'} | **Funnel**: ${funnelStage || 'TOFU'} | **Gaya**: ${stylesStr}

## ⚡ 1. 3 PILIHAN HOOK PEMBUKA (0 - 3 DETIK PERTAMA)
- **Hook 1 (Pattern Interrupt / Shock)**: [Talent menatap kamera dengan ekspresi tegang] *"Stop scrolling! Anda yakin rumah Anda aman saat ditinggal mudik atau kerja lembur?"*
- **Hook 2 (Pain Relatable)**: [Visual rekaman buram CCTV murahan vs rumah gelap] *"Beli CCTV murah tapi pas dicek rekamannya buram dan blind spot-nya banyak? Itu sama aja buang uang!"*
- **Hook 3 (Curiosity / Rahasia)**: [Talent menunjukkan kamera mini berputar 360 derajat] *"Ini teknologi CCTV tanpa kabel yang bikin maling mikir 10x sebelum mendekati pagar rumah Anda!"*

## 📋 2. BREAKDOWN SKENARIO & TABEL STORYBOARD
| Detik | Visual Scene (Tampilan Kamera) | Voiceover / Audio (Narasi Talent) | Text on Screen (Teks Layar) |
|---|---|---|---|
| 00 - 03 | Talent menatap cermin/smartphone dengan ekspresi was-was | "Stop scrolling! Yakin rumah Anda sudah aman saat ditinggal kosong seharian?" | **RUMAH ANDA YAKIN AMAN?** |
| 03 - 09 | Kamera memperlihatkan sudut gelap ruangan / rumah dari luar | "Banyak yang baru nyesel pas barang berharga hilang, baru sadar CCTV lama rekamannya pecah." | **Jangan tunggu kejadian! 🚨** |
| 09 - 18 | Talent unboxing & memutar ${productName || 'Luminox 360'} | "Untung sekarang ada ${productName || 'Luminox 360'}. Putar 360° otomatis mengikuti gerakan, resolusi Ultra HD!" | **Putar 360° + Ultra HD** |
| 18 - 25 | Demonstrasi Night Vision warna di ruangan gelap total | "Bahkan di malam hari gelap gulita, gambarnya tetap berwarna terang. Pasangnya gampang, tinggal colok lampu." | **Night Vision Berwarna 🌙** |
| 25 - 30 | Talent tersenyum memegang produk + promo box diskon | "${ctaType || 'Klik link di bawah sekarang!'} Dapatkan diskon 45% dan garansi ganti baru khusus hari ini!" | **PROMO SPESIAL HARI INI 👉** |

## 🎙️ 3. CATATAN PRODUKSI & AUDIO DIRECTING
- **Rekomendasi BGM**: Tension bass kick di 3 detik awal, beralih ke uplifting modern electronic beat saat solusi muncul.
- **Tone Suara Talent**: Waspada dan tegas di pembuka, lalu solutif dan meyakinkan di bagian demo.
`;
    }

    // =========================================================================
    // 5. TOOL: LANDING PAGE BUILDER (SINTESIS PERSONA, VPC & HYPNOWRITING)
    // =========================================================================
    else if (toolType === 'lp-builder') {
      prompt = `
Anda adalah World-Class Direct-Response Copywriter & Conversion Rate Optimization (CRO) Architect FatherLab.
Tugas Anda adalah merancang dan menyusun NASKAH LANDING PAGE LENGKAP BERDAYA KONVERSI TINGGI DENGAN HOOK MEMATIKAN ("Deadly Hook") dengan menggabungkan dan mensintesis hasil riset sebelumnya:
1. Buyer Persona (Karakter, Pain Point, Ketakutan, Impian & Triggers)
2. Value Proposition Canvas (Fitur teknis, Benefit emosional, Experience, Need, Want & Fears)
3. Hypnowriting Winning Angles (PAS, BAB, AIDA, Epiphany Bridge, Hook Penghenti Scroll)

DATA INPUT & SINTESIS RISET:
- Nama Produk: ${productName || 'Anti-Acne Clarifying Serum 30ml'}
- Kategori / Niche: ${category || 'Skincare / Perawatan Kulit'}
- Harga Jual: ${price || 'Rp 149.000'}
- Penawaran Utama (Offer): ${offer || 'Promo Diskon 50% + Garansi 30 Hari Uang Kembali'}
- Riset Buyer Persona: ${personaData || 'Pria & Wanita 20-35 tahun yang frustasi dengan bekas jerawat membandel dan ingin tampil percaya diri saat meeting tanpa filter.'}
- Riset VPC: ${vpcData || 'Fitur Niacinamide 10% + Tranexamic 3% tanpa rasa perih atau purging, memudarkan noda hingga 80% dalam 14 hari.'}
- Riset Hypnowriting & Angle: ${hypnowritingData || 'Pattern Interrupt & Epiphany Bridge: Menghentikan kebiasaan menutupi noda dengan dempul tebal.'}
- Strategi Hook Mematikan: ${hookStrategy || 'Pattern Interrupt (Hentikan Kebiasaan & Bongkar Mitos)'}
- Target Platform CMS: ${targetPlatform || 'Universal (Berdu, OrderOnline, Elementor)'}

INSTRUKSI PENULISAN:
- Buat naskah landing page yang mengalir dari baris pembuka hingga penutup secara lengkap dan menyeluruh.
- Gunakan bahasa Indonesia direct-response yang menusuk rasa sakit (agitation), menghadirkan harapan transformasi nyata (desire), membeberkan mekanisme unik ilmiah (mechanism), dan menghilangkan seluruh keraguan pembeli dengan garansi tak terbantahkan.
- Format teks harus bersih, terstruktur rapi, siap dipasang di page builder, serta memuat arahan visual visualizer.

FORMAT OUTPUT WAJIB (Markdown Terstruktur):
# 🚀 HIGH-CONVERTING LANDING PAGE: ${productName || 'PRODUK'}
*Strategi: Direct-Response CRO + Hook Mematikan (Sintesis Persona, VPC & Hypnowriting)*

---

### [SECTION 1: TOP URGENCY / ANNOUNCEMENT BAR]
- **Teks Ticker**: ⚡ FLASH SALE HARI INI: Subsidi Bebas Ongkir Seluruh Indonesia + Diskon Spesial 50% Khusus 30 Paket Pertama!
- **Countdown Timer**: 02:45:12 (Pemberitahuan slot tersisa terbatas)

---

### [SECTION 2: ABOVE THE FOLD (HERO SECTION) - HOOK MEMATIKAN]
- **Audience Pre-Headline**: Khusus Pria & Wanita yang Lelah Gonta-Ganti Skincare Tapi Bekas Jerawat Tetap Menghitam...
- **Main Headline (Deadly Hook)**: [Headline provokatif berdaya hipnosis tinggi yang menghentikan kebiasaan salah audiens dan menawarkan transformasi nyata]
- **Sub-Headline (Unique Mechanism)**: [Penjelasan ilmiah sederhana bagaimana produk mengatasi akar masalah tanpa efek samping merugikan]
- **Visual Mockup Direction**: [Foto produk botol premium berembun, badge BPOM/Halal MUI, stiker Garansi 30 Hari & Before-After 14 Hari]
- **Primary CTA Button**: 👉 [YA! SAYA MAU KULIT BERSIH TANPA NODA (KLAIM DISKON 50%)]
- **Micro-Copy Trust Element**: ✓ 100% Original BPOM • ✓ Garansi 30 Hari Uang Kembali • ✓ Bisa Bayar di Tempat (COD)

---

### [SECTION 3: PAIN AGITATION & THE REAL ENEMY (MENUSUK RASA SAKIT)]
- **Opening Agitator ("Pernahkah Anda Mengalami Ini?")**: [Ceritakan 3 adegan nyata yang relatable saat persona bercermin, meeting offline, atau ditatap orang lain]
- **3 Tanda Masalah Anda Semakin Kritis**:
  1. [Rasa perih dan makin rusaknya skin barrier]
  2. [Rasa malu dan ketergantungan pada filter kamera / concealer tebal]
  3. [Uang ratusan ribu hingga jutaan rupiah terbuang sia-sia untuk produk tanpa hasil]
- **Mengapa Produk Lain di Luar Sana Gagal?**: [Bongkar mitos produk pasaran yang cuma bekerja di permukaan kulit dan tidak menembus sel melanosit]

---

### [SECTION 4: THE EPIPHANY BRIDGE & THE NEW MECHANISM]
- **The Turning Point**: [Kisah terobosan formulasi yang meruntuhkan keyakinan salah di industri]
- **Memperkenalkan Solusi**: [Memperkenalkan nama produk secara megah]
- **3 Tahap Kerja Cerdas**:
  - *Tahap 1: Calming & Anti-Inflammatory (Menenangkan peradangan dalam 48 jam)*
  - *Tahap 2: Melano-Blocker (Menghambat transfer pigmen gelap ke permukaan)*
  - *Tahap 3: Barrier Regeneration (Mengunci kelembapan & meratakan tekstur kulit)*

---

### [SECTION 5: VALUE PROPOSITION & EMOTIONAL BENEFIT MATRIX (VPC INTEGRATION)]
| Fitur Unggulan Produk | Keuntungan Fungsional (Benefit) | Dampak Emosional Bagi Hidup Anda (Experience) |
|---|---|---|
| [Fitur Kunci 1 dari VPC] | [Manfaat logis terukur] | [Rasa percaya diri tanpa rasa cemas] |
| [Fitur Kunci 2 dari VPC] | [Bebas iritasi & rasa perih] | [Ketenangan pikiran & kepuasan bercermin] |
| [Fitur Kunci 3 dari VPC] | [Hasil cepat terlihat dalam 14 hari] | [Pujian nyata dari pasangan / rekan kerja] |

---

### [SECTION 6: SOCIAL PROOF & REAL TRANSFORMATION]
- **Kisah Transformasi 1 (Pelanggan Utama)**: "Dulu sebelum meeting selalu panik tutupi bekas jerawat pakai foundation 2 layer. Setelah 2 minggu pakai ini rutin, noda memudar drastis dan sekarang cukup pakai sunscreen!"
- **Kisah Transformasi 2 (Kasus Kronis)**: "Awalnya skeptis karena sering boncos beli skincare mahal. Tapi serum ini beda banget, nggak perih sama sekali dan bekas jerawat hitam di dagu hilang."
- **Statistik Klinis**: 94% Pengguna menyatakan tekstur kulit lebih halus dalam 7 hari • 89% Melihat noda hitam tersamarkan signifikan dalam 14 hari.

---

### [SECTION 7: IRRESISTIBLE OFFER & VALUE STACKING]
- **Paket 1: Starter Pack (1 Unit)**: Harga Coret Rp 299.000 -> **Rp ${price || '149.000'}** (Diskon 50%)
- **Paket 2: BEST SELLER - Intensive Brightening (Beli 2 Unit)**: Harga Coret Rp 598.000 -> **Rp 249.000** (+ Bonus Pouch Eksklusif + Bebas Ongkir)
- **Paket 3: Complete Transformation (Beli 3 Unit)**: Harga Coret Rp 897.000 -> **Rp 329.000** (+ Gratis Facial Foam + VIP Konsultasi)
- **Total Nilai Tambahan**: Bernilai lebih dari Rp 450.000 diberikan Cuma-Cuma untuk pesanan hari ini.

---

### [SECTION 8: 100% ZERO-RISK GUARANTEE (GARANSI BEBAS RISIKO)]
- **Segel Garansi**: 🛡️ JAMINAN 30 HARI UANG KEMBALI 100% TANPA TANYA
- **Pernyataan Komitmen**: Jika dalam 30 hari pemakaian rutin Anda merasa produk ini tidak memberikan perubahan positif pada kulit Anda, hubungi tim CS kami dan kirimkan botolnya kembali. Kami kembalikan 100% uang Anda tanpa potongan dan tanpa pertanyaan berbelit-belit! Seluruh risiko ada di pundak kami.

---

### [SECTION 9: CLOSING ACTION CTA & OBJECTION BUSTER FAQ]
- **Headline Penutup**: Keputusan Ada di Tangan Anda: Tetap Sembunyi di Balik Filter, Atau Tampil Percaya Diri dengan Kulit Bersih Mulai Hari Ini?
- **Tombol Final Order**: 👉 [KLIK DI SINI UNTUK AMBIL PROMO SUBSIDI ONGKIR SEKARANG]
- **FAQ Pembunuh Keraguan**:
  - *Q: Apakah sudah BPOM dan aman untuk kulit sensitif?* -> Jawab: 100% Resmi BPOM, Halal MUI, dan hypoallergenic tanpa alkohol.
  - *Q: Berapa lama estimasi pengiriman?* -> Jawab: Pesanan sebelum jam 15:00 dikirim hari yang sama. Estimasi 1-3 hari kerja.
  - *Q: Apakah bisa Bayar di Tempat (COD)?* -> Jawab: Ya! Anda bisa bayar tunai ke kurir saat barang sampai di tangan Anda.
  - *Q: Bagaimana cara klaim garansi?* -> Jawab: Cukup chat nomor WhatsApp CS kami yang tertera di kemasan dengan nomor pesanan Anda.
`;

      fallbackText = `# 🚀 HIGH-CONVERTING LANDING PAGE: ${productName || 'Anti-Acne Clarifying Serum 30ml'}
*Strategi: Direct-Response CRO + Hook Mematikan (Sintesis Persona, VPC & Hypnowriting)*

---

### [SECTION 1: TOP URGENCY / ANNOUNCEMENT BAR]
⚡ **PEMBERITAHUAN DARURAT BATCH PRODUKSI**: Promo Subsidi Bebas Ongkir Seluruh Indonesia + Diskon 50% Khusus Hari Ini Tersisa **19 Paket Terakhir**!
*Countdown: 02:34:11*

---

### [SECTION 2: ABOVE THE FOLD (HERO SECTION) - HOOK MEMATIKAN]
**Pre-Headline**: *Khusus Pria & Wanita 20-35 Tahun yang Frustasi dengan Noda Jerawat Menahun...*

# Hentikan Kebiasaan "Mendempul" Bekas Jerawat dengan Bedak Tebal! Itu Cuma Menyembunyikan Bom Waktu di Kulit Wajah Anda.

**Sub-Headline**: 
Pudarkan hingga 80% noda hitam membandel dalam 14 hari dengan penetrasi ganda *Niacinamide 10% + Tranexamic Acid 3%* langsung ke sumber melanin, tanpa rasa perih, tanpa pengelupasan, dan tanpa ketergantungan.

**[ARAHAN VISUAL HERO]**: 
Foto botol serum premium berembun sejuk dengan pantulan cahaya elegan, didampingi stiker segel emas *"Teruji Dermatologi & BPOM"* serta perbandingan Before-After real 14 hari di sebelah kanan.

👉 **[AMBIL PROMO DISKON 50% & KLAIM BEBAS ONGKIR SEKARANG]**
*(Tombol Hijau Pulsing Glow - Klik Otomatis Scroll ke Form Pemesanan)*

🔒 *Garansi 30 Hari Uang Kembali 100% • 100% BPOM Resmi • Tersedia Bayar di Tempat (COD)*

---

### [SECTION 3: PAIN AGITATION (MENUSUK RASA SAKIT AUDIENS)]
### "Pernahkah Anda Mengalami Momen Menyebalkan Seperti Ini?"

- **Momen 1**: Setiap kali mau meeting penting atau kencan, Anda harus menghabiskan 30 menit ekstra hanya untuk menutupi bintik hitam dengan concealer tebal.
- **Momen 2**: Saat ada orang yang menatap wajah Anda dari jarak dekat, jantung berdegup kencang dan Anda refleks memalingkan wajah karena minder.
- **Momen 3**: Mengambil foto selfie sampai 15 kali, tapi akhirnya tetap harus dipoles pakai filter blur sebelum berani diunggah ke media sosial.

**Fakta Menyakitkan Yang Jarang Diungkap**:
Semakin tebal Anda menutupi noda dengan makeup sintetis, pori-pori Anda semakin tersumbat. Minyak alami terjebak, bakteri berkembang biak 3x lebih cepat, dan akhirnya memicu jerawat baru yang meninggalkan noda yang jauh lebih gelap. Berapa lama lagi Anda mau terjebak di lingkaran setan ini?

---

### [SECTION 4: THE EPIPHANY BRIDGE & THE NEW MECHANISM]
### Solusinya Bukan "Menutupi", Tapi Mematikan Produksi Melanin di Tingkat Sel!

Dermatolog kami menemukan bahwa 85% serum pencerah di pasaran gagal karena molekulnya terlalu besar sehingga hanya mengendap di lapisan epidermis terluar.

Kenalkan **${productName || 'Anti-Acne Clarifying Serum 30ml'}** dengan teknologi *Liposomal Deep-Penetration*:

1. **Detik ke-15**: Formula langsung diserap hingga lapisan dermal tanpa meninggalkan residu lengket.
2. **Hari ke-3**: Meredakan mikronutrisi peradangan kemerahan bekas jerawat aktif.
3. **Hari ke-7**: Tranexamic Acid aktif mengunci enzim tirosinase agar tidak memproduksi pigmen hitam baru.
4. **Hari ke-14**: Lapisan sel kulit baru yang cerah merata naik ke permukaan, menggantikan noda hitam lama.

---

### [SECTION 5: VALUE PROPOSITION CANVAS (VPC) BENEFIT MATRIX]
| Fitur Formulasi (Spesifikasi) | Manfaat Logis Terukur | Dampak Emosional Sehari-hari |
|---|---|---|
| Niacinamide 10% Pharmaceutical Grade | Memperbaiki tekstur kulit 2x lebih cepat | Wajah terasa halus kenyal saat disentuh |
| Tranexamic Acid 3% Nano-Encapsulated | Memudarkan hiperpigmentasi membandel | Bebas dari rasa cemas saat meeting jarak dekat |
| 0% Alkohol, 0% Fragrance, 0% Paraben | Tanpa rasa perih, panas, atau iritasi | Tidur nyenyak tanpa rasa gatal atau perih |
| Tekstur Water-Gel Ultra-Light | Menyerap tuntas dalam hitungan detik | Rutinitas praktis, tidak bikin wajah berminyak |

---

### [SECTION 6: SOCIAL PROOF & BUKTI TRANSFORMASI NYATA]
⭐️⭐️⭐️⭐️⭐️ **98.4% Tingkat Kepuasan Pelanggan (1.420+ Ulasan Terverifikasi)**

- **Amanda R. (28 tahun, Corporate Lawyer - Jakarta)**:  
  *"Pekerjaan saya mengharuskan bertemu klien tiap hari. Dulu bekas jerawat bikin saya merasa nggak kompeten. Pakai serum ini baru 10 hari noda hitam di pipi pudar drastis! Sekarang ke kantor cukup pakai sunscreen aja. Game changer banget!"*

- **Bima K. (25 tahun, Content Creator - Bandung)**:  
  *"Awalnya males pakai skincare karena takut lengket dan bikin wajah berminyak di depan ringlight. Tapi serum ini beneran seringan air, cepat meresap, dan bekas jerawat hilang dalam 2 minggu. Rekomen parah buat cowok!"*

---

### [SECTION 7: IRRESISTIBLE OFFER & PILIHAN PAKET]
*Harga Kembali Normal Setelah Periode Promo Ini Berakhir*

#### 🥉 PAKET 1: STARTER PACK (1 BOTOL 30ml)
- Cukup untuk pemakaian rutin 30 hari
- Harga Normal: ~~Rp 298.000~~
- **Harga Promo Hari Ini: Rp ${price || '149.000'}** *(Hemat 50%)*
- [PILIH PAKET 1 - COD TERSEDIA]

#### 🥇 PAKET 2: BEST VALUE - REKOMENDASI DOKTER (BELI 2 GRATIS 1 BOTOL)
- Paket Perawatan Lengkap 90 Hari (Rekomendasi Siklus Kulit)
- Harga Normal: ~~Rp 894.000~~
- **Harga Promo Hari Ini: Rp 269.000** *(Hemat Rp 625.000!)*
- 🎁 **BONUS GRATIS**: Pouch Kosmetik Waterproof + Ebook Panduan Diet Kulit Bebas Jerawat (Senilai Rp 150.000)
- 🚚 **SUBSIDI GRATIS ONGKIR SELURUH INDONESIA**
- [👉 AMBIL PAKET 2 SEKARANG - PALING LARIS]

---

### [SECTION 8: GARANSI 30 HARI 100% TANPA RISIKO]
🛡️ **KOMITMEN FATHERLAB KEPADA ANDA:**  
Kami begitu yakin dengan khasiat formula ini. Karena itu, kami memberikan jaminan:  
*Gunakan produk ini secara rutin setiap hari selama 30 hari. Jika Anda tidak melihat noda bekas jerawat Anda memudar secara nyata, cukup kirimkan botolnya kembali ke alamat kami. Kami akan kembalikan 100% uang Anda tanpa potongan biaya admin dan tanpa pertanyaan berbelit-belit!*  
**Anda tidak menanggung risiko apapun.**

---

### [SECTION 9: CLOSING CTA & FAQ OBJECTION BUSTER]
### Waktu Terbaik Untuk Mengambil Keputusan Adalah Hari Ini!

👉 **[KLIK DI SINI UNTUK PESAN & AMANKAN PROMO DISKON 50%]**  
*(Proses Cepat: Cukup Isi Nama & Alamat, Barang Langsung Dikirim Hari Ini)*

#### Pertanyaan Yang Sering Ditanyakan (FAQ):
- **Q: Apakah produk ini sudah resmi terdaftar di BPOM?**  
  *A: Ya, 100% resmi terdaftar di BPOM RI dan tersertifikasi Halal MUI. Nomor registrasi tertera jelas di setiap kotak kemasan.*
- **Q: Apakah aman untuk kulit sensitif dan ibu hamil/menyusui?**  
  *A: Formulasi kami bebas alkohol, pewangi, dan bahan keras. Aman untuk kulit sensitif. Untuk bumil/busui, konsultasikan dengan dokter kandungan Anda.*
- **Q: Bagaimana jika barang rusak saat pengiriman?**  
  *A: Kami ganti 100% baru gratis tanpa biaya tambahan, cukup kirimkan video unboxing singkat.*
- **Q: Apakah bisa bayar tunai di tempat (COD)?**  
  *A: Tentu saja bisa! Anda cukup bayar saat kurir mengantarkan paket ke depan pintu rumah Anda.*
`;
    }
      prompt = `Anda adalah Pakar Marketing FatherLab. Buat konten berkualitas tinggi untuk ${productName || 'Produk'}.`;
      fallbackText = `# KONTEN FATHERLAB UNTUK ${productName || 'PRODUK'}\n\nKonten berhasil digenerate.`;
    }

    // =========================================================================
    // STREAMING INFERENCE: GOOGLE GEN AI SDK (GEMINI 1.5 PRO)
    // Calling ai.models.generateContentStream()
    // =========================================================================
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Panggil Google Gen AI SDK (Gemini 1.5 Pro) dengan generateContentStream()
        const responseStream = await ai.models.generateContentStream({
          model: 'gemini-1.5-pro',
          contents: prompt,
          config: {
            temperature: 0.75,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of responseStream) {
                if (chunk.text) {
                  controller.enqueue(encoder.encode(chunk.text));
                }
              }
              controller.close();
            } catch (streamErr) {
              controller.error(streamErr);
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (sdkError) {
        console.error('Google GenAI SDK call error, falling back to REST streaming:', sdkError);
        // Fallback to direct REST SSE streaming if SDK hits edge env barrier
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?alt=sse&key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.75,
              topP: 0.95,
              maxOutputTokens: 4096,
            }
          })
        });

        if (!geminiRes.ok) {
          const errorText = await geminiRes.text();
          return new Response(JSON.stringify({ error: `Gemini API error: ${errorText}` }), {
            status: geminiRes.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const transformStream = new TransformStream({
          async transform(chunk, controller) {
            const text = decoder.decode(chunk, { stream: true });
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr) {
                  try {
                    const data = JSON.parse(jsonStr);
                    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (candidateText) {
                      controller.enqueue(encoder.encode(candidateText));
                    }
                  } catch {
                    // Ignore JSON parse errors on partial chunks
                  }
                }
              }
            }
          }
        });

        return new Response(geminiRes.body.pipeThrough(transformStream), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }
    }

    // =========================================================================
    // LOCAL DEV / DEMO FALLBACK: Word-by-word real-time simulation
    // =========================================================================
    const encoder = new TextEncoder();
    const words = fallbackText.split(' ');
    let index = 0;

    const stream = new ReadableStream({
      async start(controller) {
        function push() {
          if (index < words.length) {
            const chunk = words.slice(index, index + 4).join(' ') + ' ';
            index += 4;
            controller.enqueue(encoder.encode(chunk));
            setTimeout(push, 25);
          } else {
            controller.close();
          }
        }
        push();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
