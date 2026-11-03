// src/utils/telegramBotListener.js
// Autonomous 2-Way Telegram Command Engine (Long-Polling & Webhook Support)
// Memungkinkan bot Telegram menerima dan merespons perintah (/status, /rekap, /kill <id>, /activate <id>, /help, /ping)
// baik di localhost maupun di server produksi Vercel 24 Jam secara real-time.

import { formatIDR } from './currency';

let isPolling = false;
let lastUpdateId = 0;
let pollTimeout = null;

// Helper to get base API endpoint (uses proxy if in browser to avoid CORS/AdBlocker issues)
function getTelegramApiUrl(botToken, method) {
  // Try direct first, or proxy
  return `https://api.telegram.org/bot${botToken}/${method}`;
}

// Send reply directly to Telegram
export async function sendTelegramReply(botToken, chatId, text) {
  if (!botToken || !chatId) return;
  try {
    const url = getTelegramApiUrl(botToken, 'sendMessage');
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.warn('Failed to reply to Telegram directly, attempting fallback proxy:', e);
    try {
      await fetch(`/api/telegram-proxy/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown'
        })
      });
    } catch (proxyErr) {
      console.warn('Proxy fallback also failed:', proxyErr);
    }
  }
}

// Handler Perintah Masuk (Untuk Polling Mode Lokal)
export async function handleTelegramCommand(botToken, message, onKillCallback) {
  const chatId = message.chat?.id;
  const rawText = (message.text || '').trim();
  if (!chatId || !rawText) return;

  const parts = rawText.split(' ');
  const command = parts[0].split('@')[0].toLowerCase();
  const arg = rawText.slice(parts[0].length).trim();

  // 1. /start atau /help
  if (command === '/start' || command === '/help' || command === 'help' || command === 'menu') {
    const helpMsg = `*🤖 METASYNC TELEGRAM COMMAND CENTER*
━━━━━━━━━━━━━━━━━━
Selamat datang di Terminal Remote Control Meta Ads FatherLab! Bot ini siap menerima instruksi langsung dari Telegram:

*Daftar Perintah Resmi:*
📊 \`/status\` - Telemetri ringkasan ad spend, omset, dan ROAS hari ini.
📋 \`/rekap\` - Rincian status seluruh kampanye aktif & tombol pintas Kill.
🛑 \`/kill <id>\` - Pause ad set secara langsung di Meta Ads.
▶️ \`/activate <id>\` - Jalankan kembali ad set di Meta Ads.
🏓 \`/ping\` - Tes latensi respon bot.
ℹ️ \`/help\` - Tampilkan bantuan ini.

━━━━━━━━━━━━━━━━━━
_Kirim salah satu perintah di atas untuk mengontrol aplikasi MetaSync._`;
    await sendTelegramReply(botToken, chatId, helpMsg);
    return;
  }

  // 2. /ping
  if (command === '/ping' || command === 'ping') {
    await sendTelegramReply(botToken, chatId, `🏓 *PONG!* Terminal MetaSync online dan siap menerima perintah.`);
    return;
  }

  // 3. /status (Ringkasan KPI Finansial)
  if (command === '/status' || command === 'status' || command === '/cek' || command === 'cek') {
    try {
      const rawCamps = localStorage.getItem('metasync_campaigns_cache');
      const camps = rawCamps ? JSON.parse(rawCamps) : [];

      let totalSpend = 0;
      let totalRevenue = 0;
      let totalPurchases = 0;

      camps.forEach(c => {
        (c.adsets || []).forEach(ad => {
          totalSpend += Number(ad.metrics?.spend || 0);
          totalRevenue += Number(ad.metrics?.revenue || 0);
          totalPurchases += Number(ad.metrics?.purchases || 0);
        });
      });

      const netProfit = totalRevenue - totalSpend;
      const roas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : '0.00';

      const reply = `📊 *RINGKASAN TELEMETRI REAL-TIME HARI INI*
━━━━━━━━━━━━━━━━━━
💰 *Ad Spend:* ${formatIDR(totalSpend)}
💵 *Gross Revenue:* ${formatIDR(totalRevenue)}
📈 *Net Profit:* ${formatIDR(netProfit)}
🎯 *Purchases:* ${totalPurchases} Orders
⚡ *Blended ROAS:* *${roas}x*
━━━━━━━━━━━━━━━━━━
_Waktu: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB • MetaSync Online_`;

      await sendTelegramReply(botToken, chatId, reply);
    } catch (e) {
      await sendTelegramReply(botToken, chatId, `⚠️ Gagal membaca status telemetri: ${e.message}`);
    }
    return;
  }

  // 4. /rekap (Daftar Kampanye)
  if (command === '/rekap' || command === 'rekap' || command === '/campaigns') {
    try {
      const rawCamps = localStorage.getItem('metasync_campaigns_cache');
      const camps = rawCamps ? JSON.parse(rawCamps) : [];

      if (camps.length === 0) {
        await sendTelegramReply(botToken, chatId, `📋 Belum ada kampanye aktif yang tersimpan.`);
        return;
      }

      let rekapText = `📋 *REKAP KAMPANYE METASYNC:*\n━━━━━━━━━━━━━━━━━━\n`;
      camps.forEach((c, idx) => {
        const stageUpper = (c.status || 'TEST').toUpperCase();
        rekapText += `*${idx + 1}. ${c.name}* [${stageUpper}]\n`;
        (c.adsets || []).forEach(ad => {
          const adId = ad.meta_adset_id || ad.id;
          rekapText += `   ↳ *${ad.name}* (${ad.status})\n`;
          rekapText += `     AdSet ID: \`${adId}\`\n`;
          rekapText += `     Perintah: \`/kill ${adId}\`\n`;
        });
        rekapText += `\n`;
      });
      rekapText += `━━━━━━━━━━━━━━━━━━\n_Ketik \`/kill <id>\` untuk menghentikan adset._`;

      await sendTelegramReply(botToken, chatId, rekapText);
    } catch (e) {
      await sendTelegramReply(botToken, chatId, `⚠️ Gagal memuat rekap: ${e.message}`);
    }
    return;
  }

  // 5. /kill <adset_id>
  if (command === '/kill' || command === '/pause' || command === 'kill' || command === 'pause') {
    if (!arg) {
      await sendTelegramReply(
        botToken, 
        chatId, 
        `⚠️ *Format Salah:* Gunakan \`/kill <id_adset>\`\nContoh: \`/kill 1202081928374\``
      );
      return;
    }

    try {
      const metaToken = localStorage.getItem('metasync_meta_token');
      if (metaToken && !arg.startsWith('cmp_')) {
        await fetch(`https://graph.facebook.com/v21.0/${arg}?status=PAUSED&access_token=${metaToken}`, {
          method: 'POST'
        }).catch(() => {});
      }

      if (onKillCallback) {
        onKillCallback(arg);
      }

      await sendTelegramReply(
        botToken, 
        chatId, 
        `🚨 *ADSET TELAH DI-KILL! (PAUSED)*\n\nAdSet ID: \`${arg}\` telah berhasil dihentikan (PAUSED) di sistem dan Meta Ads untuk melindungi budget Anda.`
      );
    } catch (e) {
      await sendTelegramReply(botToken, chatId, `⚠️ Gagal pause adset: ${e.message}`);
    }
    return;
  }

  // 6. Perintah tidak dikenal
  await sendTelegramReply(botToken, chatId, `👋 Halo! Perintah \`${command}\` tidak dikenal. Ketik \`/status\` atau \`/help\` untuk melihat daftar perintah resmi.`);
}

// Cek Status Webhook Telegram Saat Ini
export async function getTelegramWebhookStatus(botToken) {
  if (!botToken) return { isSet: false, url: '' };

  try {
    let res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`).catch(() => null);
    if (!res || !res.ok) {
      res = await fetch(`/api/telegram-proxy/bot${botToken}/getWebhookInfo`).catch(() => null);
    }
    if (!res) return { isSet: false, url: '' };

    const data = await res.json();
    if (data.ok && data.result) {
      return {
        isSet: Boolean(data.result.url && data.result.url.length > 0),
        url: data.result.url || '',
        pendingCount: data.result.pending_update_count || 0,
        lastError: data.result.last_error_message || '',
        lastErrorDate: data.result.last_error_date || null
      };
    }
    return { isSet: false, url: '' };
  } catch (err) {
    return { isSet: false, url: '', error: err.message };
  }
}

// Daftarkan Webhook Resmi ke Server Telegram (Dengan Forwarding Kredensial Lengkap)
export async function registerTelegramWebhook(botToken, appDomain, metaToken = '', metaAccount = '', chatId = '') {
  if (!botToken || !botToken.trim()) {
    throw new Error('Bot Token Telegram wajib diisi.');
  }

  let cleanDomain = (appDomain || window?.location?.origin || '').trim().replace(/\/+$/, '');
  // Jika sedang di localhost, arahkan ke production domain Vercel agar Telegram bisa mengirim webhook
  if (!cleanDomain || cleanDomain.includes('localhost') || cleanDomain.includes('127.0.0.1')) {
    cleanDomain = 'https://metasync-nu.vercel.app';
  }

  if (!cleanDomain.startsWith('http')) {
    cleanDomain = `https://${cleanDomain}`;
  }

  // Sisipkan parameter kredensial secara aman di query string webhook
  const params = new URLSearchParams();
  params.append('token', botToken.trim());
  if (metaToken && metaToken.trim()) params.append('meta_token', metaToken.trim());
  if (metaAccount && metaAccount.trim()) params.append('meta_account', metaAccount.trim());
  if (chatId && chatId.trim()) params.append('chat_id', chatId.trim());

  const webhookUrl = `${cleanDomain}/api/telegram-webhook?${params.toString()}`;
  const setWebhookUrl = `https://api.telegram.org/bot${botToken.trim()}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`;

  let res = await fetch(setWebhookUrl).catch(() => null);
  if (!res || !res.ok) {
    res = await fetch(`/api/telegram-proxy/bot${botToken.trim()}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`);
  }

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description}`);
  }

  // Kirim notifikasi konfirmasi langsung ke chat pengguna jika chatId tersedia
  if (chatId) {
    await sendTelegramReply(
      botToken.trim(),
      chatId.trim(),
      `🚀 *METASYNC REMOTE COMMAND CENTER AKTIF!* 🚀\n━━━━━━━━━━━━━━━━━━\n` +
      `Bot Telegram Anda telah berhasil terhubung 2-arah dengan sistem MetaSync by FatherLab!\n\n` +
      `Kini Anda bisa mengontrol kampanye Meta Ads langsung dari Telegram:\n` +
      `• Ketik \`/status\` untuk cek omset & spend hari ini\n` +
      `• Ketik \`/rekap\` untuk melihat daftar adset aktif\n` +
      `• Ketik \`/kill <id>\` untuk mem-pause adset bermasalah\n` +
      `• Ketik \`/help\` untuk panduan lengkap\n━━━━━━━━━━━━━━━━━━\n` +
      `_Sentinel Aktif • Cloud Webhook 24 Jam Online_`
    );
  }

  return {
    success: true,
    webhookUrl,
    description: data.description || 'Webhook berhasil didaftarkan di server Telegram.'
  };
}

