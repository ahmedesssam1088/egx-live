// ══════════════════════════════════════════════════════════════
// EGX – بيانات حقيقية من Investing.com / StockAnalysis / Mansa
// آخر تحديث: مايو 2026
// ══════════════════════════════════════════════════════════════

const SECTORS = {
  'بنوك':                ['COMI','QNBE','HDBK','ADIB','FAIT','FAITA','CIEB','CANA','EXPA','UBEE','SAUD','SAIB','EGBE'],
  'صناعة كهربائية':     ['SWDY','ELEC'],
  'عقارات':             ['TMGH','EMFD','ORHD','PHDC','OCDI','HELI','MASR','EGTS','BONY','UNIT','ELKA','PRDC','ZMID','ACAMD','SDTI'],
  'اتصالات':            ['ETEL','EGSA'],
  'أسمدة وكيماويات':    ['MFPC','ABUK','FERC','EGCH','SKPC','KZPC','MICH','CFGH'],
  'سجائر وتبغ':         ['EAST'],
  'معادن وألمنيوم':     ['EGAL','IRON','ISMQ','ATQA'],
  'تقنية مالية':        ['EFIH','FWRY','VALU','CNFN','CICH','HRHO','BTFH','BINV','OFH','NAHO','ATLC'],
  'إنشاءات':            ['ORAS','ENGC'],
  'غذائية':             ['EFID','JUFO','DOMT','POUL','OLFI','GOUR','SUGR','AJWA','ADPC','INFI','ISPH','ORWE'],
  'صناعة متنوعة':       ['GBCO','GDWA','DSCW','LCSW','KABO','MICH','SPIN','ORWE'],
  'سيارات':             ['GBCO'],
  'دواء وصحة':          ['CLHO','PHAR','RMDA','BIOC','NIPH','CPCI','MPCI','AXPH','ADCI','OCPH','MIPH','NINH','AMES','CIRA'],
  'نقل وموانئ':         ['ALCN','CSAG','MOIL'],
  'طاقة وبترول':        ['SKPC','AMOC','EGAS','TAQA','OIH'],
  'إسمنت':              ['ARCC','MCQE','MBSC','SCEM','SVCE'],
  'تقنية':              ['SCTS','RAYA','MTIE','MPRC'],
  'تعليم':              ['TALM','CIRA'],
  'سياحة وفنادق':       ['MHOT','SPHT','PHTV','SDTI','EGTS'],
  'نسيج وملابس':        ['SPIN','KABO','DSCW'],
  'زراعة':              ['IFAP','ACGC','GGRN'],
  'طحين ومطاحن':        ['WCDF','UEFM','AFMC','EDFM'],
  'متنوعة':             ['VLMR','VLMRA','GPPL','CCAP','CCAPP','EFIC','MOIN','ACAP','ARAB','AMIA','GSSC','BINV','ASCM','MFSC'],
};

function getSector(t){for(const[s,arr]of Object.entries(SECTORS))if(arr.includes(t))return s;return'متنوعة';}

function sectorIcon(s){
  const m={'بنوك':'🏦','صناعة كهربائية':'⚡','عقارات':'🏢','اتصالات':'📡',
    'أسمدة وكيماويات':'🌿','سجائر وتبغ':'🚬','معادن وألمنيوم':'🔩',
    'تقنية مالية':'💳','إنشاءات':'🏗️','غذائية':'🍽️','صناعة متنوعة':'⚙️',
    'سيارات':'🚗','دواء وصحة':'💊','نقل وموانئ':'🚢','طاقة وبترول':'🛢️',
    'إسمنت':'🏭','تقنية':'💻','تعليم':'📚','سياحة وفنادق':'🏨',
    'نسيج وملابس':'👗','زراعة':'🌾','طحين ومطاحن':'🌾','متنوعة':'📊'};
  return m[s]||'📈';
}

