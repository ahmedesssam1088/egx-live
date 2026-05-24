// EGX Live Server v3.0 — 147 stocks
const express   = require('express');
const cors      = require('cors');
const WebSocket = require('ws');
const https     = require('https');

// Fallback: جيب السعر من Yahoo Finance للأسهم المنخفضة التداول
function fetchYahooPrice(ticker) {
  return new Promise((resolve) => {
    const symbol = encodeURIComponent(ticker + '.CA');
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const meta = json?.chart?.result?.[0]?.meta;
          if (meta?.regularMarketPrice) {
            resolve({
              ticker,
              price:    Math.round(meta.regularMarketPrice * 100) / 100,
              chg:      Math.round((meta.regularMarketPrice - meta.previousClose) * 100) / 100,
              chgPct:   Math.round((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 10000) / 100,
              prevClose:meta.previousClose,
              high52:   meta.fiftyTwoWeekHigh,
              low52:    meta.fiftyTwoWeekLow,
              ts:       Date.now(),
              source:   'yahoo_fallback',
            });
          } else { resolve(null); }
        } catch(e) { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

// كل دقيقتين: جيب الأسهم الناقصة من Yahoo
async function fillMissingFromYahoo() {
  const missing = EGX_TICKERS.filter(t => !priceCache[t]);
  if (missing.length === 0) return;
  console.log(`[${new Date().toISOString()}] 🔍 Fetching ${missing.length} missing from Yahoo: ${missing.join(',')}`);
  for (const ticker of missing) {
    const data = await fetchYahooPrice(ticker);
    if (data) {
      priceCache[ticker] = data;
      lastUpdate = Date.now();
      console.log(`  ✅ Yahoo fallback: ${ticker} = ${data.price}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
}

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.static('public'));

// ══════════════════════════════════════════════════════
// PRICE CACHE
// ══════════════════════════════════════════════════════
let priceCache = {};
let lastUpdate = 0;
let wsConnected = false;

// ══════════════════════════════════════════════════════
// ALL EGX TICKERS
// ══════════════════════════════════════════════════════
const EGX_TICKERS = [
  // القائمة الكاملة من TradingView EGX — 150 سهم
  'AALR','ABUK','ACAMD','ACAP','ACFR','ACGC','ACTF','ADCI','ADIB','ADPC',
  'ADRI','AFDI','AFMC','AIDC','AIFI','AIH','AJWA','ALCN','ALUM','AMER',
  'AMES','AMIA','AMOC','AMPI','ANCC','APSW','ARAB','ARCC','AREH',
  'ARVA','ASCM','ASPI','ATLC','ATQA','AXPH',
  'BINV','BIOC','BONY','BTFH',
  'CANA','CCAP','CCAPP','CFGH','CICH','CIEB','CIRA','CLHO','CNFN','COMI',
  'CPCI','CSAG',
  'DAPH','DOMT','DSCW',
  'EAST','EDFM','EFIC','EFID','EFIH','EGAL','EGAS','EGBE','EGCH','EGSA',
  'EGTS','ELEC','ELKA','EMFD','ENGC','ETEL','EXPA',
  'FAIT','FAITA','FERC','FWRY',
  'GBCO','GDWA','GGRN','GOUR','GPPL','GSSC',
  'HDBK','HELI','HRHO',
  'IFAP','INFI','IRON','ISMQ','ISPH',
  'JUFO',
  'KABO','KZPC',
  'LCSW',
  'MASR','MBSC','MCQE','MFPC','MFSC','MHOT','MICH','MIPH','MOIL','MOIN',
  'MPCI','MPRC','MTIE',
  'NAHO','NINH','NIPH',
  'OCDI','OCPH','OFH','OIH','OLFI','ORAS','ORHD','ORWE',
  'PHAR','PHDC','PHTV','POUL','PRDC',
  'QNBE',
  'RAYA','RMDA',
  'SAIB','SAUD','SCEM','SCTS','SDTI','SKPC','SPHT','SPIN','SUGR','SVCE','SWDY',
  'TALM','TAQA','TMGH',
  'UBEE','UEFM','UNIT',
  'VALU','VLMR','VLMRA',
  'WCDF',
  'ZMID',
];

// ══════════════════════════════════════════════════════
// TRADINGVIEW WEBSOCKET
// ══════════════════════════════════════════════════════
const TV_URL = 'wss://data.tradingview.com/socket.io/websocket';
const TV_HEADERS = {
  'Origin': 'https://www.tradingview.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
};

function genSession() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return 'qs_' + Array.from({length:12}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
}

function wrapMsg(msg) {
  return `~m~${msg.length}~m~${msg}`;
}

function tvMsg(func, args) {
  return wrapMsg(JSON.stringify({ m: func, p: args }));
}

function parsePrice(raw) {
  const n = parseFloat(raw);
  return isNaN(n) ? null : Math.round(n * 100) / 100;
}

let ws = null;
let reconnectTimer = null;
let quoteSession = null;

function connectTradingView() {
  if (ws) {
    try { ws.terminate(); } catch(e) {}
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  console.log(`[${new Date().toISOString()}] 🔌 Connecting to TradingView...`);

  ws = new WebSocket(TV_URL, { headers: TV_HEADERS });

  ws.on('open', () => {
    wsConnected = true;
    quoteSession = genSession();
    console.log(`[${new Date().toISOString()}] ✅ TradingView connected — session: ${quoteSession}`);

    ws.send(tvMsg('set_auth_token', ['unauthorized_user_token']));
    ws.send(tvMsg('quote_create_session', [quoteSession]));
    ws.send(tvMsg('quote_set_fields', [
      quoteSession,
      'lp', 'ch', 'chp',
      'open_price', 'high_price', 'low_price',
      'volume', 'prev_close_price',
      'ask', 'bid',
    ]));

    // اشترك في الأسهم على batches
    // delay صح: batch_index * 300ms (مش i * 100)
    const symbols = EGX_TICKERS.map(t => `EGX:${t}`);
    const BATCH = 30;
    const batches = [];
    for (let i = 0; i < symbols.length; i += BATCH) {
      batches.push(symbols.slice(i, i + BATCH));
    }
    batches.forEach((batch, batchIdx) => {
      setTimeout(() => {
        try {
          if (ws.readyState === 1) { // OPEN
            ws.send(tvMsg('quote_add_symbols', [quoteSession, ...batch]));
            console.log(`[${new Date().toISOString()}] 📦 Batch ${batchIdx+1}/${batches.length}: ${batch.length} symbols`);
          }
        } catch(e) { console.error('Batch send error:', e.message); }
      }, batchIdx * 500); // 500ms بين كل batch
    });
    console.log(`[${new Date().toISOString()}] 📡 Subscribing to ${symbols.length} symbols in ${batches.length} batches...`);
  });

  ws.on('message', (data) => {
    const raw = data.toString();

    // Heartbeat
    if (raw.includes('~h~')) {
      const hb = raw.match(/~h~(\d+)/);
      if (hb) {
        try { ws.send(wrapMsg(`~h~${hb[1]}`)); } catch(e) {}
      }
      return;
    }

    // Parse messages
    const parts = raw.split(/~m~\d+~m~/);
    for (const part of parts) {
      if (!part || part.startsWith('~')) continue;
      try {
        const msg = JSON.parse(part);
        if (msg.m === 'qsd') {
          const payload = msg.p[1];
          const ticker  = (payload.n || '').replace('EGX:', '');
          const v       = payload.v || {};

          const price = parsePrice(v.lp);
          if (!ticker || !price) continue;

          const prev = priceCache[ticker];
          const prevPrice = prev?.price;

          priceCache[ticker] = {
            ticker,
            price,
            chg:      parsePrice(v.ch)   || 0,
            chgPct:   parsePrice(v.chp)  || 0,
            open:     parsePrice(v.open_price),
            high:     parsePrice(v.high_price),
            low:      parsePrice(v.low_price),
            volume:   v.volume ? parseInt(v.volume) : null,
            prevClose:parsePrice(v.prev_close_price),
            ask:      parsePrice(v.ask),
            bid:      parsePrice(v.bid),
            ts:       Date.now(),
            source:   'tradingview_live',
            // flash direction للـ frontend
            dir:      prevPrice ? (price > prevPrice ? 'up' : price < prevPrice ? 'down' : 'flat') : 'flat',
          };
          lastUpdate = Date.now();

          if (!prevPrice || prevPrice !== price) {
            console.log(`  💹 ${ticker}: ${price} (${v.chp >= 0 ? '+' : ''}${v.chp?.toFixed(2)}%)`);
          }
        }
      } catch(e) {}
    }
  });

  ws.on('error', (err) => {
    wsConnected = false;
    console.error(`[${new Date().toISOString()}] ❌ WS Error: ${err.message}`);
  });

  ws.on('close', () => {
    wsConnected = false;
    console.log(`[${new Date().toISOString()}] 🔴 TradingView disconnected — reconnecting in 5s...`);
    reconnectTimer = setTimeout(connectTradingView, 5000);
  });
}

// ══════════════════════════════════════════════════════
// API ENDPOINTS
// ══════════════════════════════════════════════════════

// GET /api/prices — كل الأسعار
app.get('/api/prices', (req, res) => {
  const age = Math.round((Date.now() - lastUpdate) / 1000);
  res.json({
    ok:        true,
    count:     Object.keys(priceCache).length,
    lastUpdate,
    age:       age + 's',
    wsConnected,
    source:    'tradingview_websocket',
    data:      priceCache,
  });
});

// GET /api/price/:ticker — سهم واحد
app.get('/api/price/:ticker', (req, res) => {
  const t = req.params.ticker.toUpperCase();
  const d = priceCache[t];
  if (d) res.json({ ok: true, data: d });
  else   res.status(404).json({ ok: false, error: 'Not found', ticker: t });
});

// GET /api/health
app.get('/api/health', (req, res) => {
  const age     = Math.round((Date.now() - lastUpdate) / 1000);
  const missing = EGX_TICKERS.filter(t => !priceCache[t]);
  res.json({
    ok:          true,
    wsConnected,
    total:       EGX_TICKERS.length,
    cached:      Object.keys(priceCache).length,
    missing:     missing.length,
    missingList: missing,
    lastUpdate:  new Date(lastUpdate).toISOString(),
    age:         age + 's',
    status:      wsConnected ? '🟢 live' : '🔴 reconnecting',
  });
});

// ══════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n🚀 EGX Live Server on port ${PORT}`);
  console.log(`📡 Connecting to TradingView WebSocket...`);
  connectTradingView();
  // بعد 15 ثانية (بعد ما TV يبعت أول batch)، جيب الناقصين من Yahoo
  setTimeout(() => {
    fillMissingFromYahoo();
    // وكرر كل دقيقة
    setInterval(fillMissingFromYahoo, 60_000);
  }, 15_000);
});

// ══════════════════════════════════════════════════════
// AI ANALYSIS ENDPOINT
// ══════════════════════════════════════════════════════
// Node 18+ built-in fetch — أبسط وأسرع من https.request
async function callApi(url, headers, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch(e) { json = { raw: text }; }
    return { status: res.status, body: json };
  } finally {
    clearTimeout(timer);
  }
}

app.post('/api/analyze', async (req, res) => {
  const { provider, prompt } = req.body;
  if (!prompt) return res.status(400).json({ ok: false, error: 'No prompt' });

  // ── قائمة الموديلات المجانية على OpenRouter مرتبة بالأفضل ──
  const FREE_MODELS = [
    'qwen/qwen3-235b-a22b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-r1:free',
    'mistralai/mistral-7b-instruct:free',
  ];

  async function callOpenRouter(model, key, prompt) {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });
    const r = await callApi('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://egx-live-production.up.railway.app',
      },
    }, body);
    const text = r.body?.choices?.[0]?.message?.content;
    if (!text || r.status !== 200) throw new Error(r.body?.error?.message || `HTTP ${r.status}`);
    return { text, model };
  }

  async function callGroq(key, prompt) {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    });
    const r = await callApi('https://api.groq.com/openai/v1/chat/completions', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    }, body);
    const text = r.body?.choices?.[0]?.message?.content;
    if (!text || r.status !== 200) throw new Error(r.body?.error?.message || `HTTP ${r.status}`);
    return { text, model: 'Groq — Llama 3.3 70B' };
  }

  async function callGemini(key, prompt) {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 2048 },
    });
    const r = await callApi(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, { 'Content-Type': 'application/json' }, body);
    const text = r.body?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || r.status !== 200) throw new Error(r.body?.error?.message || `HTTP ${r.status}`);
    return { text, model: 'Gemini 2.5 Flash' };
  }

  try {
    let result = null;

    if (provider === 'groq') {
      const key = process.env.GROQ_API_KEY;
      if (!key) throw new Error('GROQ_API_KEY not set');
      result = await callGroq(key, prompt);
    }

    else if (provider === 'gemini') {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error('GEMINI_API_KEY not set');
      result = await callGemini(key, prompt);
    }

    else if (provider === 'openrouter') {
      const key = process.env.OPENROUTER_API_KEY;
      if (!key) throw new Error('OPENROUTER_API_KEY not set');
      // جرب الموديلات بالترتيب لحد ما واحد يشتغل
      let lastErr = '';
      for (const model of FREE_MODELS) {
        try {
          result = await callOpenRouter(model, key, prompt);
          console.log(`[AI] OpenRouter success with: ${model}`);
          break;
        } catch(e) {
          lastErr = e.message;
          console.log(`[AI] OpenRouter ${model} failed: ${e.message}, trying next...`);
        }
      }
      if (!result) throw new Error(`All OpenRouter models failed. Last: ${lastErr}`);
    }

    else if (provider === 'auto') {
      // Auto: جرب كل المصادر بالترتيب
      const groqKey = process.env.GROQ_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      const orKey = process.env.OPENROUTER_API_KEY;
      let lastErr = '';

      // 1. Groq
      if (groqKey) {
        try { result = await callGroq(groqKey, prompt); }
        catch(e) { lastErr = e.message; console.log('[AI Auto] Groq failed:', e.message); }
      }
      // 2. Gemini
      if (!result && geminiKey) {
        try { result = await callGemini(geminiKey, prompt); }
        catch(e) { lastErr = e.message; console.log('[AI Auto] Gemini failed:', e.message); }
      }
      // 3. OpenRouter free models
      if (!result && orKey) {
        for (const model of FREE_MODELS) {
          try {
            result = await callOpenRouter(model, orKey, prompt);
            console.log(`[AI Auto] OpenRouter success: ${model}`);
            break;
          } catch(e) {
            lastErr = e.message;
          }
        }
      }
      if (!result) throw new Error(`جميع الموديلات فشلت. آخر خطأ: ${lastErr}`);
    }

    else {
      return res.status(400).json({ ok: false, error: `Unknown provider: ${provider}` });
    }

    res.json({ ok: true, text: result.text, model: result.model, provider });

  } catch(e) {
    console.error(`[AI Error] ${provider}:`, e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});
