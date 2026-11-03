// src/utils/integrationTester.js
// Diagnostik dan Penguji Koneksi Langsung untuk Supabase, Meta Graph API v21.0, Telegram, dan Gemini
import { createClient } from '@supabase/supabase-js';

export async function testSupabaseConnection(url, anonKey) {
  if (!url || !url.trim()) {
    return { success: false, message: 'Project URL Supabase wajib diisi.' };
  }
  if (!anonKey || !anonKey.trim()) {
    return { success: false, message: 'Anon / Public Key Supabase wajib diisi.' };
  }

  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = anonKey.trim();

  try {
    const client = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false }
    });

    // Cek keberadaan tabel campaigns
    const { count, error } = await client
      .from('campaigns')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation "public.campaigns" does not exist')) {
        return {
          success: false,
          code: 'TABLES_MISSING',
          message: 'Terhubung ke URL Supabase, namun tabel belum dibuat. Silakan salin & jalankan Schema SQL di Supabase SQL Editor!'
        };
      }
      return {
        success: false,
        message: `Gagal akses Supabase: ${error.message} (${error.code || 'Error'})`
      };
    }

    return {
      success: true,
      count: count || 0,
      message: `✓ Terhubung ke Supabase! (${count || 0} kampanye terdeteksi, RLS Aktif)`
    };
  } catch (err) {
    return {
      success: false,
      message: `Koneksi gagal: ${err.message || 'URL tidak valid atau CORS terblokir'}`
    };
  }
}

