// src/utils/geminiClient.js
// Client-side fallback for Google Gemini API streaming
// Digunakan saat serverless function /api/generate-copy tidak tersedia (misal di local Vite dev)

export async function generateGeminiDirect(payload, apiKey, onChunk) {
  if (!apiKey) {
    throw new Error('Gemini API Key belum dikonfigurasi di menu Settings.');
  }

  const { tool, productName, price, cogs, audience, usp, angle, hookStrategy } = payload;

  let systemInstruction = `Kamu adalah Chief Creative Copywriter dan Konsultan Direct-Response Advertising Meta Ads kelas dunia.
Tugasmu adalah menghasilkan output copywriting/riset berbahasa Indonesia dengan gaya persuasif, tajam, berorientasi konversi tinggi, dan hipnotik.
Gunakan format Markdown bersih, profesional, terstruktur, dan siap pakai.`;

  let userPrompt = '';

  if (tool === 'buyer-persona') {
    userPrompt = `Buatkan 3 profil Buyer Persona yang mendalam dan tajam untuk produk berikut:
Produk: ${productName}
Harga Jual: Rp ${Number(price || 0).toLocaleString('id-ID')}
Target Audience: ${audience || 'Umum Indonesia'}
USP: ${usp || '-'}

Setiap persona harus mencakup:
1. Demografi & Profil Singkat
2. Deep Pain Points (Ketakutan terbesar, rasa frustrasi terdalam)
3. Secret Desires (Keinginan tersembunyi yang ingin dicapai)
4. Trigger Emosional & Alasan Utama Membeli
5. Hook Kalimat Pembuka yang Mematikan untuk Iklan Meta Ads.`;

  } else if (tool === 'vpc') {
    userPrompt = `Susun Value Proposition Canvas (VPC) komprehensif untuk produk:
Produk: ${productName}
Harga Jual: Rp ${Number(price || 0).toLocaleString('id-ID')}
Keunggulan / USP: ${usp || '-'}

Formatkan menjadi 2 bagian besar:
BAGIAN 1: CUSTOMER PROFILE
- Customer Jobs (Tugas fungsional, sosial, dan emosional)
- Pains (Masalah, hambatan, risiko, rasa sakit hati)
- Gains (Hasil yang diharapkan dan diimpikan)

BAGIAN 2: VALUE MAP
- Products & Services (Fitur utama penawaran)
- Pain Relievers (Bagaimana produk melenyapkan pains di atas)
- Gain Creators (Bagaimana produk menciptakan hasil impian).`;

  } else if (tool === 'hypnowriting') {
    userPrompt = `Buatkan 5 variasi naskah iklan Meta Ads (Hypnowriting) dengan sudut pandang "${angle || 'Emosional'}" untuk produk:
Produk: ${productName}
Harga: Rp ${Number(price || 0).toLocaleString('id-ID')}
Target Audience: ${audience || 'Direct Response Buyer'}
USP: ${usp || '-'}

Gunakan 5 formula copywriting direct-response berikut:
1. FORMULA PAS (Problem - Agitate - Solution)
2. FORMULA BAB (Before - After - Bridge)
3. FORMULA AIDA (Attention - Interest - Desire - Action)
4. FORMULA EPIPHANY BRIDGE (Kisah titik balik emosional)
5. FORMULA 4U (Urgent - Unique - Ultra-specific - Useful).
Setiap variasi harus menyertakan Headline, Primary Text, dan Call To Action (CTA).`;

  } else if (tool === 'narasi-konten') {
    userPrompt = `Buatkan skrip narasi video iklan Meta Ads (Reels / TikTok / Short Video) berdurasi 30-45 detik dengan gaya "Road to 100 Juta Edition" untuk produk:
Produk: ${productName}
USP: ${usp || '-'}
Audience: ${audience || 'Umum'}

Struktur skrip:
- Detik 0-3: Pattern Interrupt & Visual Hook (Wajib menghentikan jempol yang scrolling)
- Detik 4-15: Agitasi Masalah & Relatability
- Detik 16-30: Pengenalan Solusi & Demo Keunggulan Unik (Proof & Mechanism)
- Detik 31-40: Penawaran Terbatas & Call To Action (CTA)`;

  } else if (tool === 'lp-builder') {
    userPrompt = `Rancang naskah copywriting Landing Page lengkap berkonversi tinggi dengan strategi "${hookStrategy || 'Shocking Reversal Hook'}" untuk produk:
Produk: ${productName}
Harga: Rp ${Number(price || 0).toLocaleString('id-ID')}
USP: ${usp || '-'}

Struktur Landing Page:
1. HERO SECTION (Pre-headline, Main Headline Mematikan, Sub-headline, CTA Button, Social Proof)
2. PROBLEM AGITATION (3 Pain Points utama yang menusuk emosi pembaca)
3. SOLUTION & UNIQUE MECHANISM (Kenapa produk ini berhasil saat yang lain gagal)
4. PRODUCT DETAIL & BENEFIT BREAKDOWN (Fitur diterjemahkan menjadi pengalaman emosional)
5. TESTIMONIAL & SOCIAL PROOF (3 ulasan pelanggan otentik)
6. OFFER STACK & PRICING (Penawaran spesial, bonus nilai tambah, urgensi)
7. RISK REVERSAL (Garansi kepuasan)
8. FAQ (5 Pertanyaan yang sering diajukan & jawaban pembunuh keraguan)
9. FINAL CALL TO ACTION (Desakan penutup).`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google AI API Error (${response.status}): ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.replace('data: ', '').trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const candidate = parsed.candidates?.[0];
          const textPart = candidate?.content?.parts?.[0]?.text;
          if (textPart && onChunk) {
            onChunk(textPart);
          }
        } catch (e) {
          // ignore malformed sse chunk
        }
      }
    }
  }

  return true;
}
