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
  } catch (e) {
    console.error(`[serper] Search failed for "${query}":`, e.message);
    return [];
  }
}

function fmtResults(results) {
  if (!results.length) return '(no results)';
  return results.map((r, i) => `${i+1}. [${r.title}](${r.url})\n   ${r.snippet}`).join('\n');
}

function getLastWeek() {
  const d = new Date(); d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

// ── Expanded Source Lists ──

const SITES = [
  // Original sites
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
  // New: Asia-Pacific
  { name: 'Nikkei Asia',                url: 'https://asia.nikkei.com' },
  { name: 'South China Morning Post',    url: 'https://www.scmp.com/business/banking-finance' },
  { name: 'The Straits Times',           url: 'https://www.straitstimes.com/business/banking' },
  { name: 'Economic Times India',        url: 'https://economictimes.indiatimes.com/industry/banking/finance' },
  // New: Regulation
  { name: 'FSB',                         url: 'https://www.fsb.org' },
  { name: 'BIS Innovation Hub',          url: 'https://www.bis.org/about/bisih.htm' },
  { name: 'EBA',                         url: 'https://www.eba.europa.eu' },
  // New: Banking industry
  { name: 'The Banker',                  url: 'https://www.thebanker.com' },
  { name: 'Central Banking',             url: 'https://www.centralbanking.com' },
];

const BLOGS = [
  // Original blogs
  { name: 'Fintech Takes (Alex Johnson)', url: 'https://fintechtakes.com' },
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
  // New: AI + Banking verticals
  { name: 'Emerj AI in Banking',        url: 'https://emerj.com/ai-in-banking/' },
  { name: 'VentureBeat AI Enterprise',   url: 'https://venturebeat.com/category/ai/' },
  { name: 'CB Insights Fintech',         url: 'https://www.cbinsights.com/research-fintech' },
  { name: 'Net Interest (Marc Rubinstein)', url: 'https://netinterest.substack.com' },
];

const PODCASTS = [
  // Original podcasts
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
  // New podcasts
  { name: 'Money Talks (The Economist)',  url: 'https://www.economist.com/podcasts/money-talks' },
  { name: 'Planet Money (NPR)',           url: 'https://www.npr.org/sections/money/' },
  { name: 'Banking on AI',               url: 'https://bankingonai.buzzsprout.com' },
];

const LANG_INSTRUCTIONS = {
  en: 'Output language: English. All body text, headings, and section titles in English.',
  zh: '输出语言：中文。所有正文、标题、板块名称全部用中文。专有名词保留英文（AI、LLM、API、Basel、PSD3、ISO 20022 等）。',
  de: 'Ausgabesprache: Deutsch. Alle Texte und Abschnittstitel auf Deutsch. Technische Fachbegriffe dürfen auf Englisch bleiben.',
};

const DEPTH_INSTRUCTIONS = {
  standard: 'Sections 2–7: 120–160 words each. Section 1 (AI × Banking IT): always 250+ words regardless.',
  deep:     'Sections 2–7: 280–350 words each with strategic analysis. Section 1 (AI × Banking IT): 400+ words.',
  brief:    'Output ONLY Section 1 (AI × Banking IT, 200 words) and Section 2 (Today\'s Highlights, 3 items). Skip all others.',
};

const SECTION_LABELS = {
  en: {
    ai:'🤖 AI × Banking IT — Deep Briefing',
    top:"📊 Today's Highlights",
    prod:'🏦 Product Pulse',
    biz:'💡 Business Model Insights',
    reg:'🌐 Regulatory & Compliance Radar',
    apac:'🌏 Asia-Pacific Banking Signal',
    read:"🔗 Today's Reads",
    sig:'📌 Signal vs. Noise'
  },
  zh: {
    ai:'🤖 AI × 银行 IT — 深度专版',
    top:'📊 今日要点',
    prod:'🏦 产品动态',
    biz:'💡 商业模式洞察',
    reg:'🌐 监管与合规雷达',
    apac:'🌏 亚太银行信号',
    read:'🔗 今日精读',
    sig:'📌 信号与噪音'
  },
  de: {
    ai:'🤖 KI × Banking IT — Tiefenanalyse',
    top:'📊 Top-Meldungen',
    prod:'🏦 Produkt-Pulse',
    biz:'💡 Geschäftsmodell-Einblicke',
    reg:'🌐 Regulatorik & Compliance-Radar',
    apac:'🌏 Asien-Pazifik-Banking-Signal',
    read:'🔗 Heutige Lektüre',
    sig:'📌 Signal vs. Rauschen'
  },
};

// ── Claude API with retry ──

async function callClaude(prompt, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3500,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const d = await r.json();

      if (r.ok) {
        const text = d.content?.[0]?.text || '';
        if (text) return text;
        throw new Error('Empty response from Claude');
      }

      // Retry on rate limit or overload
      if (r.status === 429 || r.status === 529) {
        const wait = Math.min(1000 * Math.pow(2, i), 8000);
        console.warn(`[claude] ${r.status}, retry ${i+1}/${retries} in ${wait}ms`);
        await new Promise(resolve => setTimeout(resolve, wait));
        continue;
      }

      throw new Error(d.error?.message || `Claude API ${r.status}`);
    } catch (e) {
      if (i === retries) throw e;
      const wait = Math.min(1000 * Math.pow(2, i), 4000);
      console.warn(`[claude] Error, retry ${i+1}/${retries}:`, e.message);
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
  throw new Error('Claude API failed after retries');
}

export async function generateDigest({ lang = 'en', depth = 'standard', topic = '', maxSearches = 8 }) {
  const SERPER_KEY = process.env.SERPER_API_KEY;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const lastWeek = getLastWeek();
  const topicQ = topic ? ` ${topic}` : '';

  // ── Optimized search queries — less overlap, more targeted ──
  let searchResults = [];
  if (SERPER_KEY) {
    const queries = [
      // AI deployments — named banks & vendors
      `bank AI LLM deployment production ${lastWeek} site:bankingdive.com OR site:finextra.com OR site:americanbanker.com`,
      // Core banking & architecture
      `core banking modernization cloud migration 2026`,
      // Risk & compliance AI
      `bank AI fraud detection AML KYC 2026`,
      // Regulation
      `Basel III PSD3 open banking regulation 2026`,
      // APAC banking
      `Asia Pacific bank digital transformation fintech 2026`,
      // Vendor deals
      `Temenos OR "Thought Machine" OR Backbase bank deal 2026`,
      // Product innovation
      `commercial banking product innovation fintech${topicQ} ${today}`,
      // Business model
      `banking business model strategy M&A partnership 2026`,
    ];

    const useQueries = queries.slice(0, maxSearches);
    console.log(`[digest] Running ${useQueries.length} Serper searches...`);
    const searches = await Promise.all(useQueries.map(q => serperSearch(q, SERPER_KEY, 4)));
    const flat = searches.flat();
    const seen = new Set();
    searchResults = flat.filter(r => { if (seen.has(r.url)) return false; seen.add(r.url); return true; });
    console.log(`[digest] Got ${searchResults.length} unique results from Serper`);
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

CITATION RULES (strictly enforced):
1. Every institution/publication → hyperlink: [Name](url)
2. Every factual claim → cite: ——[Source](url)
3. "${L.read}" section: ONLY verified URLs from search results. Omit if none available.
4. Never invent URLs.
5. Quantitative claims (amounts, percentages, market share, user counts) MUST cite a specific source. If unverifiable, use qualifiers like "reported to be" or "according to multiple reports" — never fabricate numbers.
6. Time scope: only report developments from the last 14 days unless providing background context. If a development's timing is uncertain, note it explicitly.

Generate the digest with EXACTLY these section headers:

### ${L.ai}
⚡ PRIORITY — always most detailed, always first.
Cover with NAMED examples:
(a) Deployments — Which bank deployed what AI tool this week? What business function?
    Format: **[Bank Name](url)** deployed [Vendor/Solution] for [use case] → [metric if available]
(b) Architecture — Core banking modernization (cloud-native, API-first, microservices). Which bank is migrating? What vendor won the contract?
(c) AI in risk — Credit scoring, fraud detection, AML/KYC. New models, new pilots.
(d) Vendor landscape — Who won, who lost? Microsoft vs AWS vs Google Cloud. Temenos vs Thought Machine vs Backbase deal announcements.
(e) Production gap — Which pilots graduated to production? Which were shelved? Why?
MANDATORY: Name at least 3 real banks and 2 real vendors with specifics. If insufficient verified examples, say so explicitly rather than padding.
Min 3 cited sources.

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

### ${L.apac}
[Key developments from APAC banks — China, Singapore, Japan, South Korea, India. Digital yuan, virtual banks, Alipay/WeChat Pay ecosystem, MAS regulations. Cite Nikkei Asia, SCMP, Straits Times, Economic Times.]

---

### ${L.read}
[ONLY verified URLs from search results. Omit section entirely if none.]
- [Title](url) — [why a banking analyst needs this]
- [Title](url) — [why a banking analyst needs this]
- [Title](url) — [why a banking analyst needs this]

---

### ${L.sig}
[One sharp paragraph: genuine strategic signal vs. vendor hype. Direct and opinionated.]`;

  console.log(`[digest] Calling Claude API (lang=${lang}, depth=${depth})...`);
  const text = await callClaude(prompt);
  console.log(`[digest] Generated ${text.length} chars`);
  return { text, lang };
}
