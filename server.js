const express = require('express');
const cors    = require('cors');
const yf      = require('yahoo-finance2').default;

const app  = express();
const PORT = process.env.PORT || 3000;

// Railway + all origins
app.set('trust proxy', 1);

// Allow Railway domain explicitly
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(cors({ origin: '*', methods: ['GET','OPTIONS'] }));
app.options('*', cors());
app.use(express.static('public'));

// ── قائمة كل الأسهم المصرية مع سيمبول Yahoo Finance
// Yahoo Finance بيستخدم ".CA" لأسهم البورصة المصرية
const TICKERS = [
  'COMI.CA','SWDY.CA','TMGH.CA','ETEL.CA','MFPC.CA','EAST.CA','EGAL.CA',
  'ABUK.CA','QNBE.CA','ALCN.CA','EFIH.CA','FWRY.CA','HDBK.CA','ORAS.CA',
  'EMFD.CA','ADIB.CA','EFID.CA','HRHO.CA','BTFH.CA','JUFO.CA','IRON.CA',
  'FERC.CA','GBCO.CA','FAIT.CA','CIEB.CA','ORHD.CA','CANA.CA','EGCH.CA',
  'PHDC.CA','SCTS.CA','RAYA.CA','OCDI.CA','EXPA.CA','VALU.CA','HELI.CA',
  'EFIC.CA','SKPC.CA','CLHO.CA','ARCC.CA','MCQE.CA','TAQA.CA','POUL.CA',
  'MBSC.CA','ORWE.CA','UBEE.CA','SCEM.CA','MTIE.CA','PHAR.CA','SAUD.CA',
  'EGSA.CA','MASR.CA','ISPH.CA','TALM.CA','CICH.CA','ATQA.CA','AMOC.CA',
  'EGBE.CA','CIRA.CA','MHOT.CA','MOIL.CA','RMDA.CA','IFAP.CA','OLFI.CA',
  'BINV.CA','CSAG.CA','EGTS.CA','ISMQ.CA','DOMT.CA','ELEC.CA','SUGR.CA',
  'EGAS.CA','MOIN.CA','ACAP.CA','MIPH.CA','AMES.CA','ZMID.CA','SPIN.CA',
  'BIOC.CA','MPRC.CA','NIPH.CA','CNFN.CA','ENGC.CA','NAPR.CA','AXPH.CA',
  'PRDC.CA','GOUR.CA','CPCI.CA','SVCE.CA','MPCI.CA','MICH.CA','KABO.CA',
  'AJWA.CA','AMIA.CA','OCPH.CA','ACGC.CA','UNIT.CA','ELKA.CA','LCSW.CA',
  'ASCM.CA','SDTI.CA','AFMC.CA','ADCI.CA','EDFM.CA','INFI.CA','ADPC.CA',
];

// ── كاش في الذاكرة — بيتحدث كل 10 ثواني
let cache     = {};
let lastFetch = 0;
let isFetching = false;

// جيب الأسعار من Yahoo Finance
async function fetchPrices() {
  if (isFetching) return;
  isFetching = true;
  console.log(`[${new Date().toISOString()}] Fetching ${TICKERS.length} tickers...`);

  // Yahoo Finance بيسمح بـ ~50 طلب في نفس الوقت — نقسمهم في batches
  const BATCH = 40;
  const results = {};

  for (let i = 0; i < TICKERS.length; i += BATCH) {
    const batch = TICKERS.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (symbol) => {
        try {
          const quote = await yf.quote(symbol, {}, { validateResult: false });
          const ticker = symbol.replace('.CA', '');
          results[ticker] = {
            ticker,
            price:     quote.regularMarketPrice        ?? null,
            prevClose: quote.regularMarketPreviousClose ?? null,
            chg:       quote.regularMarketChange        ?? null,
            chgPct:    quote.regularMarketChangePercent ?? null,
            open:      quote.regularMarketOpen          ?? null,
            high:      quote.regularMarketDayHigh       ?? null,
            low:       quote.regularMarketDayLow        ?? null,
            volume:    quote.regularMarketVolume        ?? null,
            high52:    quote.fiftyTwoWeekHigh           ?? null,
            low52:     quote.fiftyTwoWeekLow            ?? null,
            cap:       quote.marketCap                  ?? null,
            pe:        quote.trailingPE                 ?? null,
            eps:       quote.epsTrailingTwelveMonths    ?? null,
            name:      quote.shortName                  ?? ticker,
            ts:        Date.now(),
          };
        } catch (e) {
          // سهم مش موجود في Yahoo أو خطأ — نتجاهله
        }
      })
    );
    // استنى شوية بين الـ batches عشان ما تحجبش
    if (i + BATCH < TICKERS.length) await sleep(500);
  }

  cache     = results;
  lastFetch = Date.now();
  isFetching = false;
  console.log(`[${new Date().toISOString()}] Done. Got ${Object.keys(results).length} quotes.`);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── API Endpoints ──────────────────────────────────────────────

// GET /api/prices — كل الأسعار
app.get('/api/prices', (req, res) => {
  res.json({
    ok:        true,
    count:     Object.keys(cache).length,
    lastFetch: lastFetch,
    age:       Math.round((Date.now() - lastFetch) / 1000) + 's',
    data:      cache,
  });
});

// GET /api/price/:ticker — سهم واحد
app.get('/api/price/:ticker', (req, res) => {
  const t = req.params.ticker.toUpperCase();
  if (cache[t]) {
    res.json({ ok: true, data: cache[t] });
  } else {
    res.status(404).json({ ok: false, error: 'Ticker not found', ticker: t });
  }
});

// GET /api/health — حالة السيرفر
app.get('/api/health', (req, res) => {
  res.json({
    ok:        true,
    tickers:   TICKERS.length,
    cached:    Object.keys(cache).length,
    lastFetch: new Date(lastFetch).toISOString(),
    age:       Math.round((Date.now() - lastFetch) / 1000) + 's',
  });
});

// ── تحديث تلقائي كل 10 ثواني ──
async function startAutoRefresh() {
  await fetchPrices(); // تحميل أول مرة
  setInterval(fetchPrices, 10_000); // كل 10 ثواني
}

app.listen(PORT, () => {
  console.log(`EGX Live API running on port ${PORT}`);
  startAutoRefresh();
});