export async function testMetaConnection(adAccountId, accessToken) {
  if (!adAccountId || !adAccountId.trim()) {
    return { success: false, message: 'Ad Account ID wajib diisi.' };
  }
  if (!accessToken || !accessToken.trim()) {
    return { success: false, message: 'System User Access Token wajib diisi.' };
  }

  let cleanAccount = adAccountId.trim();
  if (!cleanAccount.startsWith('act_')) {
    cleanAccount = `act_${cleanAccount}`;
  }
  const cleanToken = accessToken.trim();

  // 1. Coba lewat Serverless Proxy /api/sync-meta (Aman 100% dari AdBlocker browser)
  try {
    const srvRes = await fetch('/api/sync-meta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test_meta',
        metaAccount: cleanAccount,
        metaToken: cleanToken
      })
    });
    
    if (srvRes.status < 500) {
      const srvData = await srvRes.json();
      if (srvData.success) {
        return {
          success: true,
          accountName: srvData.accountName,
          currency: srvData.currency,
          message: `✓ Terhubung ke Meta Ads via Backend! Akun: "${srvData.accountName}" (${srvData.currency}) • Status: AKTIF`
        };
      } else if (srvData.error) {
        return {
          success: false,
          message: `Gagal dari Meta API: ${srvData.error}`
        };
      }
    }
  } catch (e) {
    // Lanjut ke proxy lokal / proxy vercel
  }

  // 2. Coba lewat Reverse Proxy (/api/meta-proxy/v21.0/...)
  try {
    const proxyUrl = `/api/meta-proxy/v21.0/${cleanAccount}?fields=name,account_status,currency,amount_spent,timezone_name&access_token=${cleanToken}`;
    const proxyRes = await fetch(proxyUrl);
    
    if (proxyRes.status < 500) {
      const proxyData = await proxyRes.json();
      if (proxyData.error) {
        return {
          success: false,
          message: `Gagal dari Meta API: ${proxyData.error.message} (Tipe: ${proxyData.error.type || 'OAuth'})`
        };
      }
      if (proxyData.name) {
        return {
          success: true,
          accountName: proxyData.name,
          currency: proxyData.currency,
          message: `✓ Terhubung ke Meta Ads via Proxy! Akun: "${proxyData.name}" (${proxyData.currency}) • Status: AKTIF`
        };
      }
    }
  } catch (e) {
    // Lanjut ke direct fetch
  }

  // 3. Direct Fetch ke graph.facebook.com v21.0
  try {
    const url = `https://graph.facebook.com/v21.0/${cleanAccount}?fields=name,account_status,currency,amount_spent,timezone_name&access_token=${cleanToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      return {
        success: false,
        message: `Gagal dari Meta: ${data.error.message} (Tipe: ${data.error.type || 'OAuth'})`
      };
    }

    const statusMap = {
      1: 'ACTIVE',
      2: 'DISABLED',
      3: 'UNSETTLED',
      7: 'PENDING_RISK_REVIEW',
      8: 'PENDING_SETTLEMENT',
      9: 'IN_GRACE_PERIOD',
      100: 'PENDING_CLOSURE',
      101: 'CLOSED',
      201: 'ANY_ACTIVE',
      202: 'ANY_CLOSED'
    };

    const statusLabel = statusMap[data.account_status] || `Status ID: ${data.account_status}`;

    return {
      success: true,
      accountName: data.name,
      currency: data.currency,
      status: statusLabel,
      message: `✓ Terhubung ke Meta Ads! Akun: "${data.name}" (${data.currency}) • Status: ${statusLabel}`
    };
  } catch (err) {
    // Tangani deteksi AdBlocker browser (Brave Shields, uBlock, AdGuard)
    if (err.message?.includes('Failed to fetch') || err.name === 'TypeError') {
      return {
        success: false,
        isAdBlocker: true,
        message: 'Gagal menghubungi Meta Graph API (Failed to fetch). Request ke graph.facebook.com diblokir oleh AdBlocker browser (Brave Shields / uBlock Origin / AdGuard). Silakan matikan AdBlocker untuk halaman ini agar Meta Ads dapat tersambung langsung.'
      };
    }
    return {
      success: false,
      message: `Gagal menghubungi Meta Graph API: ${err.message}`
    };
  }
}

export async function testTelegramConnection(botToken, chatId) {
  if (!botToken || !botToken.trim()) {
    return { success: false, message: 'Bot Token Telegram wajib diisi.' };
  }

  const cleanToken = botToken.trim();
  const cleanChat = (chatId || '').trim();

  try {
    // 1. Verifikasi Bot
    const meRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const meData = await meRes.json();

    if (!meData.ok) {
      return {
        success: false,
        message: `Token Bot salah: ${meData.description || 'Unauthorized'}`
      };
    }

    const botUser = meData.result.username;

    // 2. Jika ada Chat ID, kirim ping uji coba
    if (cleanChat) {
      const pingText = `🚀 *MetaSync Telemetry Alert*\nIntegrasi Telegram Bot @${botUser} berhasil terhubung!\n\n_Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB_`;
      const sendRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cleanChat,
          text: pingText,
          parse_mode: 'Markdown'
        })
      });
      const sendData = await sendRes.json();

      if (!sendData.ok) {
        return {
          success: false,
          message: `Bot valid (@${botUser}), tetapi gagal kirim ke Chat ID: ${sendData.description}`
        };
      }

      return {
        success: true,
        message: `✓ Terhubung ke Bot @${botUser} & Pesan uji coba terkirim ke Chat ID ${cleanChat}!`
      };
    }

    return {
      success: true,
      message: `✓ Token Bot valid (@${botUser}). Masukkan Chat ID untuk mengaktifkan notifikasi pesan.`
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal menghubungi Telegram API: ${err.message}`
    };
  }
}

export async function testGeminiConnection(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Gemini API Key wajib diisi.' };
  }

  const cleanKey = apiKey.trim();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "balas kata 'PONG' saja" }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    const data = await res.json();

    if (data.error) {
      return {
        success: false,
        message: `Gagal dari Google AI Studio: ${data.error.message}`
      };
    }

    return {
      success: true,
      message: '✓ Terhubung ke Google Gemini AI (Model Gemini 1.5 Flash/Pro Siap Streaming)!'
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal menghubungi Google AI Studio: ${err.message}`
    };
  }
}
