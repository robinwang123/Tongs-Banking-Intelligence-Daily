// GET  -> return current { paused, updatedAt }
// POST -> update state { paused: bool }, commits change back to GitHub
// Requires env vars: GITHUB_TOKEN (repo scope), GITHUB_OWNER, GITHUB_REPO (owner/repo optional overrides)

const OWNER    = process.env.GITHUB_OWNER || 'robinwang123';
const REPO     = process.env.GITHUB_REPO  || 'Tongs-Banking-Intelligence-Daily';
const FILE_PATH = 'data/schedule-state.json';
const BRANCH   = 'main';
const TOKEN    = process.env.GITHUB_TOKEN;

async function getFile() {
  const r = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' } }
  );
  if (!r.ok) throw new Error(`Failed to read state file (${r.status})`);
  const d = await r.json();
  const content = JSON.parse(Buffer.from(d.content, 'base64').toString('utf-8'));
  return { content, sha: d.sha };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { content } = await getFile();
      return res.status(200).json(content);
    }

    if (req.method === 'POST') {
      if (!TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured on server' });
      const { paused } = req.body || {};
      const { sha } = await getFile();
      const newContent = { paused: !!paused, updatedAt: new Date().toISOString() };
      const b64 = Buffer.from(JSON.stringify(newContent, null, 2)).toString('base64');

      const r = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Toggle scheduled delivery: paused=${!!paused}`,
            content: b64,
            sha,
            branch: BRANCH,
          }),
        }
      );
      if (!r.ok) {
        const err = await r.json();
        throw new Error(err.message || `GitHub write failed (${r.status})`);
      }
      return res.status(200).json(newContent);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
