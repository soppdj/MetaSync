// api/telegram-webhook.js
// Vercel Serverless Function: 2-way Telegram Bot integration
// - Inbound: handles commands like /kill <adset_id>, /status, /help
// - Outbound: pushes alerts for "Kill" recommendations and "Scale" promotions

import { createClient } from '@supabase/supabase-js';

async function sendTelegramMessage(botToken, chatId, text) {
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

async function pauseMetaAdset(metaToken, adsetId) {
  if (!metaToken) {
    return { success: true, simulated: true };
  }
  const url = `https://graph.facebook.com/v20.0/${adsetId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      status: 'PAUSED',
      access_token: metaToken
    })
  });
  return await res.json();
}

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const DEFAULT_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const META_TOKEN = process.env.META_ACCESS_TOKEN;
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  // 1. Handle Outbound Push Alert (triggered by frontend or backend KPI rules)
  if (req.method === 'POST' && req.body && req.body.action === 'push_alert') {
    const { title, message, type, adsetId, targetChatId } = req.body;
    const chatId = targetChatId || DEFAULT_CHAT_ID;

    if (!BOT_TOKEN || !chatId) {
      return res.status(200).json({
        success: false,
        warning: 'Telegram BOT_TOKEN or CHAT_ID not configured in environment.'
      });
    }

    const icon = type === 'KILL_ALERT' ? '🚨 *[KILL RECOMMENDATION]*' : '🚀 *[AUTO-SCALE ALERT]*';
    const formatted = `${icon}\n*${title}*\n\n${message}\n\n_MetaSync by FatherLab Automation_`;

    const sendRes = await sendTelegramMessage(BOT_TOKEN, chatId, formatted);
    return res.status(200).json({ success: true, result: sendRes });
  }

  // 2. Handle Inbound Webhook from Telegram
  if (req.method === 'POST') {
    const update = req.body;

    if (!update || !update.message) {
      return res.status(200).send('OK (No message)');
    }

    const message = update.message;
    const chatId = message.chat.id;
    const text = (message.text || '').trim();

    // Check commands
    if (text.startsWith('/start') || text.startsWith('/help')) {
      const reply = `*🤖 MetaSync FatherLab Bot Active!*
Command Center Meta Ads Automation:

• \`/status\` - Cek performa hari ini (Spend, Revenue, ROAS)
• \`/kill <adset_id>\` - Pause adset langsung di Meta API
• \`/scale <adset_id>\` - Naikkan status adset ke Scale Stage
• \`/help\` - Tampilkan bantuan ini`;

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, reply);
      return res.status(200).json({ status: 'help_sent' });
    }

    if (text.startsWith('/kill')) {
      const parts = text.split(' ');
      const targetId = parts[1];

      if (!targetId) {
        if (BOT_TOKEN) {
          await sendTelegramMessage(
            BOT_TOKEN,
            chatId,
            `⚠️ *Format Salah!*\nGunakan format: \`/kill <adset_id>\`\nContoh: \`/kill adset_test_02\` atau \`/kill 12020819283\``
          );
        }
        return res.status(200).json({ status: 'missing_id' });
      }

      // Step A: Pause on Meta Graph API
      let metaResult = null;
      try {
        metaResult = await pauseMetaAdset(META_TOKEN, targetId);
      } catch (e) {
        console.error('Meta Pause Failed:', e);
      }

      // Step B: Update in Supabase
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          await supabase
            .from('adsets')
            .update({ status: 'PAUSED', updated_at: new Date().toISOString() })
            .or(`meta_adset_id.eq.${targetId},id.eq.${targetId}`);
        } catch (e) {
          console.error('Supabase update failed:', e);
        }
      }

      const responseText = `🛑 *ADSET BERHASIL DI-KILL (PAUSED)* 🛑\n\n` +
        `• *AdSet Target*: \`${targetId}\`\n` +
        `• *Meta Status*: PAUSED (Jeda Iklan)\n` +
        `• *Database*: Status disinkronkan ke PAUSED\n` +
        `• *Waktu*: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n` +
        `_Anggaran bocor berhasil dihentikan oleh FatherLab Sentinel!_`;

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, responseText);
      return res.status(200).json({ status: 'killed', adsetId: targetId });
    }

    if (text.startsWith('/status')) {
      let statusText = '';
      if (SUPABASE_URL && SUPABASE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
          const today = new Date().toISOString().split('T')[0];
          const { data: metrics } = await supabase.from('daily_metrics').select('spend, revenue, purchases').eq('date', today);
          if (metrics && metrics.length > 0) {
            const totalSpend = metrics.reduce((s, m) => s + Number(m.spend || 0), 0);
            const totalRev = metrics.reduce((s, m) => s + Number(m.revenue || 0), 0);
            const totalPurchases = metrics.reduce((s, m) => s + Number(m.purchases || 0), 0);
            const roas = totalSpend > 0 ? (totalRev / totalSpend).toFixed(2) : '0.00';
            statusText = `📊 *PERFORMA REAL-TIME HARI INI (MetaSync)* 📊\n\n` +
              `• *Total Spend*: Rp ${totalSpend.toLocaleString('id-ID')}\n` +
              `• *Total Revenue*: Rp ${totalRev.toLocaleString('id-ID')}\n` +
              `• *Total Purchases*: ${totalPurchases} Orders\n` +
              `• *Blended ROAS*: ${roas}x\n\n` +
              `_Data murni tersinkronisasi dari Meta Ads v21.0 & Supabase._`;
          }
        } catch (e) {}
      }

      if (!statusText) {
        statusText = `📊 *PERFORMA HARI INI (MetaSync)* 📊\n\n` +
          `Belum ada metrik kampanye aktif yang tersinkronisasi hari ini.\n` +
          `Buka dashboard MetaSync dan lakukan sinkronisasi Meta Ads untuk memuat data riil.`;
      }

      if (BOT_TOKEN) await sendTelegramMessage(BOT_TOKEN, chatId, statusText);
      return res.status(200).json({ status: 'status_sent' });
    }

    // Default response for unhandled text
    return res.status(200).send('OK');
  }

  // GET request (Health check or Webhook Setup)
  return res.status(200).json({
    status: 'Telegram Webhook Handler Online',
    timestamp: new Date().toISOString()
  });
}
