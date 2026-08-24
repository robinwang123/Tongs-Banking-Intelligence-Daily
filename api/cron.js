// Vercel Cron: runs daily at 06:00 UTC = 07:00 CET / 08:00 CEST (summer)
import { generateDigest } from './_digest.js';
import { buildEmailHtml, buildSubject } from './_email.js';

const DEFAULT_TO   = process.env.DAILY_RECIPIENT || 'xiaotong.xu@gmx.de';
const DEFAULT_FROM = process.env.DAILY_FROM || 'Tongs Banking Intelligence Daily <TongsKIDaily@amongthelight.com>';
const CRON_LANG    = process.env.CRON_LANG || 'de';
const CRON_DEPTH   = process.env.CRON_DEPTH || 'standard';

const STATE_URL = 'https://raw.githubusercontent.com/robinwang123/Tongs-Banking-Intelligence-Daily/main/data/schedule-state.json';

async function isPaused() {
  try {
    const r = await fetch(`${STATE_URL}?t=${Date.now()}`); // bust cache
    if (!r.ok) return false;
    const d = await r.json();
    return !!d.paused;
  } catch {
    return false; // fail-safe: if state can't be read, still send
  }
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  if (await isPaused()) {
    console.log('[cron] Scheduled delivery is paused — skipping send.');
    return res.status(200).json({ ok: true, skipped: true, reason: 'paused' });
  }

  try {
    console.log(`[cron] Starting digest generation (lang=${CRON_LANG}, depth=${CRON_DEPTH})`);
    const { text } = await generateDigest({ lang: CRON_LANG, depth: CRON_DEPTH, topic: '' });
    const html    = buildEmailHtml({ text, depth: CRON_DEPTH, lang: CRON_LANG });
    const subject = buildSubject({ depth: CRON_DEPTH, lang: CRON_LANG });
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: DEFAULT_FROM, to: [DEFAULT_TO], subject, html }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Resend error');
    console.log(`[cron] Sent (${CRON_LANG}) → ${DEFAULT_TO} | id: ${data.id}`);
    return res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    console.error('[cron] Failed:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
