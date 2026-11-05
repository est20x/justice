// Vercel Serverless Function (Node.js) — заміна send_event.php
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pixelId = '831301789915154';
  const accessToken = 'EAAVZCsgZA6GrMBQTbWy2nFODgZCyuEIJciD7cYd41JtZB3mLZCHPbB31ZC2rs1aozVb9HQhEVyfjxDRkeDiYI70QGertDXGD7KOHYwpjSq9MvtZAxppRrK78u8ET97oDBA4Mb80JY8ZCoBoz3mNEcbdD0b5SyTES7w7QLHzgPOuHRX8qzq5GsUPjnKvW7aUZCHPsrWQZDZD';

  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket?.remoteAddress;

  const userData = {
    client_ip_address: ip,
    client_user_agent: req.headers['user-agent'],
  };
  if (body.fbp) userData.fbp = body.fbp;
  if (body.fbc) userData.fbc = body.fbc;

  const payload = {
    data: [{
      event_name: 'Subscribe',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      event_source_url: body.url || req.headers.referer || `https://${req.headers.host}/`,
      user_data: userData,
    }],
  };

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const data = await fbRes.json();
    return res.status(fbRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Meta', details: String(err) });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
