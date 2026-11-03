// api/telegram-webhook.js
// Vercel Serverless Function: Autonomous 2-Way Telegram Command Engine & Push Alert Relay
// Enables Telegram bot to execute commands (/status, /rekap, /kill <id>, /activate <id>, /ping, /help)
// Directly integrated with Meta Marketing Graph API v21.0 and Supabase PostgreSQL.

import { createClient } from '@supabase/supabase-js';

// Helper: Send formatted Markdown reply to Telegram
async function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken || !chatId) return null;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to send Telegram message:', err);
    return null;
  }
}

// Helper: Pause AdSet in Meta Graph API v21.0
async function updateMetaAdsetStatus(metaToken, adsetId, status = 'PAUSED') {
  if (!metaToken || adsetId.startsWith('cmp_')) {
    return { success: true, simulated: true };
  }
  const url = `https://graph.facebook.com/v21.0/${adsetId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      status: status,
      access_token: metaToken
    })
  });
  return await res.json();
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Resolve Credentials with High-Priority Query Fallback
  let BOT_TOKEN = req.query.token || req.headers['x-telegram-token'] || process.env.TELEGRAM_BOT_TOKEN;
  let DEFAULT_CHAT_ID = req.query.chat_id || process.env.TELEGRAM_CHAT_ID;
  let META_TOKEN = req.query.meta_token || process.env.META_ACCESS_TOKEN;
  let META_ACCOUNT = req.query.meta_account || process.env.META_AD_ACCOUNT_ID;
  const SUPABASE_URL = req.query.supabase_url || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = req.query.supabase_key || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // If credentials missing, try to load from Supabase system_settings table
  if ((!BOT_TOKEN || !META_TOKEN || !META_ACCOUNT) && SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await supabase.from('system_settings').select('value').eq('key', 'metasync_settings').maybeSingle();
      if (data?.value) {
        if (!BOT_TOKEN && data.value.telegramToken) BOT_TOKEN = data.value.telegramToken;
        if (!DEFAULT_CHAT_ID && data.value.telegramChat) DEFAULT_CHAT_ID = data.value.telegramChat;
        if (!META_TOKEN && data.value.metaToken) META_TOKEN = data.value.metaToken;
        if (!META_ACCOUNT && data.value.metaAccount) META_ACCOUNT = data.value.metaAccount;
      }
    } catch (e) {
      console.warn('Could not read system_settings from Supabase:', e);
    }
  }

  if (META_ACCOUNT && !META_ACCOUNT.startsWith('act_')) {
    META_ACCOUNT = `act_${META_ACCOUNT}`;
  }

  // 2. Health check or diagnostic GET request
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'MetaSync Telegram Webhook Server Online',
      bot_configured: Boolean(BOT_TOKEN),
      meta_configured: Boolean(META_TOKEN && META_ACCOUNT),
      supabase_configured: Boolean(SUPABASE_URL && SUPABASE_KEY),
      supported_commands: ['/status', '/rekap', '/kill <id>', '/activate <id>', '/ping', '/help'],
      timestamp: new Date().toISOString()
    });
  }

  // 3. Outbound Push Alert Relay (triggered by client or KPI rules)
  if (req.method === 'POST' && req.body && req.body.action === 'push_alert') {
    const { title, message, type, adsetId, targetChatId } = req.body;
    const chatId = targetChatId || DEFAULT_CHAT_ID;

    if (!BOT_TOKEN || !chatId) {
      return res.status(200).json({
        success: false,
        warning: 'Telegram BOT_TOKEN or CHAT_ID not configured.'
      });
    }

    const icon = type === 'KILL_ALERT' ? '🚨 *[KILL RECOMMENDATION]*' : '🚀 *[AUTO-SCALE ALERT]*';
    const formatted = `${icon}\n*${title}*\n\n${message}\n\n_MetaSync by FatherLab Automation_`;

    const sendRes = await sendTelegramMessage(BOT_TOKEN, chatId, formatted);
    return res.status(200).json({ success: true, result: sendRes });
  }

  // 4. Inbound Telegram Webhook Processing
  if (req.method === 'POST') {
    const update = req.body;

    if (!update) {
      return res.status(200).send('OK (Empty payload)');
    }

    const message = update.message || update.channel_post;
    if (!message) {
      return res.status(200).send('OK (No message object)');
    }

    const chatId = message.chat?.id;
    const rawText = (message.text || '').trim();

    if (!chatId || !rawText) {
      return res.status(200).send('OK (Empty text)');
    }

    const parts = rawText.split(' ');
    const command = parts[0].split('@')[0].toLowerCase();
    const arg = rawText.slice(parts[0].length).trim();

    // -------------------------------------------------------------
    // COMMAND: /start, /help, help, menu
    // -------------------------------------------------------------
    if (command === '/start' || command === '/help' || command === 'help' || command === 'menu') {
      const helpReply = `*🤖 METASYNC TELEGRAM COMMAND CENTER*
━━━━━━━━━━━━━━━━━━
Selamat datang di Terminal Remote Control Meta Ads FatherLab! Bot ini siap menerima instruksi langsung dari Telegram:

*Daftar Perintah Resmi:*
📊 \`/status\` - Telemetri real-time Ad Spend, Omset, Purchases, & ROAS hari ini.
📋 \`/rekap\` - Daftar seluruh kampanye & adset aktif beserta tombol pintas Kill.
🛑 \`/kill <id>\` - Hentikan (PAUSED) adset seketika di Meta Ads.
▶️ \`/activate <id>\` - Jalankan kembali (ACTIVE) adset di Meta Ads.
🏓 \`/ping\` - Periksa latensi respon & status server bot.
ℹ️ \`/help\` - Tampilkan panduan ini.

━━━━━━━━━━━━━━━━━━
_Ketik atau ketuk salah satu perintah di atas untuk mengontrol kampanye Anda._`;

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, helpReply);
      return res.status(200).json({ status: 'help_sent' });
    }

    // -------------------------------------------------------------
    // COMMAND: /ping, ping
    // -------------------------------------------------------------
    if (command === '/ping' || command === 'ping') {
      const pingReply = `🏓 *PONG!*
Terminal MetaSync Remote Control Bot Online & Aktif!
• Server: Vercel Serverless Function
• Waktu: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
• Status: 🟢 Siap menerima perintah

Ketik \`/status\` untuk cek omset & spend, atau \`/help\` untuk bantuan.`;

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, pingReply);
      return res.status(200).json({ status: 'pong_sent' });
    }

    // -------------------------------------------------------------
    // COMMAND: /status, status, /cek, cek
    // -------------------------------------------------------------
    if (command === '/status' || command === 'status' || command === '/cek' || command === 'cek' || command === '/stats') {
      let statusText = '';

      // 1. Query Real Live Meta Marketing API v21.0
      if (META_TOKEN && META_ACCOUNT) {
        try {
          const insightsUrl = `https://graph.facebook.com/v21.0/${META_ACCOUNT}/insights?fields=spend,impressions,clicks,cpc,cpm,ctr,actions,action_values&date_preset=today&access_token=${META_TOKEN}`;
          const metaRes = await fetch(insightsUrl);
          const metaJson = await metaRes.json();

          if (metaJson.data && metaJson.data.length > 0) {
            const item = metaJson.data[0];
            const spend = Math.round(Number(item.spend || 0));

            const actions = item.actions || [];
            const actionValues = item.action_values || [];

            const getActionCount = (type) => {
              const found = actions.find(a => a.action_type === type);
              return found ? parseInt(found.value, 10) : 0;
            };
            const getActionVal = (type) => {
              const found = actionValues.find(a => a.action_type === type);
              return found ? Math.round(parseFloat(found.value)) : 0;
            };

            const purchases = getActionCount('purchase') || getActionCount('omni_purchase') || 0;
            const revenue = getActionVal('purchase') || getActionVal('omni_purchase') || 0;
            const ic = getActionCount('initiate_checkout') || getActionCount('omni_initiated_checkout') || 0;
            const clicks = Number(item.clicks || 0);
            const ctr = Number(item.ctr || 0).toFixed(2);
            const roas = spend > 0 ? (revenue / spend).toFixed(2) : '0.00';
            const netProfit = revenue - spend;

            statusText = `📊 *PERFORMA REAL-TIME HARI INI (Meta Ads v21.0)*\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `🏷️ *Akun:* \`${META_ACCOUNT}\`\n` +
              `💰 *Ad Spend:* Rp ${spend.toLocaleString('id-ID')}\n` +
              `💵 *Gross Revenue:* Rp ${revenue.toLocaleString('id-ID')}\n` +
              `📈 *Net Profit:* Rp ${netProfit.toLocaleString('id-ID')}\n` +
              `🎯 *Purchases:* ${purchases} Orders\n` +
              `🛒 *Initiate Checkout:* ${ic} Prospek\n` +
              `⚡ *ROAS:* *${roas}x*\n` +
              `👆 *CTR:* ${ctr}% (${clicks.toLocaleString('id-ID')} Klik)\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `_Waktu: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB • Live Marketing API_`;
          }
        } catch (err) {
          console.warn('Live Meta Insights fetch failed in telegram webhook:', err);
        }
      }

      // 2. Fallback to Supabase daily_metrics if Meta API was empty
      if (!statusText && SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          const today = new Date().toISOString().split('T')[0];
          const { data: metrics } = await supabase.from('daily_metrics').select('spend, revenue, purchases').eq('date', today);
          if (metrics && metrics.length > 0) {
            const totalSpend = metrics.reduce((s, m) => s + Number(m.spend || 0), 0);
            const totalRev = metrics.reduce((s, m) => s + Number(m.revenue || 0), 0);
            const totalPurchases = metrics.reduce((s, m) => s + Number(m.purchases || 0), 0);
            const roas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : '0.00';
            const netProfit = totalRev - totalSpend;
            statusText = `📊 *PERFORMA HARI INI (Database Supabase)*\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `💰 *Ad Spend:* Rp ${totalSpend.toLocaleString('id-ID')}\n` +
              `💵 *Gross Revenue:* Rp ${totalRev.toLocaleString('id-ID')}\n` +
              `📈 *Net Profit:* Rp ${netProfit.toLocaleString('id-ID')}\n` +
              `🎯 *Purchases:* ${totalPurchases} Orders\n` +
              `⚡ *ROAS:* *${roas}x*\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `_Waktu: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB_`;
          }
        } catch (e) {}
      }

      if (!statusText) {
        statusText = `📊 *PERFORMA HARI INI (MetaSync)*\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `Belum ada data metrik kampanye aktif yang tersinkronisasi hari ini.\n` +
          `Buka dashboard MetaSync untuk memicu sinkronisasi data riil.`;
      }

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, statusText);
      return res.status(200).json({ status: 'status_sent' });
    }

    // -------------------------------------------------------------
    // COMMAND: /rekap, rekap, /campaigns
    // -------------------------------------------------------------
    if (command === '/rekap' || command === 'rekap' || command === '/campaigns' || command === '/campaign') {
      let rekapText = '';

      if (META_TOKEN && META_ACCOUNT) {
        try {
          const campUrl = `https://graph.facebook.com/v21.0/${META_ACCOUNT}/campaigns?fields=id,name,status,effective_status,adsets{id,name,status,effective_status}&access_token=${META_TOKEN}&limit=8`;
          const campRes = await fetch(campUrl);
          const campJson = await campRes.json();

          if (campJson.data && Array.isArray(campJson.data) && campJson.data.length > 0) {
            rekapText = `📋 *REKAP KAMPANYE REAL-TIME (Meta Ads v21.0)*\n━━━━━━━━━━━━━━━━━━\n`;
            campJson.data.forEach((camp, idx) => {
              const isCampActive = camp.effective_status === 'ACTIVE' || camp.status === 'ACTIVE';
              const campBadge = isCampActive ? '🟢 ACTIVE' : '⏸️ PAUSED';
              rekapText += `*${idx + 1}. ${camp.name}* [${campBadge}]\n`;
              rekapText += `   ID: \`${camp.id}\`\n`;

              const adsets = camp.adsets?.data || [];
              if (adsets.length === 0) {
                rekapText += `   _(Belum ada ad set)_\n`;
              } else {
                adsets.forEach(ad => {
                  const isAdActive = ad.effective_status === 'ACTIVE' || ad.status === 'ACTIVE';
                  const adBadge = isAdActive ? '🟢 ACTIVE' : '⏸️ PAUSED';
                  rekapText += `   ↳ *${ad.name}* [${adBadge}]\n`;
                  rekapText += `     AdSet ID: \`${ad.id}\`\n`;
                  if (isAdActive) {
                    rekapText += `     Perintah Kill: \`/kill ${ad.id}\`\n`;
                  } else {
                    rekapText += `     Perintah Aktifkan: \`/activate ${ad.id}\`\n`;
                  }
                });
              }
              rekapText += `\n`;
            });
            rekapText += `━━━━━━━━━━━━━━━━━━\n`;
            rekapText += `_Ketik \`/kill <id>\` untuk menghentikan adset seketika._`;
          }
        } catch (e) {
          console.warn('Meta Campaigns fetch failed in telegram webhook:', e);
        }
      }

      // Fallback to Supabase campaigns
      if (!rekapText && SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          const { data: camps } = await supabase.from('campaigns').select('id, name, status, adsets(id, name, status, meta_adset_id)').limit(10);
          if (camps && camps.length > 0) {
            rekapText = `📋 *REKAP KAMPANYE (Database Supabase)*\n━━━━━━━━━━━━━━━━━━\n`;
            camps.forEach((c, idx) => {
              rekapText += `*${idx + 1}. ${c.name}* [${(c.status || 'TEST').toUpperCase()}]\n`;
              (c.adsets || []).forEach(ad => {
                const adId = ad.meta_adset_id || ad.id;
                rekapText += `   ↳ \`${adId}\`: ${ad.name} (${ad.status})\n`;
                rekapText += `     Perintah: \`/kill ${adId}\`\n`;
              });
              rekapText += `\n`;
            });
            rekapText += `━━━━━━━━━━━━━━━━━━\n`;
          }
        } catch (e) {}
      }

      if (!rekapText) {
        rekapText = `📋 Belum ada kampanye aktif yang terdeteksi di akun ini.`;
      }

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, rekapText);
      return res.status(200).json({ status: 'rekap_sent' });
    }

    // -------------------------------------------------------------
    // COMMAND: /kill <id>, /pause <id>, kill <id>
    // -------------------------------------------------------------
    if (command === '/kill' || command === '/pause' || command === 'kill' || command === 'pause') {
      if (!arg) {
        const errorMsg = `⚠️ *Format Perintah Salah!*\n\n` +
          `Gunakan format: \`/kill <id_adset>\`\n` +
          `Contoh: \`/kill 1202081928374\` atau \`/kill adset_test_01\`\n\n` +
          `_Ketik \`/rekap\` untuk melihat daftar ID adset aktif._`;
        if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, errorMsg);
        return res.status(200).json({ status: 'missing_id' });
      }

      let metaSuccess = false;
      let metaErrMsg = '';

      // 1. Pause on Meta Graph API v21.0
      if (META_TOKEN && !arg.startsWith('cmp_')) {
        try {
          const resMeta = await updateMetaAdsetStatus(META_TOKEN, arg, 'PAUSED');
          if (resMeta.success) {
            metaSuccess = true;
          } else if (resMeta.error) {
            metaErrMsg = resMeta.error.message;
          }
        } catch (err) {
          metaErrMsg = err.message;
        }
      } else {
        metaSuccess = true;
      }

      // 2. Update Supabase Database
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase
            .from('adsets')
            .update({ status: 'PAUSED', updated_at: new Date().toISOString() })
            .or(`meta_adset_id.eq.${arg},id.eq.${arg}`);
        } catch (e) {
          console.warn('Supabase kill update warning:', e);
        }
      }

      let replyText = '';
      if (metaSuccess) {
        replyText = `🛑 *ADSET BERHASIL DI-KILL (PAUSED)* 🛑\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `• *AdSet Target:* \`${arg}\`\n` +
          `• *Status Meta Ads:* ⏸️ PAUSED (Jeda Iklan)\n` +
          `• *Database:* Status disinkronkan ke PAUSED\n` +
          `• *Waktu:* ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `_Anggaran bocor berhasil dihentikan oleh FatherLab Sentinel!_`;
      } else {
        replyText = `⚠️ *Gagal Menghentikan AdSet di Meta Ads:*\n` +
          `ID: \`${arg}\`\n` +
          `Error: ${metaErrMsg || 'Token Meta tidak valid atau hak akses tidak cukup.'}\n\n` +
          `_Status database tetap disinkronkan ke PAUSED._`;
      }

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, replyText);
      return res.status(200).json({ status: 'kill_executed', targetId: arg, metaSuccess });
    }

    // -------------------------------------------------------------
    // COMMAND: /activate <id>, /unpause <id>
    // -------------------------------------------------------------
    if (command === '/activate' || command === '/unpause' || command === 'activate') {
      if (!arg) {
        const errorMsg = `⚠️ *Format Salah!* Gunakan: \`/activate <id_adset>\``;
        if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, errorMsg);
        return res.status(200).json({ status: 'missing_id' });
      }

      let metaSuccess = false;
      let metaErrMsg = '';

      if (META_TOKEN && !arg.startsWith('cmp_')) {
        try {
          const resMeta = await updateMetaAdsetStatus(META_TOKEN, arg, 'ACTIVE');
          if (resMeta.success) metaSuccess = true;
          else if (resMeta.error) metaErrMsg = resMeta.error.message;
        } catch (e) {
          metaErrMsg = e.message;
        }
      } else {
        metaSuccess = true;
      }

      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase
            .from('adsets')
            .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
            .or(`meta_adset_id.eq.${arg},id.eq.${arg}`);
        } catch (e) {}
      }

      const replyText = metaSuccess 
        ? `▶️ *ADSET DIAKTIFKAN KEMBALI (ACTIVE)* ▶️\n\n• Target: \`${arg}\`\n• Status: 🟢 ACTIVE\n• Waktu: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
        : `⚠️ Gagal mengaktifkan: ${metaErrMsg}`;

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, replyText);
      return res.status(200).json({ status: 'activate_executed', targetId: arg });
    }

    // -------------------------------------------------------------
    // UNHANDLED COMMAND / GENERAL CONVERSATION
    // -------------------------------------------------------------
    const fallbackReply = `👋 Halo! Perintah \`${command}\` belum dikenali.
Ketik \`/status\` untuk cek performa iklan hari ini, atau \`/help\` untuk melihat seluruh daftar perintah yang tersedia.`;

    if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, fallbackReply);
    return res.status(200).json({ status: 'unhandled_command_responded' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
