async function serperSearch(query, apiKey, num = 5) {
  try {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ q: query, num, hl: 'en', gl: 'us' })
    });
    const d = await r.json();
    return (d.organic || []).slice(0, num).map(item => ({
      title: item.title, url: item.link, snippet: item.snippet || ''
    }));
  } catch (e) { return []; }
}

function fmt(results) {
  if (!results.length) return '(no results)';
  return results.map((r, i) => `${i+1}. [${r.title}](${r.url})\n   ${r.snippet}`).join('\n');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { lang = 'en', depth = 'standard', topic = '' } = req.body || {};
  const SERPER_KEY = process.env.SERPER_API_KEY;
  const today = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  const topSites = [
    { name: 'The Financial Brand',    url: 'https://thefinancialbrand.com' },
    { name: 'Banking Dive',           url: 'https://www.bankingdive.com' },
    { name: 'American Banker',        url: 'https://www.americanbanker.com' },
    { name: 'Finextra',               url: 'https://www.finextra.com' },
    { name: 'FinTech Futures',        url: 'https://www.fintechfutures.com' },
    { name: 'McKinsey Financial Services', url: 'https://www.mckinsey.com/industries/financial-services' },
    { name: 'Deloitte Insights Banking', url: 'https://www.deloitte.com/us/en/insights/industry/financial-services' },
    { name: 'Accenture Banking',      url: 'https://www.accenture.com/us-en/insights/banking' },
    { name: 'Oliver Wyman Financial Services', url: 'https://www.oliverwyman.com/our-expertise/industries/financial-services' },
    { name: 'BCG Financial Institutions', url: 'https://www.bcg.com/industries/financial-institutions' },
  ];

  const topBlogs = [
    { name: 'Fintech Takes (Alex Johnson)', url: 'https://www.fintecttakes.com' },
    { name: 'The Finanser (Chris Skinner)', url: 'https://thefinanser.com' },
    { name: 'Tearsheet',              url: 'https://tearsheet.co' },
    { name: '11:FS Insights',         url: 'https://11fs.com/insights' },
    { name: 'Fintech Business Weekly', url: 'https://fintechbusinessweekly.substack.com' },
    { name: 'This Week in Fintech',   url: 'https://thisweekinfintech.com' },
    { name: 'Payments Dive',          url: 'https://www.paymentsdive.com' },
    { name: 'Digital Banking Report', url: 'https://digitalbankingreport.com' },
    { name: 'Sifted Fintech',         url: 'https://sifted.eu/sector/fintech' },
    { name: 'a16z Fintech',           url: 'https://a16z.com/fintech' },
    { name: 'Global Finance Magazine', url: 'https://gfmag.com' },
    { name: 'The Financial Revolutionist', url: 'https://thefr.com' },
  ];

  const topPodcasts = [
    { name: 'Breaking Banks',         url: 'https://breakingbanks.com' },
    { name: 'Fintech Insider (11:FS)', url: 'https://11fs.com/podcast' },
    { name: 'Talking Banking Matters (McKinsey)', url: 'https://www.mckinsey.com/industries/financial-services/our-insights/talking-banking-matters' },
    { name: 'Banking Transformed',    url: 'https://www.jimmarous.com/banking-transformed-podcast' },
    { name: 'Fintech Business Weekly Podcast', url: 'https://fintechbusinessweekly.substack.com' },
    { name: 'Payments on Fire',       url: 'https://www.glenbrook.com/payments-on-fire' },
    { name: 'Barefoot Innovation',    url: 'https://www.joannbarefoot.com/podcast' },
    { name: 'Open Banking Podcast',   url: 'https://openbankingexcellence.org/podcast' },
    { name: 'The Fintech Recap',      url: 'https://fintechrecap.substack.com' },
    { name: 'Fintech Corner (Trovata)', url: 'https://trovata.io/podcast' },
  ];

  const topicQ = topic ? ` ${topic}` : '';
  const queries = [
    `AI LLM banking IT applications deployment${topicQ} ${today}`,
    `commercial banking product innovation fintech${topicQ} ${today}`,
    `banking business model strategy analysis${topicQ} 2026`,
    `banking regulation compliance Basel PSD3${topicQ} ${today}`,
    `bank artificial intelligence technology vendor${topicQ} 2026`,
  ];

  let searchResults = [];
  if (SERPER_KEY) {
    const searches = await Promise.all(queries.map(q => serperSearch(q, SERPER_KEY, 4)));
    const flat = searches.flat();
    const seen = new Set();
    searchResults = flat.filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true; });
  }

  const langMap = {
    en: `Output language: English. All body text, headings, and section titles in English.`,
    zh: `输出语言：中文。所有正文、标题、板块名称全部用中文。专有名词保留英文（AI、LLM、API、Basel、PSD3、ISO 20022 等）。`,
    de: `Ausgabesprache: Deutsch. Alle Texte und Abschnittstitel auf Deutsch. Technische Fachbegriffe dürfen auf Englisch bleiben.`,
  };

  const depthMap = {
    standard: 'Sections 2–6: 120–160 words each. Section 1 (AI × Banking IT): always 250+ words regardless.',
    deep:     'Sections 2–6: 280–350 words each with strategic analysis and competitive dynamics. Section 1 (AI × Banking IT): 400+ words.',
    brief:    'Output ONLY Section 1 (AI × Banking IT, 200 words) and Section 2 (Highlights, 3 items). Skip all others.',
  };

  const topicNote = topic ? `Special focus: "${topic}" — weight this topic across all sections.` : '';

  const realLinks = searchResults.length
    ? `\nVERIFIED SEARCH RESULTS FROM TODAY (use ONLY these URLs for the Reads section):\n${fmt(searchResults)}\n`
    : '';

  const siteRef    = topSites.map(s => `${s.name} <${s.url}>`).join('\n');
  const blogRef    = topBlogs.map(b => `${b.name} <${b.url}>`).join('\n');
  const podcastRef = topPodcasts.map(p => `${p.name} <${p.url}>`).join('\n');

  const L = {
    en: {
      ai:   '🤖 AI × Banking IT — Deep Briefing',
      top:  '📊 Today\'s Highlights',
      prod: '🏦 Product Pulse',
      biz:  '💡 Business Model Insights',
      reg:  '🌐 Regulatory & Compliance Radar',
      read: '🔗 Today\'s Reads',
      sig:  '📌 Signal vs. Noise',
    },
    zh: {
      ai:   '🤖 AI × 银行 IT — 深度专版',
      top:  '📊 今日要点',
      prod: '🏦 产品动态',
      biz:  '💡 商业模式洞察',
      reg:  '🌐 监管与合规雷达',
      read: '🔗 今日精读',
      sig:  '📌 信号与噪音',
    },
    de: {
      ai:   '🤖 KI × Banking IT — Tiefenanalyse',
      top:  '📊 Top-Meldungen',
      prod: '🏦 Produkt-Pulse',
      biz:  '💡 Geschäftsmodell-Einblicke',
      reg:  '🌐 Regulatorik & Compliance-Radar',
      read: '🔗 Heutige Lektüre',
      sig:  '📌 Signal vs. Rauschen',
    },
  }[lang] || { ai:'🤖 AI × Banking IT', top:'📊 Highlights', prod:'🏦 Product', biz:'💡 Business', reg:'🌐 Regulatory', read:'🔗 Reads', sig:'📌 Signal' };

  const prompt = `You are a senior banking strategy analyst specialising in commercial banking product analysis, business model transformation, and AI/IT applications in financial services.
Today is ${today}.

${langMap[lang] || langMap.en}
${depthMap[depth] || depthMap.standard}
${topicNote}
${realLinks}

SOURCE REFERENCES — use hyperlinks throughout:
Top sites:\n${siteRef}
Top blogs:\n${blogRef}
Top podcasts:\n${podcastRef}

CITATION RULES:
1. Every institution/publication → hyperlink: [Name](url)
2. Every factual claim → cite: ——[Source](url)
3. "${L.read}" section: ONLY use URLs from Verified Search Results. Omit section if none available.
4. Never invent URLs.

Generate the digest with EXACTLY these section headers:

### ${L.ai}
⚡ PRIORITY SECTION — always most detailed, always first.
Cover ALL of: (a) specific named-bank AI/LLM deployments this week with dollar figures or metrics where known; (b) IT architecture shifts driven by AI — core banking modernisation, API layers, data infrastructure, cloud; (c) AI in risk, credit underwriting, fraud detection, AML; (d) vendor landscape — which providers (Microsoft Azure, AWS, Google Cloud, Temenos, Thought Machine, Backbase etc.) are winning deals; (e) gap between pilots and production — which banks are scaling vs. stuck. Be specific, analyst-grade, name names.
Min 3 cited sources from reference list.

---

### ${L.top}
1. **[Institution/Source](url)** — [insight] ——[Source](url)
2. **[Institution/Source](url)** — [insight] ——[Source](url)
3. **[Institution/Source](url)** — [insight] ——[Source](url)

---

### ${L.prod}
[New product launches, feature updates, product strategy shifts. What changed, why it matters for product analysts. Cite sources.]

---

### ${L.biz}
[Revenue model shifts, M&A, partnerships, pricing strategy. Incumbent vs. challenger dynamics. Cite McKinsey/BCG/Oliver Wyman/Deloitte where available.]

---

### ${L.reg}
[Regulatory developments affecting product design and IT: Basel III endgame, PSD3, ISO 20022, open banking mandates, AI governance frameworks. Practical impact on product teams. Cite sources.]

---

### ${L.read}
[ONLY verified URLs from search results above. Omit if none.]
- [Title](url) — [why a banking analyst needs this]
- [Title](url) — [why a banking analyst needs this]
- [Title](url) — [why a banking analyst needs this]

---

### ${L.sig}
[One sharp paragraph: genuine strategic signal vs. vendor hype or media noise this week. Direct and opinionated.]`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const d = await r.json();
    if (!r.ok) return res.status(500).json({ error: d.error?.message || 'Generation failed' });
    res.status(200).json({ result: d.content?.[0]?.text || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
