// api/telegram-proxy.js
// Vercel Serverless Function: CORS & Anti-Blocker Proxy to Telegram Bot API
// Allows web browser to query getMe, getWebhookInfo, sendMessage, getUpdates without CORS or AdBlocker interference.

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract path from query or url
  let targetSubpath = req.query.path || '';
  if (!targetSubpath) {
    const rawUrl = req.url || '';
    const match = rawUrl.match(/^\/api\/telegram-proxy\/(.+?)(\?|$)/);
    if (match) {
      targetSubpath = match[1];
    }
  }

  if (!targetSubpath) {
    return res.status(400).json({ error: 'Missing path (e.g. /api/telegram-proxy?path=bot<token>/getMe)' });
  }

  const targetUrl = `https://api.telegram.org/${targetSubpath.replace(/^\/+/, '')}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json'
      }
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const tgRes = await fetch(targetUrl, fetchOptions);
    const data = await tgRes.json();

    return res.status(tgRes.status).json(data);
  } catch (err) {
    console.error('Telegram Proxy Error:', err);
    return res.status(500).json({ error: 'Failed to proxy request to Telegram Bot API', message: err.message });
  }
}
