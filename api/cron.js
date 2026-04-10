// Vercel Cron: runs daily at 06:00 UTC = 07:00 CET / 08:00 CEST (summer)
import { generateDigest } from './_digest.js';
import { buildEmailHtml, buildSubject } from './_email.js';

const DEFAULT_TO   = 'xiaotong.xu@gmx.de';
const DEFAULT_FROM = 'Tongs Banking Intelligence Daily <TongsKIDaily@amongthelight.com>';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' });
  }
  try {
    const lang = 'en', depth = 'standard';
    const { text } = await generateDigest({ lang, depth, topic: '' });
    const html    = buildEmailHtml({ text, depth, lang });
    const subject = buildSubject({ depth, lang });
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: DEFAULT_FROM, to: [DEFAULT_TO], subject, html }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Resend error');
    console.log(`[cron] Sent → ${DEFAULT_TO} | id: ${data.id}`);
    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('[cron] Failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
