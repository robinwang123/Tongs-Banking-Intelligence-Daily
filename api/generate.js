// Called by the frontend Generate button
import { generateDigest } from './_digest.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { lang = 'en', depth = 'standard', topic = '' } = req.body || {};

  try {
    const { text } = await generateDigest({ lang, depth, topic });
    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
