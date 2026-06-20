// On-demand email send — called when user clicks "Send now" in the UI
// Accepts: { to, text, depth, lang }
// Uses the already-generated digest text from the frontend (no re-generation needed)

import { buildEmailHtml, buildSubject } from './_email.js';

const DEFAULT_FROM = process.env.DAILY_FROM || 'Tongs Banking Intelligence Daily <TongsKIDaily@amongthelight.com>';

// Simple in-memory rate limiter
const sendCounts = new Map();
const RATE_LIMIT = 10;   // max sends per IP per hour
const WINDOW_MS = 3600_000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = sendCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    sendCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// Max text length to prevent abuse (50KB is generous for a digest)
const MAX_TEXT_LENGTH = 50_000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const { to, text, depth = 'standard', lang = 'en' } = req.body || {};

  // Validate recipient
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'No digest text provided' });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: 'Digest text too long' });
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
      body: JSON.stringify({ from: DEFAULT_FROM, to: [to], subject, html }),
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
