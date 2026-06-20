// Converts markdown digest text into a fully styled HTML email
// Preserves all hyperlinks and source citations

export function buildSubject({ depth, lang }) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
  const depthLabels = { standard: 'Standard', deep: 'Deep Dive', brief: 'Brief', en: 'Standard', zh: 'Standard', de: 'Standard' };
  const cap = depthLabels[depth] || 'Standard';
  const prefixes = { en: 'Banking Intelligence', zh: '银行业情报简报', de: 'Banking Intelligence' };
  return `${prefixes[lang] || 'Banking Intelligence'} · ${today} · ${cap}`;
}

export function buildEmailHtml({ text, depth, lang }) {
  const depthLabel = { standard: 'Standard', deep: 'Deep Dive', brief: 'Brief' }[depth] || 'Standard';
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Convert markdown to HTML (hyperlinks, bold, headers, lists, hr)
  const body = mdToHtml(text);

  return `<!DOCTYPE html>
<html lang="${lang === 'zh' ? 'zh' : lang === 'de' ? 'de' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Tongs Banking Intelligence Daily</title>
<style>
  :root { color-scheme: light only; }
  /* Force light mode for all email clients — explicit colors on every element */
  body{margin:0;padding:0;background:#f0f4f9 !important;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1a2535 !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  .shell{max-width:680px;margin:0 auto;padding:24px 16px;background:#f0f4f9 !important}
  .header{background:#0B2E4E !important;border-radius:14px 14px 0 0;padding:28px 32px 20px}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px}
  .header-title{font-size:22px;font-weight:700;color:#ffffff !important;letter-spacing:-.3px;line-height:1.2}
  .header-title span{color:#C9A84C !important}
  .header-sub{font-size:12px;color:rgba(255,255,255,.7) !important;margin-top:4px}
  .header-badge{font-size:11px;font-weight:600;padding:4px 10px;border-radius:99px;background:rgba(201,168,76,.25) !important;color:#C9A84C !important;border:1px solid rgba(201,168,76,.4);white-space:nowrap}
  .header-date{font-size:12px;color:rgba(255,255,255,.65) !important;margin-top:12px}
  .depth-tag{display:inline-block;font-size:11px;font-weight:600;padding:2px 9px;border-radius:99px;background:rgba(255,255,255,.15) !important;color:#ffffff !important;border:1px solid rgba(255,255,255,.2);margin-left:8px}
  .card{background:#ffffff !important;border-radius:0 0 14px 14px;border:1px solid #dde4ed;border-top:none}
  .content{padding:28px 32px;background:#ffffff !important}
  .content h1,.content h2{font-size:17px;font-weight:700;color:#0B2E4E !important;margin:22px 0 8px;padding-bottom:8px;border-bottom:1.5px solid #eef2f7}
  .content h1:first-child,.content h2:first-child{margin-top:0;background:#ffffff !important;border-left:3px solid #1a5fa8;padding:12px 14px;border-radius:0 8px 8px 0;border-bottom:none;margin-left:-14px;color:#0B2E4E !important}
  .content h3{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5a7a9a !important;margin:18px 0 5px}
  .content p{font-size:14px;line-height:1.75;color:#1a2535 !important;margin-bottom:12px}
  .content a{color:#1a5fa8 !important;text-decoration:none;border-bottom:1px solid rgba(26,95,168,.3)}
  .content strong{font-weight:600;color:#0B2E4E !important}
  .content ul{padding-left:18px;margin-bottom:12px}
  .content li{font-size:14px;line-height:1.7;color:#1a2535 !important;margin-bottom:5px}
  .content hr{border:none;border-top:1px solid #eef2f7;margin:20px 0}
  .footer{margin-top:16px;padding:0 4px;background:#f0f4f9 !important}
  .footer-inner{font-size:11px;color:#6a7f96 !important;text-align:center;line-height:1.8}
  .footer-inner a{color:#6a7f96 !important;text-decoration:underline}
  .source-bar{background:#f0f5fa !important;border-radius:10px;padding:12px 16px;margin-top:20px;border:1px solid #d8e3ee}
  .source-bar p{font-size:11px;color:#6a7f96 !important;margin:0;line-height:1.6}
  /* Dark mode override — force light appearance even in phone dark mode */
  @media (prefers-color-scheme: dark) {
    body{background:#f0f4f9 !important;color:#1a2535 !important}
    .shell{background:#f0f4f9 !important}
    .card,.content{background:#ffffff !important;color:#1a2535 !important}
    .content p,.content li{color:#1a2535 !important}
    .content h1,.content h2,.content strong{color:#0B2E4E !important}
    .content h3{color:#5a7a9a !important}
    .content a{color:#1a5fa8 !important}
    .content h1:first-child,.content h2:first-child{background:#ffffff !important;color:#0B2E4E !important}
    .source-bar{background:#f0f5fa !important}
    .source-bar p,.footer-inner,.footer-inner a{color:#6a7f96 !important}
    .footer{background:#f0f4f9 !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#f0f4f9;color:#1a2535;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif">
<div class="shell" style="max-width:680px;margin:0 auto;padding:24px 16px;background:#f0f4f9">
  <div class="header">
    <div class="header-top">
      <div>
        <div class="header-title">Tongs <span>Banking</span> Intelligence Daily</div>
        <div class="header-sub">Commercial &amp; Product Analysis · AI × Banking IT Priority</div>
      </div>
      <div class="header-badge">🤖 AI First</div>
    </div>
    <div class="header-date">${today} <span class="depth-tag">${depthLabel}</span></div>
  </div>
  <div class="card" style="background:#ffffff;border-radius:0 0 14px 14px;border:1px solid #dde4ed;border-top:none">
    <div class="content" style="padding:28px 32px;background:#ffffff;color:#1a2535">
      ${body}
      <div class="source-bar" style="background:#f0f5fa !important;border-radius:10px;padding:12px 16px;margin-top:20px;border:1px solid #d8e3ee">
        <p style="font-size:11px;color:#6a7f96 !important;margin:0;line-height:1.6">60 curated sources · McKinsey · Deloitte · BCG · Oliver Wyman · The Financial Brand · Banking Dive · American Banker · Finextra · FinTech Futures · Accenture Banking and 50 more</p>
      </div>
    </div>
  </div>
  <div class="footer" style="margin-top:16px;padding:0 4px;background:#f0f4f9">
    <div class="footer-inner" style="font-size:11px;color:#6a7f96;text-align:center;line-height:1.8">
      Powered by Claude AI + Serper real-time search<br>
      Tongs Banking Intelligence Daily · <a href="#" style="color:#6a7f96 !important;text-decoration:underline">Unsubscribe</a> · <a href="#" style="color:#6a7f96 !important;text-decoration:underline">View in browser</a>
    </div>
  </div>
</div>
</body>
</html>`;
}

function mdToHtml(md) {
  return md
    // Escape only <> that aren't already in markdown links
    .replace(/&(?!amp;|lt;|gt;)/g, '&amp;')
    // Headers (before bold so ** inside headers works)
    .replace(/^### (.+)$/gm, '<h3 style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5a7a9a;margin:18px 0 5px">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:700;color:#0B2E4E;margin:22px 0 8px;padding-bottom:8px;border-bottom:1.5px solid #eef2f7">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:17px;font-weight:700;color:#0B2E4E;margin:22px 0 8px">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600;color:#0B2E4E">$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#1a5fa8;text-decoration:none">$1</a>')
    // HR
    .replace(/^---$/gm, '<hr>')
    // Lists
    .replace(/^[\*\-] (.+)$/gm, '<li style="font-size:14px;line-height:1.7;color:#1a2535;margin-bottom:5px">$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, '<ul>$&</ul>')
    // Paragraphs
    .split('\n\n')
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (/^<(h[1-3]|ul|ol|hr)/.test(p)) return p;
      return '<p style="font-size:14px;line-height:1.75;color:#1a2535;margin-bottom:12px">' + p.replace(/\n/g, '<br>') + '</p>';
    })
    .join('\n');
}