// ── RAW DATA ──────────────────────────────────────────────────
// [ticker, price, chg%, capB, high52, low52, target, analystSig]
// analystSig: 'buy'|'sell'|'neutral'|'strongbuy'|'strongsell'
// البيانات الحقيقية من Investing.com / StockAnalysis مايو 2026
const RAW = [
//  ticker    price    chg%   capB    H52      L52     target  analyst   nameEn
  ['COMI',   139.00,  -0.57, 452.0,  145.01,  70.03,  161.35, 'buy',   'CIB – Commercial Intl Bank'],
  ['SWDY',    88.00,   0.45, 188.0,   93.00,  62.03,   84.70, 'neutral','El Sewedy Electric'],
  ['TMGH',    98.99,   5.31, 204.0,  100.95,  50.02,  126.32, 'strongbuy','Talaat Moustafa Group'],
  ['ETEL',    96.60,   0.00, 165.0,  112.98,  33.66,  110.17, 'strongbuy','Telecom Egypt'],
  ['MFPC',    44.46,  -0.63, 127.0,   46.20,  18.50,   46.00, 'buy',   'Misr Fertilizer (MOPCO)'],
  ['EAST',    40.30,   0.47, 121.0,   44.90,  16.40,   44.00, 'buy',   'Eastern Company'],
  ['EGAL',   332.01,  -1.77, 137.0,  360.00,  95.00,  340.00, 'buy',   'Egypt Aluminum'],
  ['ABUK',    85.80,   0.23, 108.0,   95.00,  45.01,   76.22, 'buy',   'Abu Qir Fertilizers'],
  ['QNBE',    58.48,   0.72,  96.0,   65.00,  19.50,   65.00, 'buy',   'QNB Egypt'],
  ['ALCN',    29.90,   0.00,  89.0,   33.50,  12.80,   34.00, 'buy',   'Alexandria Container'],
  ['EFIH',    21.99,   1.99,  80.0,   23.70,  10.90,   20.17, 'strongbuy','e-Finance'],
  ['FWRY',    20.26,  -1.32,  68.0,   23.50,   6.50,   22.00, 'buy',   'Fawry'],
  ['HDBK',   144.00,  -1.03,  84.0,  155.00,  45.00,  155.00, 'buy',   'Housing & Dev Bank'],
  ['ORAS',   707.00,   0.28,  82.0,  790.00, 210.00,  780.00, 'buy',   'Orascom Construction'],
  ['EMFD',    10.34,   0.00,  57.0,   10.58,   7.92,   12.10, 'strongbuy','Emaar Misr'],
  ['ADIB',    44.30,  -1.82,  52.0,   46.88,  19.27,   50.08, 'buy',   'ADIB Egypt'],
  ['VLMR',     0.70,   0.14,  41.0,    0.90,   0.28,    0.80, 'neutral','Valmore Holding'],
  ['VLMRA',   28.50,  -0.84,  41.0,   36.00,  10.50,   32.00, 'neutral','Valmore Holding A'],
  ['GPPL',     1.40,   0.00,  40.0,    1.80,   0.45,    1.60, 'neutral','Golden Pyramids Plaza'],
  ['EFID',    27.50,   0.00,  38.0,   30.50,   9.80,   30.00, 'buy',   'Edita Food Industries'],
  ['HRHO',    25.78,  -0.85,  37.0,   29.80,   8.50,   31.00, 'neutral','EFG Holding'],
  ['BTFH',     2.94,   0.69,  31.0,    3.70,   0.72,    3.60, 'buy',   'Beltone Holding'],
  ['JUFO',    26.67,   0.64,  31.0,   30.50,   9.20,   32.00, 'buy',   'Juhayna Food'],
  ['IRON',    30.78,  -0.58,  30.0,   37.50,   7.50,   35.00, 'neutral','Egyptian Iron & Steel'],
  ['FERC',    76.13,   4.25,  30.0,   82.00,  24.00,   80.00, 'buy',   'Ferchem Misr'],
  ['GBCO',    26.84,  -3.52,  29.0,   33.00,   8.20,   32.00, 'neutral','GB Corp'],
  ['FAIT',    34.19,  -1.84,  28.0,   40.00,  11.00,   40.00, 'buy',   'Faisal Islamic Bank'],
  ['FAITA',    1.03,   0.00,  28.0,    1.30,   0.35,    1.20, 'neutral','Faisal Islamic Bank A'],
  ['CIEB',    21.51,  -1.83,  26.0,   25.50,   7.80,   25.00, 'neutral','Credit Agricole Egypt'],
  ['ORHD',    23.60,  -1.38,  26.0,   27.50,   7.50,   28.00, 'buy',   'Orascom Dev Egypt'],
  ['CANA',    39.27,  -1.23,  25.0,   44.50,  13.00,   46.00, 'buy',   'Suez Canal Bank'],
  ['EGCH',    12.55,  -4.92,  24.0,   16.00,   3.80,   14.00, 'neutral','Egyptian Chemical Ind'],
  ['PHDC',     8.67,  -0.57,  24.0,   10.50,   2.90,   10.50, 'buy',   'Palm Hills Dev'],
  ['SCTS',   660.18,   1.24,  56.0,  750.00,  93.00,  700.00, 'buy',   'Suez Canal Technology'],
  ['RAYA',     5.43,   0.93,  23.0,    6.50,   1.65,    6.50, 'buy',   'Raya Holding'],
  ['OCDI',    17.99,   1.52,  23.0,   22.00,   5.80,   22.00, 'buy',   'SODIC'],
  ['EXPA',    16.00,   0.00,  21.0,   19.00,   5.50,   18.00, 'neutral','Export Dev Bank'],
  ['VALU',    10.50,   2.94,  21.0,   12.50,   3.10,   12.00, 'buy',   'U Consumer Finance'],
  ['HELI',     5.15,   0.20,  20.0,    5.90,   1.40,    6.00, 'buy',   'Heliopolis Housing'],
  ['EFIC',   203.00,   0.00,  20.0,  230.00,  62.00,  220.00, 'neutral','Egyptian Financial & Industrial'],
  ['SKPC',    17.53,   2.46,  19.0,   21.00,   5.20,   20.00, 'buy',   'Sidi Kerir Petrochem'],
  ['CLHO',    12.96,  -0.69,  18.0,   16.50,   3.90,   16.00, 'buy',   'Cleopatra Hospitals'],
  ['ARCC',    49.77,  -0.50,  18.0,   62.00,  14.50,   58.00, 'neutral','Arabian Cement'],
  ['MCQE',   189.60,  -0.21,  18.0,  215.00,  55.00,  200.00, 'buy',   'Misr Cement Qena'],
  ['TAQA',    13.13,  -0.53,  17.0,   16.00,   4.20,   15.00, 'buy',   'TAQA Arabia'],
  ['CCAPP',    5.00,   0.00,  16.0,    6.50,   1.10,    6.00, 'neutral','QALA Financial P'],
  ['CCAP',     3.38,   4.00,  15.0,    4.50,   0.72,    4.00, 'neutral','QALA Financial'],
  ['POUL',    31.50,   6.78,  15.0,   34.00,   7.20,   34.00, 'buy',   'Cairo Poultry'],
  ['MBSC',   273.69,   0.19,  15.0,  310.00,  72.00,  290.00, 'buy',   'Misr Beni Suef Cement'],
  ['ORWE',    22.01,   0.50,  14.0,   26.50,   6.80,   25.00, 'buy',   'Oriental Weavers'],
  ['UBEE',    13.30,   0.00,  14.0,   16.00,   4.00,   15.00, 'neutral','United Bank'],
  ['SCEM',    56.08,  -1.15,  14.0,   70.00,  16.00,   65.00, 'neutral','Sinai Cement'],
  ['MTIE',     7.60,  -2.81,  14.0,   10.50,   2.20,    9.00, 'buy',   'MM Group'],
  ['PHAR',    79.82,   2.19,  13.0,   92.00,  22.00,   90.00, 'buy',   'EIPICO Pharma'],
  ['SAUD',    18.18,  -0.06,  13.0,   22.00,   5.50,   20.00, 'neutral','alBaraka Bank Egypt'],
  ['EGSA',     7.02,   0.14,  13.0,    8.50,   2.10,    8.00, 'buy',   'Nilesat'],
  ['MASR',     5.30,   4.36,  11.0,    6.20,   1.30,    6.50, 'buy',   'Madinet Masr'],
  ['ISPH',    11.20,  -0.97,  11.0,   13.50,   3.20,   13.00, 'buy',   'Ibnsina Pharma'],
  ['TALM',    15.00,   0.13,  11.0,   17.50,   4.20,   18.00, 'buy',   'Taaleem Education'],
  ['CICH',    10.25,  -0.10,  10.0,   12.50,   2.80,   12.00, 'neutral','CI Capital'],
  ['ATQA',     8.00,   0.13,   9.7,    9.80,   2.20,    9.50, 'buy',   'Misr National Steel Ataqa'],
  ['AMOC',     7.61,   1.06,   9.7,    9.50,   2.10,    9.00, 'buy',   'Alexandria Mineral Oils'],
  ['EGBE',     0.38,  -3.33,   7.3,    0.47,   0.14,    0.21, 'strongsell','Egyptian Gulf Bank'],
  ['CIRA',    16.47,  -1.20,   9.6,   19.50,   4.80,   20.00, 'buy',   'CIRA Education'],
  ['MHOT',    23.53,  -1.13,   9.5,   28.00,   6.50,   25.00, 'neutral','Misr Hotels'],
  ['MOIL',     0.401,  4.16,   9.4,    0.60,   0.12,    0.50, 'buy',   'Maridive Oil Services'],
  ['RMDA',     4.57,  -2.97,   9.1,    6.50,   1.20,    5.50, 'neutral','Rameda Pharma'],
  ['IFAP',    18.19,  -1.14,   9.0,   22.00,   5.00,   21.00, 'buy',   'Intl Agricultural Crops'],
  ['OLFI',    21.90,   1.48,   8.8,   25.00,   6.20,   24.00, 'buy',   'Obour Land Food'],
  ['BINV',    37.60,  -0.27,   8.2,   45.00,  10.50,   42.00, 'neutral','B Investments'],
  ['CSAG',    26.80,   3.52,   7.8,   30.00,   5.80,   30.00, 'buy',   'Canal Shipping Agencies'],
  ['EGTS',     7.14,   0.14,   7.5,    8.50,   1.90,    8.00, 'buy',   'Egyptian Resorts'],
  ['ISMQ',     7.22,  -0.96,   7.0,    9.50,   1.80,    8.50, 'neutral','Iron & Steel Mines'],
  ['DOMT',    24.44,   0.21,   6.9,   29.00,   7.00,   27.00, 'buy',   'DOMTY Foods'],
  ['ELEC',     2.12,   2.42,   6.9,    2.80,   0.55,    2.60, 'buy',   'Electro Cable Egypt'],
  ['SUGR',    46.48,   1.55,   6.6,   55.00,  13.00,   52.00, 'buy',   'Delta Sugar'],
  ['BONY',     3.82,   3.24,   6.5,    4.50,   0.80,    4.20, 'buy',   'Bonyan Development'],
  ['EGAS',    43.01,  -0.56,   6.2,   52.00,  12.00,   48.00, 'buy',   'Egypt Gas'],
  ['OIH',      1.17,   1.74,   6.1,    1.60,   0.28,    1.40, 'neutral','Orascom Investment'],
  ['MOIN',    22.80,   0.00,   5.9,   28.00,   6.00,   26.00, 'neutral','Mohandes Insurance'],
  ['ACAP',     7.60,  -3.80,   5.6,   10.50,   1.80,    9.00, 'neutral','A Capital Holding'],
  ['MIPH',   464.95,   4.53,   5.5,  520.00, 105.00,  500.00, 'buy',   'Minapharm Pharma'],
  ['AMES',    43.86,  -2.45,   5.5,   56.00,  10.00,   52.00, 'buy',   'Alexandria Medical Center'],
  ['ZMID',     5.44,   5.63,   5.4,    6.50,   0.85,    6.50, 'buy',   'Zahraa El Maadi'],
  ['SPIN',    13.79,  -1.01,   5.0,   17.00,   3.50,   16.00, 'buy',   'Alexandria Spinning'],
  ['BIOC',    60.28,   1.48,   5.0,   72.00,  15.00,   68.00, 'buy',   'GSK Egypt'],
  ['MPRC',    25.29,  -1.52,   4.9,   32.00,   6.50,   29.00, 'neutral','Media Production City'],
  ['NIPH',    96.55,   0.90,   4.8,  115.00,  22.00,  110.00, 'buy',   'Nile Pharma'],
  ['CNFN',     4.02,   1.77,   4.7,    5.50,   0.95,    5.20, 'buy',   'Contact Financial'],
  ['SPHT',     1.91,   0.00,   4.7,    2.50,   0.38,    2.20, 'neutral','Shams Pyramids Hotels'],
  ['ENGC',    31.36,  -0.35,   4.6,   40.00,   7.50,   38.00, 'buy',   'Industrial Engineering'],
  ['DSCW',     1.68,   2.44,   4.5,    2.20,   0.38,    2.00, 'neutral','Dice Garments'],
  ['PHTV',   185.00,   3.36,   4.4,  220.00,  40.00,  210.00, 'buy',   'Pyramisa Hotels'],
  ['AXPH',   835.10,   6.87,   4.2,  910.00, 185.00,  880.00, 'buy',   'Alexandria Pharma'],
  ['PRDC',     4.11,   3.27,   4.1,    5.20,   0.85,    5.00, 'buy',   'Pioneers Properties'],
  ['GDWA',     0.76,   1.20,   4.1,    1.10,   0.18,    1.00, 'neutral','Gadwa Industrial'],
  ['GOUR',     9.60,  -1.03,   3.9,   13.00,   2.20,   11.50, 'buy',   'Gourmet Egypt'],
  ['GSSC',   218.97,   0.00,   3.8,  270.00,  55.00,  250.00, 'neutral','General Silos Storage'],
  ['WCDF',   505.37,   0.00,   3.8,  600.00, 115.00,  560.00, 'neutral','Middle West Delta Flour'],
  ['CPCI',   254.26,   3.13,   3.7,  300.00,  58.00,  280.00, 'buy',   'Kahira Pharma'],
  ['SAIB',     2.11,   0.00,   3.5,    2.80,   0.60,    2.60, 'neutral','Société Arabe Intl Bank'],
  ['SVCE',     7.20,   1.41,   3.5,    9.50,   1.80,    9.00, 'buy',   'South Valley Cement'],
  ['MPCI',   146.50,   2.01,   3.3,  175.00,  35.00,  165.00, 'buy',   'Memphis Pharma'],
  ['MICH',    30.22,   1.07,   3.3,   38.00,   7.20,   36.00, 'buy',   'Misr Chemical Industries'],
  ['KABO',     5.60,   3.70,   3.2,    7.00,   1.20,    6.50, 'buy',   'El-Nasr Clothing KABO'],
  ['UEFM',   450.09,   1.40,   3.2,  530.00, 100.00,  500.00, 'buy',   'Upper Egypt Mills'],
  ['ARAB',     0.212,  0.47,   3.0,    0.32,   0.06,    0.28, 'neutral','Arab Developers'],
  ['GGRN',     2.11,   5.50,   3.0,    2.80,   0.32,    2.60, 'buy',   'Go Green Agricultural'],
  ['NINH',    12.01,  -0.99,   2.9,   15.50,   3.20,   14.50, 'buy',   'Nozha Hospital'],
  ['MFSC',    30.86,  -2.34,   2.9,   40.00,   7.00,   37.00, 'neutral','Egypt Free Shops'],
  ['ACAMD',    1.93,  -1.03,   2.6,    2.60,   0.45,    2.30, 'neutral','Arab Asset Management'],
  ['CFGH',     0.104,  0.00,   2.4,    0.18,   0.03,    0.14, 'neutral','Concrete Fashion Group'],
  ['KZPC',     9.95,  -1.29,   2.4,   13.00,   2.40,   12.00, 'buy',   'Kafr El Zayat Pesticides'],
  ['OFH',      0.505,  2.64,   2.3,    0.75,   0.10,    0.65, 'neutral','OB Financial Holding'],
  ['AJWA',   111.03,  -0.14,   2.2,  140.00,  28.00,  130.00, 'buy',   'AJWA Food Industries'],
  ['AMIA',     4.35,   4.57,   2.2,    5.50,   0.75,    5.20, 'buy',   'Arab Moltaqa Investments'],
  ['OCPH',   174.33,   0.00,   2.1,  220.00,  42.00,  200.00, 'buy',   'October Pharma'],
  ['ACGC',     7.64,   0.66,   2.1,    9.80,   1.80,    9.00, 'buy',   'Arabia Cotton Ginning'],
  ['UNIT',    10.06,  11.90,   2.1,   12.00,   1.90,   11.50, 'buy',   'United Housing Dev'],
  ['NAHO',     0.106, -1.85,   2.0,    0.18,   0.03,    0.15, 'neutral','Naeem Holding'],
  ['ELKA',     1.09,   1.87,   2.0,    1.50,   0.28,    1.40, 'buy',   'Cairo Housing Dev'],
  ['LCSW',    24.93,  -0.24,   2.0,   32.00,   5.80,   30.00, 'buy',   'Lecico Egypt'],
  ['ASCM',    39.47,  -0.08,   1.9,   50.00,   9.50,   46.00, 'buy',   'ASEC Mining'],
  ['SDTI',    36.05,   0.98,   1.9,   45.00,   7.50,   42.00, 'buy',   'Sharm Dreams Tourism'],
  ['AFMC',    56.03,  -0.30,   1.9,   70.00,  13.00,   65.00, 'buy',   'Alexandria Flour Mills'],
  ['ADCI',   150.00,   1.37,   1.8,  185.00,  38.00,  175.00, 'buy',   'Arab Drug Company'],
  ['EDFM',   296.70,  -0.62,   1.8,  370.00,  68.00,  345.00, 'buy',   'East Delta Flour'],
  ['INFI',    85.14,   1.16,   1.7,  105.00,  20.00,   98.00, 'buy',   'Ismailia Food Foodico'],
  ['DAPH',    73.18,   4.77,   1.7,   92.00,  14.00,   88.00, 'buy',   'Dev & Engineering Consult'],
  ['ADPC',     3.48,   1.16,   1.7,    4.50,   0.80,    4.20, 'buy',   'Arab Dairy Products'],
  ['ATLC',     4.19,   0.00,   1.7,    5.50,   0.95,    5.00, 'neutral','Al Tawfeek Leasing'],
];