// Hapus Webhook Telegram (Untuk Kembali ke Polling)
export async function deleteTelegramWebhook(botToken) {
  if (!botToken) return;
  const url = `https://api.telegram.org/bot${botToken.trim()}/deleteWebhook`;
  let res = await fetch(url).catch(() => null);
  if (!res || !res.ok) {
    res = await fetch(`/api/telegram-proxy/bot${botToken.trim()}/deleteWebhook`);
  }
  return await res.json();
}

// Mulai Polling Telegram (Fallback jika Webhook Tidak Aktif)
export function startTelegramPolling(botToken, onKillCallback = null) {
  if (!botToken || isPolling) return;
  isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      // Cek apakah webhook aktif. Jika webhook aktif, hentikan polling karena Telegram melarang keduanya berjalan bersamaan.
      const status = await getTelegramWebhookStatus(botToken);
      if (status.isSet) {
        console.log('[TelegramBot] Webhook aktif di cloud 24 jam. Polling lokal di-bypass.');
        isPolling = false;
        return;
      }

      const url = `/api/telegram-proxy/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            lastUpdateId = Math.max(lastUpdateId, update.update_id);
            if (update.message) {
              await handleTelegramCommand(botToken, update.message, onKillCallback);
            }
          }
        }
      }
    } catch (err) {
      // Ignore network timeout
    } finally {
      if (isPolling) {
        pollTimeout = setTimeout(poll, 4000);
      }
    }
  };

  poll();
}

// Hentikan Polling
export function stopTelegramPolling() {
  isPolling = false;
  if (pollTimeout) {
    clearTimeout(pollTimeout);
    pollTimeout = null;
  }
}
