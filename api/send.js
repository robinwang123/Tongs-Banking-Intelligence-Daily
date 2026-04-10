// On-demand email send — called when user clicks "Send now" in the UI
// Accepts: { to, text, depth, lang }
// Uses the already-generated digest text from the frontend (no re-generation needed)

import { buildEmailHtml, buildSubject } from './_email.js';

const FROM = 'Tongs Banking Intelligence Daily <TongsKIDaily@amongthelight.com>';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { to, text, depth = 'standard', lang = 'en' } = req.body || {};

  // Validate recipient
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!text) {
    return res.status(400).json({ error: 'No digest text provided' });
  }

  try {
    const html    = buildEmailHtml({ text, depth, lang });
    const subject = buildSubject({ depth, lang });

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Resend error');

    console.log(`[send] Forwarded → ${to} | id: ${data.id}`);
    return res.status(200).json({ ok: true, id: data.id });

  } catch (err) {
    console.error('[send] Failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
