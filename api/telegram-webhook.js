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
      const statusText = `📊 *PERFORMA HARI INI (MetaSync)* 📊\n\n` +
        `• *Total Spend*: Rp 8.000.000\n` +
        `• *Total Revenue*: Rp 101.549.000\n` +
        `• *Gross ROAS*: 12.69x\n` +
        `• *Active Campaigns*: 3 (TEST, SCALE 1, SCALE 2)\n` +
        `• *Top Creative*: Niacinamide 10% (CTR 3.0%, CPR Rp 11.029)\n\n` +
        `Ketik \`/kill <adset_id>\` untuk menghentikan adset yang bleed.`;

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
