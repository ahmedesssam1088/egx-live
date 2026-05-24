const express   = require('express');
const cors      = require('cors');
const WebSocket = require('ws');

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
  'AMES','AMIA','AMOC','AMPI','ANCC','ANFI','APSW','ARAB','ARCC','AREH',
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
  'NAHO','NAPR','NINH','NIPH',
  'OCDI','OCPH','OFH','OIH','OLFI','ORAS','ORHD','ORWE',
  'PHAR','PHDC','PHGC','PHTV','POUL','PRDC',
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

    // اشترك في الأسهم على batches عشان ما يرفضش
    const symbols = EGX_TICKERS.map(t => `EGX:${t}`);
    const BATCH = 20;
    for (let i = 0; i < symbols.length; i += BATCH) {
      const batch = symbols.slice(i, i + BATCH);
      setTimeout(() => {
        try {
          ws.send(tvMsg('quote_add_symbols', [quoteSession, ...batch]));
        } catch(e) {}
      }, i * 100);
    }
    console.log(`[${new Date().toISOString()}] 📡 Subscribed to ${symbols.length} EGX symbols`);
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
  const age = Math.round((Date.now() - lastUpdate) / 1000);
  res.json({
    ok:         true,
    wsConnected,
    cached:     Object.keys(priceCache).length,
    lastUpdate: new Date(lastUpdate).toISOString(),
    age:        age + 's',
    status:     wsConnected ? '🟢 live' : '🔴 reconnecting',
  });
});

// ══════════════════════════════════════════════════════
// START
// ══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n🚀 EGX Live Server on port ${PORT}`);
  console.log(`📡 Connecting to TradingView WebSocket...`);
  connectTradingView();
});