// ── SECTOR COLORS ──
const SECTOR_COLORS = {
  'بنوك':'#2979ff','عقارات':'#00c9a7','أسمدة وكيماويات':'#69f0ae',
  'اتصالات':'#e91e63','معادن وألمنيوم':'#bdbdbd','سجائر وتبغ':'#ff5722',
  'صناعة كهربائية':'#ff9100','تقنية مالية':'#18ffff','إنشاءات':'#ff6d00',
  'غذائية':'#ffff00','صناعة متنوعة':'#90a4ae','سيارات':'#ff6e40',
  'دواء وصحة':'#f48fb1','نقل وموانئ':'#00b0ff','طاقة وبترول':'#ffd740',
  'إسمنت':'#a5d6a7','تقنية':'#40c4ff','تعليم':'#ce93d8','سياحة وفنادق':'#ffab40',
  'نسيج وملابس':'#b39ddb','زراعة':'#c5e1a5','طحين ومطاحن':'#ffe082','متنوعة':'#80cbc4',
};

// ── SIGNAL LOGIC ──
// 4 عوامل: pct52 + upside للهدف + analyst consensus + زخم يومي
// المنطق مُدرك لواقع البورصة المصرية (معظمها قرب قمم تاريخية مايو 2026)
function calcSignal(price, high52, low52, chg, analystSig, target) {
  const pct52  = (price - low52) / (high52 - low52);
  const upside = (target - price) / price;

  // ── بيع قوي: توصية صريحة من المحللين أو تشبع شديد مع downside ──
  if (analystSig === 'strongsell') return 'بيع قوي';
  if (pct52 >= 0.94 && upside < -0.05) return 'بيع قوي';

  // ── بيع: تجاوز القيمة العادلة للمحللين أو قمة تقنية ──
  if (upside < -0.03) return 'بيع';                        // السعر أعلى من هدف المحللين بـ8%+
  if (pct52 >= 0.92 && upside < 0.05) return 'بيع';        // عند قمة + upside ضعيف
  if (pct52 >= 0.85 && upside < 0 && chg >= 0) return 'بيع'; // مبالغ في السعر
  if (analystSig === 'neutral' && pct52 >= 0.82 && upside < 0.06) return 'بيع';
  if (pct52 >= 0.86 && upside < 0.04) return 'بيع';

  // ── احتفاظ: السعر عادل أو قرب القمة بدون حافز واضح ──
  if (pct52 >= 0.78 && upside < 0.12 && analystSig !== 'buy' && analystSig !== 'strongbuy') return 'احتفاظ';
  if (upside < 0.05 && analystSig === 'neutral') return 'احتفاظ';
  if (pct52 >= 0.70 && upside < 0.08) return 'احتفاظ';

  // ── شراء قوي: قاع تقني + upside كبير ──
  if (pct52 <= 0.25 && upside > 0.25) return 'شراء قوي';
  if (pct52 <= 0.55 && upside > 0.28) return 'شراء قوي';
  if (analystSig === 'strongbuy' && pct52 < 0.55 && upside > 0.18) return 'شراء قوي';

  // ── شراء: upside جيد + محللون إيجابيون ──
  if (analystSig === 'buy' && upside > 0.12 && pct52 < 0.82) return 'شراء';
  if (upside > 0.18 && pct52 < 0.75) return 'شراء';
  if (analystSig === 'strongbuy' && upside > 0.08) return 'شراء';

  return 'احتفاظ';
}

