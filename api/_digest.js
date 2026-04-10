// Shared digest generation — used by cron.js, send.js, and generate.js

async function serperSearch(query, apiKey, num = 4) {
  try {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ q: query, num, hl: 'en', gl: 'us' }),
    });
    const d = await r.json();
    return (d.organic || []).slice(0, num).map(item => ({
      title: item.title, url: item.link, snippet: item.snippet || '',
    }));
  } catch { return []; }
}

function fmtResults(results) {
  if (!results.length) return '(no results)';
  return results.map((r, i) => `${i+1}. [${r.title}](${r.url})\n   ${r.snippet}`).join('\n');
}

const SITES = [
  { name: 'The Financial Brand',       url: 'https://thefinancialbrand.com' },
  { name: 'Banking Dive',              url: 'https://www.bankingdive.com' },
  { name: 'American Banker',           url: 'https://www.americanbanker.com' },
  { name: 'Finextra',                  url: 'https://www.finextra.com' },
  { name: 'FinTech Futures',           url: 'https://www.fintechfutures.com' },
  { name: 'McKinsey Financial Services', url: 'https://www.mckinsey.com/industries/financial-services' },
  { name: 'Deloitte Insights Banking', url: 'https://www.deloitte.com/us/en/insights/industry/financial-services' },
  { name: 'Accenture Banking',         url: 'https://www.accenture.com/us-en/insights/banking' },
  { name: 'Oliver Wyman Financial Services', url: 'https://www.oliverwyman.com/our-expertise/industries/financial-services' },
  { name: 'BCG Financial Institutions', url: 'https://www.bcg.com/industries/financial-institutions' },
];

const BLOGS = [
  { name: 'Fintech Takes (Alex Johnson)', url: 'https://www.fintecttakes.com' },
  { name: 'The Finanser (Chris Skinner)', url: 'https://thefinanser.com' },
  { name: 'Tearsheet',                  url: 'https://tearsheet.co' },
  { name: '11:FS Insights',             url: 'https://11fs.com/insights' },
  { name: 'Fintech Business Weekly',    url: 'https://fintechbusinessweekly.substack.com' },
  { name: 'This Week in Fintech',       url: 'https://thisweekinfintech.com' },
  { name: 'Payments Dive',             url: 'https://www.paymentsdive.com' },
  { name: 'Digital Banking Report',    url: 'https://digitalbankingreport.com' },
  { name: 'Sifted Fintech',            url: 'https://sifted.eu/sector/fintech' },
  { name: 'a16z Fintech',              url: 'https://a16z.com/fintech' },
  { name: 'Global Finance Magazine',   url: 'https://gfmag.com' },
  { name: 'The Financial Revolutionist', url: 'https://thefr.com' },
];

const PODCASTS = [
  { name: 'Breaking Banks',            url: 'https://breakingbanks.com' },
  { name: 'Fintech Insider (11:FS)',   url: 'https://11fs.com/podcast' },
  { name: 'Talking Banking Matters (McKinsey)', url: 'https://www.mckinsey.com/industries/financial-services/our-insights/talking-banking-matters' },
  { name: 'Banking Transformed',       url: 'https://www.jimmarous.com/banking-transformed-podcast' },
  { name: 'Fintech Business Weekly Podcast', url: 'https://fintechbusinessweekly.substack.com' },
  { name: 'Payments on Fire',          url: 'https://www.glenbrook.com/payments-on-fire' },
  { name: 'Barefoot Innovation',       url: 'https://www.joannbarefoot.com/podcast' },
  { name: 'Open Banking Podcast',      url: 'https://openbankingexcellence.org/podcast' },
  { name: 'The Fintech Recap',         url: 'https://fintechrecap.substack.com' },
  { name: 'Fintech Corner (Trovata)',  url: 'https://trovata.io/podcast' },
];

const LANG_INSTRUCTIONS = {
  en: 'Output language: English. All body text, headings, and section titles in English.',
  zh: '输出语言：中文。所有正文、标题、板块名称全部用中文。专有名词保留英文（AI、LLM、API、Basel、PSD3、ISO 20022 等）。',
  de: 'Ausgabesprache: Deutsch. Alle Texte und Abschnittstitel auf Deutsch. Technische Fachbegriffe dürfen auf Englisch bleiben.',
};

const DEPTH_INSTRUCTIONS = {
  standard: 'Sections 2–6: 120–160 words each. Section 1 (AI × Banking IT): always 250+ words regardless.',
  deep:     'Sections 2–6: 280–350 words each with strategic analysis. Section 1 (AI × Banking IT): 400+ words.',
  brief:    'Output ONLY Section 1 (AI × Banking IT, 200 words) and Section 2 (Today\'s Highlights, 3 items). Skip all others.',
};

