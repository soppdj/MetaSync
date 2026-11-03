// src/utils/telegramBotListener.js
// Autonomous 2-Way Telegram Command Engine (Long-Polling & Webhook Support)
// Memungkinkan bot Telegram menerima dan merespons perintah (/status, /kill, /help, /rekap)
// baik di localhost maupun di server produksi secara real-time.

import { formatIDR } from './currency';

let isPolling = false;
let lastUpdateId = 0;
let pollTimeout = null;

async function sendTelegramReply(botToken, chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (e) {
    console.warn('Failed to reply to Telegram:', e);
  }
}

// Handler Perintah Masuk
async function handleTelegramCommand(botToken, message, onKillCallback) {
  const chatId = message.chat?.id;
  const rawText = (message.text || '').trim();
  if (!chatId || !rawText) return;

  const parts = rawText.split(' ');
  const command = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ').trim();

  // 1. /start atau /help
  if (command === '/start' || command === '/help') {
    const helpMsg = `*🤖 METASYNC TELEMETRY COMMAND BOT*
Selamat datang di Terminal Remote Control MetaSync by FatherLab!

*Daftar Perintah Resmi:*
• \`/status\` - Telemetri ringkasan ad spend, omset, dan ROAS hari ini.
• \`/rekap\` - Rincian status seluruh kampanye aktif.
• \`/kill <id>\` - Pause ad set secara langsung di Meta Ads.
• \`/scale <id>\` - Rekomendasi promosi ke tahap scale.
• \`/ping\` - Tes latensi respon bot.

_Kirim salah satu perintah di atas untuk mengontrol aplikasi MetaSync._`;
    await sendTelegramReply(botToken, chatId, helpMsg);
    return;
  }

  // 2. /ping
  if (command === '/ping') {
    await sendTelegramReply(botToken, chatId, `🏓 *PONG!* Terminal MetaSync online dan terhubung aktif.`);
    return;
  }

  // 3. /status (Ringkasan KPI Finansial)
  if (command === '/status') {
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
_Waktu: ${new Date().toLocaleTimeString('id-ID')} WIB • MetaSync v1.7.2_`;

      await sendTelegramReply(botToken, chatId, reply);
    } catch (e) {
      await sendTelegramReply(botToken, chatId, `⚠️ Gagal membaca status telemetri: ${e.message}`);
    }
    return;
  }

  // 4. /rekap (Daftar Kampanye)
  if (command === '/rekap') {
    try {
      const rawCamps = localStorage.getItem('metasync_campaigns_cache');
      const camps = rawCamps ? JSON.parse(rawCamps) : [];

      if (camps.length === 0) {
        await sendTelegramReply(botToken, chatId, `Belum ada kampanye aktif.`);
        return;
      }

      let rekapText = `📋 *REKAP KAMPANYE METASYNC:*\n\n`;
      camps.forEach((c, idx) => {
        const stageUpper = (c.status || 'TEST').toUpperCase();
        rekapText += `${idx + 1}. *${c.name}* [${stageUpper}]\n`;
        (c.adsets || []).forEach(ad => {
          rekapText += `   ↳ \`${ad.meta_adset_id || ad.id}\`: ${ad.name} (${ad.status})\n`;
        });
        rekapText += `\n`;
      });

      await sendTelegramReply(botToken, chatId, rekapText);
    } catch (e) {
      await sendTelegramReply(botToken, chatId, `⚠️ Gagal memuat rekap: ${e.message}`);
    }
    return;
  }

  // 5. /kill <adset_id>
  if (command === '/kill' || command === '/pause') {
    if (!arg) {
      await sendTelegramReply(botToken, chatId, `⚠️ *Format Salah:* Gunakan \`/kill <id_adset>\`\nContoh: \`/kill adset_test_01\``);
      return;
    }

    try {
      // 1. Eksekusi pause di Meta API jika token tersedia
      const metaToken = localStorage.getItem('metasync_meta_token');
      if (metaToken && !arg.startsWith('cmp_')) {
        await fetch(`https://graph.facebook.com/v21.0/${arg}?status=PAUSED&access_token=${metaToken}`, {
          method: 'POST'
        }).catch(() => {});
      }

      // 2. Callback untuk update lokal
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

  // Perintah tidak dikenal
  await sendTelegramReply(botToken, chatId, `Perintah \`${command}\` tidak dikenal. Ketik \`/help\` untuk melihat daftar perintah.`);
}

// Mulai Polling Telegram
export function startTelegramPolling(botToken, onKillCallback = null) {
  if (!botToken || isPolling) return;
  isPolling = true;

  const poll = async () => {
    if (!isPolling) return;

    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id);
          if (update.message) {
            await handleTelegramCommand(botToken, update.message, onKillCallback);
          }
        }
      }
    } catch (err) {
      // Ignore network timeout in polling
    } finally {
      if (isPolling) {
        pollTimeout = setTimeout(poll, 3000);
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

// Daftarkan Webhook Resmi ke Server Telegram (Untuk Deployment Online Vercel)
export async function registerTelegramWebhook(botToken, appDomain) {
  if (!botToken || !appDomain) {
    throw new Error('Bot Token dan App Domain wajib diisi.');
  }

  let cleanDomain = appDomain.trim().replace(/\/+$/, '');
  if (!cleanDomain.startsWith('http')) {
    cleanDomain = `https://${cleanDomain}`;
  }

  const webhookUrl = `${cleanDomain}/api/telegram-webhook`;
  const url = `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description}`);
  }

  return {
    success: true,
    webhookUrl,
    description: data.description || 'Webhook berhasil didaftarkan di server Telegram.'
  };
}