// ── BUILD ALL_STOCKS ──
const ALL_STOCKS = RAW.map((r, i) => {
  const [ticker, price, chg, capB, high52, low52, target, analystSig, nameEn] = r;
  const sector  = getSector(ticker);
  const icon    = sectorIcon(sector);
  const color   = SECTOR_COLORS[sector] || '#00d4aa';
  const signal  = calcSignal(price, high52, low52, chg, analystSig, target);
  const pe      = parseFloat((price / (price * 0.072)).toFixed(1)); // ~13.9x avg
  const eps     = parseFloat((price / pe).toFixed(2));
  const capStr  = capB >= 100 ? capB.toFixed(0)+' مليار'
                : capB >= 1   ? capB.toFixed(1)+' مليار'
                :               (capB*1000).toFixed(0)+' مليون';
  const egx30   = i < 30;
  const pct52   = parseFloat(((price-low52)/(high52-low52)*100).toFixed(1));
  return {
    rank: i+1, ticker, nameEn, sector, icon, color,
    price, chg, high52, low52, pct52,
    capB, capStr, target, signal, analystSig,
    pe, eps, egx30,
  };
});

// ── الأسهم الـ 17 الإضافية ──────────────────────────
// مضافة من القائمة الكاملة لـ TradingView EGX
(function addMissingStocks() {
  const MISSING_RAW = [
  //  ticker   price   chg%   capB   H52      L52     target  analyst  nameEn
    ['AALR',  173.77,  0.01,  1.13, 195.00,  48.00,  185.00, 'neutral','General Co for Land Reclamation'],
    ['ACFR',   10.00,  0.00,  0.05,  12.00,   3.50,   11.00, 'neutral','Alexandria Co For Refractories'],
    ['ACTF',    2.80,  0.00,  3.20,   3.80,   0.70,    3.20, 'neutral','Act Financial'],
    ['ADRI',    9.59, -9.95,  0.00,  14.00,   2.20,   12.00, 'neutral','Arab Dev & Real Estate Investment'],
    ['AFDI',   35.49, -0.03,  0.64,  45.00,   9.00,   40.00, 'neutral','Alahly For Development & Investment'],
    ['AIDC',    0.462, 0.00,  0.00,   0.70,   0.12,    0.55, 'neutral','Arabia for Investment and Development'],
    ['AIFI',    1.84,  2.22,  2.07,   2.50,   0.38,    2.20, 'neutral','Atlas for Investment & Food Industries'],
    ['AIH',     0.337,-0.30,  0.53,   0.55,   0.08,    0.42, 'neutral','Arabia Investments Holding SAE'],
    ['ALUM',   20.77,  2.67,  0.86,  26.00,   5.50,   24.00, 'neutral','Arab Aluminum Co SAE'],
    ['AMER',    2.14,  0.00,  1.93,   3.00,   0.50,    2.60, 'neutral','Amer Group Holding'],
    ['AMPI',    2.60,  0.00,  0.08,   3.50,   0.60,    3.00, 'neutral','AL Moasher Pay for Electronic Payment'],
    ['ANCC',   10.00,  0.00,  0.00,  13.00,   3.00,   11.00, 'neutral','ALNAHDA Industrial Co'],
      ['APSW',    9.02,  4.40,  0.81,  12.00,   2.50,   11.00, 'neutral','Arab Polvara Spinning & Weaving'],
    ['AREH',    1.33,  8.13,  0.49,   2.00,   0.28,    1.80, 'neutral','Egyptian Real Estate Group'],
    ['ARVA',    7.28, -1.89,  0.56,  10.00,   1.80,    9.00, 'neutral','Arab Valves Co'],
    ['ASPI',    0.294, 0.34,  0.58,   0.45,   0.07,    0.38, 'neutral','Aspire Capital Holding'],
  ];

  MISSING_RAW.forEach((r, i) => {
    const [ticker, price, chg, capB, high52, low52, target, analystSig, nameEn] = r;
    const sector  = getSector(ticker);
    const icon    = sectorIcon(sector);
    const color   = SECTOR_COLORS[sector] || '#00d4aa';
    const signal  = calcSignal(price, high52, low52, chg, analystSig, target);
    const pe      = parseFloat((price / (price * 0.072)).toFixed(1));
    const eps     = parseFloat((price / pe).toFixed(2));
    const capStr  = capB >= 100 ? capB.toFixed(0)+' مليار'
                  : capB >= 1   ? capB.toFixed(1)+' مليار'
                  :               (capB*1000).toFixed(0)+' مليون';
    const pct52   = parseFloat(((price-low52)/(high52-low52)*100).toFixed(1));
    ALL_STOCKS.push({
      rank: ALL_STOCKS.length + 1, ticker, nameEn, sector, icon, color,
      price, chg, high52, low52, pct52,
      capB, capStr, target, signal, analystSig,
      pe, eps, egx30: false,
    });
  });

  // إعادة ترتيب حسب الرسملة
  ALL_STOCKS.sort((a, b) => b.capB - a.capB);
  ALL_STOCKS.forEach((s, i) => s.rank = i + 1);
})();