const SECTION_LABELS = {
  en: { ai:'🤖 AI × Banking IT — Deep Briefing', top:'📊 Today\'s Highlights', prod:'🏦 Product Pulse', biz:'💡 Business Model Insights', reg:'🌐 Regulatory & Compliance Radar', read:'🔗 Today\'s Reads', sig:'📌 Signal vs. Noise' },
  zh: { ai:'🤖 AI × 银行 IT — 深度专版', top:'📊 今日要点', prod:'🏦 产品动态', biz:'💡 商业模式洞察', reg:'🌐 监管与合规雷达', read:'🔗 今日精读', sig:'📌 信号与噪音' },
  de: { ai:'🤖 KI × Banking IT — Tiefenanalyse', top:'📊 Top-Meldungen', prod:'🏦 Produkt-Pulse', biz:'💡 Geschäftsmodell-Einblicke', reg:'🌐 Regulatorik & Compliance-Radar', read:'🔗 Heutige Lektüre', sig:'📌 Signal vs. Rauschen' },
};

export async function generateDigest({ lang = 'en', depth = 'standard', topic = '' }) {
  const SERPER_KEY = process.env.SERPER_API_KEY;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const topicQ = topic ? ` ${topic}` : '';

  // Parallel Serper searches
  let searchResults = [];
  if (SERPER_KEY) {
    const queries = [
      `AI LLM banking IT applications deployment${topicQ} ${today}`,
      `commercial banking product innovation fintech${topicQ} ${today}`,
      `banking business model strategy analysis${topicQ} 2026`,
      `banking regulation compliance Basel PSD3${topicQ} ${today}`,
      `bank artificial intelligence technology vendor${topicQ} 2026`,
    ];
    const searches = await Promise.all(queries.map(q => serperSearch(q, SERPER_KEY, 4)));
    const flat = searches.flat();
    const seen = new Set();
    searchResults = flat.filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true; });
  }

  const L = SECTION_LABELS[lang] || SECTION_LABELS.en;
  const realLinks = searchResults.length
    ? `\nVERIFIED SEARCH RESULTS (use ONLY these URLs for the Reads section):\n${fmtResults(searchResults)}\n`
    : '';

  const prompt = `You are a senior banking strategy analyst specialising in commercial banking product analysis, business model transformation, and AI/IT applications in financial services.
Today is ${today}.

${LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS.en}
${DEPTH_INSTRUCTIONS[depth] || DEPTH_INSTRUCTIONS.standard}
${topic ? `Special focus: "${topic}" — weight across all sections.` : ''}
${realLinks}

SOURCE REFERENCES — use hyperlinks throughout:
Sites: ${SITES.map(s => `${s.name} <${s.url}>`).join(', ')}
Blogs: ${BLOGS.map(b => `${b.name} <${b.url}>`).join(', ')}
Podcasts: ${PODCASTS.map(p => `${p.name} <${p.url}>`).join(', ')}

CITATION RULES:
1. Every institution/publication → hyperlink: [Name](url)
2. Every factual claim → cite: ——[Source](url)
3. "${L.read}" section: ONLY verified URLs from search results. Omit if none available.
4. Never invent URLs.

Generate the digest with EXACTLY these section headers:

### ${L.ai}
⚡ PRIORITY — always most detailed, always first.
Cover: (a) named-bank AI/LLM deployments this week with metrics; (b) IT architecture shifts — core banking, API layers, cloud; (c) AI in risk/credit/fraud/AML; (d) vendor landscape (Microsoft Azure, AWS, Google Cloud, Temenos, Thought Machine, Backbase, etc.); (e) pilots vs. production gap.
Min 3 cited sources. Name banks, vendors, figures.

---

### ${L.top}
1. **[Institution](url)** — [insight] ——[Source](url)
2. **[Institution](url)** — [insight] ——[Source](url)
3. **[Institution](url)** — [insight] ——[Source](url)

---

### ${L.prod}
[Product launches, feature updates, strategy shifts. What changed, why it matters. Cited sources.]

---

### ${L.biz}
[Revenue model shifts, M&A, partnerships, pricing. Incumbent vs. challenger dynamics. Cite McKinsey/BCG/Oliver Wyman/Deloitte.]

---

### ${L.reg}
[Basel III endgame, PSD3, ISO 20022, open banking, AI governance. Practical impact on product teams. Cited sources.]

---

### ${L.read}
[ONLY verified URLs from search results. Omit section entirely if none.]
- [Title](url) — [why a banking analyst needs this]
- [Title](url) — [why a banking analyst needs this]
- [Title](url) — [why a banking analyst needs this]

---

### ${L.sig}
[One sharp paragraph: genuine strategic signal vs. vendor hype. Direct and opinionated.]`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'Claude API error');
  return { text: d.content?.[0]?.text || '', lang };
}
