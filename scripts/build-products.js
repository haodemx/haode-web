const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DOCS_DIR = path.join(ROOT, 'docs');
const GENERATED_DATA_FILE = path.join(DATA_DIR, 'products.generated.js');
const STRUCTURE_DOC_FILE = path.join(DOCS_DIR, 'product-structure.md');
const SITEMAP_FILE = path.join(ROOT, 'sitemap.xml');
const ROBOTS_FILE = path.join(ROOT, 'robots.txt');
const SERIES_CHECK_FILE = path.join(ROOT, 'assets', 'products', 'series-update-check.md');
const SITE_URL = 'https://haode.com.mx';
const REDIRECT_PRODUCT_IDS = new Set([
  'aimb-g5-ai-sports',
  'haode-ai-g3-smart-glasses',
  'haode-ai-w610-smart-glasses',
  's1-ai-classic',
  'w630-ai-pro',
]);
const STATIC_SEO_URLS = [
  '/',
  '/app/',
  '/productos/',
  '/productos-ai/',
  '/ai-productos.html',
  '/micas.html',
  '/garantia/',
  '/contacto/',
  '/privacidad/',
  '/eliminacion-de-datos/',
  '/terminos/',
  '/distribuidores/',
  '/categoria/',
  '/categoria/pantallas/',
  '/categoria/iphone-incell/',
  '/categoria/iphone-oled/',
  '/categoria/samsung-incell/',
  '/categoria/samsung-oled/',
  '/categoria/samsung-tipo-original/',
  '/categoria/celulares-samsung/',
  '/categoria/samsung-plegables/',
  '/categoria/fundas/',
  '/categoria/gafas-inteligentes-ai/',
  '/categoria/camaras-inteligentes/',
  '/categoria/maquinas-de-hidrogel/',
  '/categoria/oled-diagnostica/',
  '/ai-mouse.html',
  '/ai-smart-glasses-aimb-g3.html',
  '/ai-smart-glasses-aimb-g5.html',
  '/ai-smart-glasses-s1.html',
  '/ai-smart-glasses-w630.html',
  '/ai-smart-glasses-w610.html',
  '/pantallas-iphone-11-xr-mayoreo/',
  '/pantallas-iphone-incell-mayoreo-mexico/',
  '/pantallas-iphone-oled-mayoreo-mexico/',
  '/pantallas-premium-iphone-samsung-fabrica/',
  '/pantallas-samsung-incell-mayoreo-mexico/',
  '/pantallas-samsung-oled-mayoreo-mexico/',
  '/pantallas-samsung-mayoreo-mexico/',
  '/pantallas-samsung-zflip-zfold-original-mexico/',
  '/fundas-celular-mayoreo-mexico/',
  '/micas-hidrogel-mayoreo-mexico/',
  '/refacciones-celulares-mayoreo-mexico/',
  '/guia-ia-haode-mexico/',
];

const CATEGORY_CONFIG = [
  {
    category: 'iphone-incell',
    folder: 'iphone-incell',
    brand: 'iPhone',
    quality: 'INCELL FHD',
    modelLabel(slug) {
      const aliases = {
        x: 'iPhone X',
        xs: 'iPhone XS',
        xr: 'iPhone XR',
        xsmax: 'iPhone XS Max',
        '11': 'iPhone 11',
        '11pro': 'iPhone 11 Pro',
        '11promax': 'iPhone 11 Pro Max',
        '12mini': 'iPhone 12 mini',
        '12-12pro': 'iPhone 12 / 12 Pro',
        '12promax': 'iPhone 12 Pro Max',
        '13': 'iPhone 13',
        '13mini': 'iPhone 13 mini',
        '13pro': 'iPhone 13 Pro',
        '13promax': 'iPhone 13 Pro Max',
        '14': 'iPhone 14',
        '14plus': 'iPhone 14 Plus',
        '14pro': 'iPhone 14 Pro',
        '14promax': 'iPhone 14 Pro Max',
        '15': 'iPhone 15',
        '15plus': 'iPhone 15 Plus',
        '15pro': 'iPhone 15 Pro',
        '15promax': 'iPhone 15 Pro Max',
        '16': 'iPhone 16',
        '16plus': 'iPhone 16 Plus',
        '16pro': 'iPhone 16 Pro',
        '16promax': 'iPhone 16 Pro Max',
      };
      return aliases[slug] || `iPhone ${slug.toUpperCase()}`;
    },
    priceQueries(model, slug) {
      const base = model.replace(/^IPHONE\s+/i, '');
      if (slug === '14pro') {
        return [
          `${base} FDH`,
          `${base} FHD`,
          `${base} INCELL`,
        ];
      }
      return [
        `${base} INCELL`,
        `${base} FHD`,
        `${base} FDH`,
      ];
    },
    fallbackImage: 'assets/products/iphone-incell/main.jpg',
  },
  {
    category: 'iphone-oled',
    folder: 'iphone-oled',
    brand: 'iPhone',
    quality: 'OLED PREMIUM',
    modelLabel(slug) {
      const aliases = {
        x: 'iPhone X',
        xsmax: 'iPhone XS Max',
        '11': 'iPhone 11',
        '11pro': 'iPhone 11 Pro',
        '11promax': 'iPhone 11 Pro Max',
        '12-12pro': 'iPhone 12 / 12 Pro',
        '12mini': 'iPhone 12 mini',
        '12pro': 'iPhone 12 Pro',
        '12promax': 'iPhone 12 Pro Max',
        '13': 'iPhone 13',
        '13mini': 'iPhone 13 mini',
        '13pro': 'iPhone 13 Pro',
        '13promax': 'iPhone 13 Pro Max',
        '14': 'iPhone 14',
        '14plus': 'iPhone 14 Plus',
        '14pro': 'iPhone 14 Pro',
        '14promax': 'iPhone 14 Pro Max',
        '15': 'iPhone 15',
        '15plus': 'iPhone 15 Plus',
        '15promax': 'iPhone 15 Pro Max',
        '16': 'iPhone 16',
        '16plus': 'iPhone 16 Plus',
        '16pro': 'iPhone 16 Pro',
        '16promax': 'iPhone 16 Pro Max',
      };
      return aliases[slug] || `iPhone ${slug.toUpperCase()}`;
    },
    priceQueries(model) {
      const base = model.replace(/^IPHONE\s+/i, '');
      return [
        `${base} OLED`,
        `${base} SOFT OLED`,
        `${base} GX`,
      ];
    },
    fallbackImage: 'assets/products/iphone-oled/main.jpg',
  },
  {
    category: 'samsung-incell',
    folder: 'samsung-incell',
    brand: 'Samsung',
    quality: 'INCELL CON MARCO',
    modelLabel(slug) {
      const aliases = {
        s20: 'Samsung S20',
        's20-plus': 'Samsung S20 Plus',
        's20-fe': 'Samsung S20 FE',
        's20-ultra': 'Samsung S20 Ultra',
        s21: 'Samsung S21',
        's21-ultra': 'Samsung S21 Ultra',
        s8: 'Samsung S8',
        's8-plus': 'Samsung S8 Plus',
        s9: 'Samsung S9',
        's9-plus': 'Samsung S9 Plus',
        s10: 'Samsung S10',
        's10-plus': 'Samsung S10 Plus',
        s10e: 'Samsung S10E',
        's21-fe': 'Samsung S21 FE',
        's21-plus': 'Samsung S21 Plus',
        s22: 'Samsung S22',
        's22-plus': 'Samsung S22 Plus',
        's22-ultra': 'Samsung S22 Ultra',
        s23: 'Samsung S23',
        's23-plus': 'Samsung S23 Plus',
        's23-ultra': 'Samsung S23 Ultra',
        s24: 'Samsung S24',
        's24-plus': 'Samsung S24 Plus',
        's24-ultra': 'Samsung S24 Ultra',
        'note-8': 'Samsung Note 8',
        'note-9': 'Samsung Note 9',
        'note-10': 'Samsung Note 10',
        'note-10-plus': 'Samsung Note 10 Plus',
        'note-20': 'Samsung Note 20',
        'note-20-ultra': 'Samsung Note 20 Ultra',
      };
      return aliases[slug] || `Samsung ${slug.toUpperCase()}`;
    },
    priceQueries(model) {
      const base = model.replace(/^SAMSUNG\s+/i, '');
      return [
        `${base} INCELL`,
        `${base} INCELL C/MARCO`,
      ];
    },
    fallbackImage: 'assets/products/samsung-incell/main.jpg',
  },
  {
    category: 'samsung-oled',
    folder: 'samsung-oled',
    brand: 'Samsung',
    quality: 'OLED CON MARCO',
    modelLabel(slug) {
      const aliases = {
        's20-plus': 'Samsung S20 Plus',
        's20-ultra': 'Samsung S20 Ultra',
        s20: 'Samsung S20',
        s21: 'Samsung S21',
        's21-plus': 'Samsung S21 Plus',
        's21-ultra': 'Samsung S21 Ultra',
        's22-plus': 'Samsung S22 Plus',
        's22-ultra': 'Samsung S22 Ultra',
        's23-plus': 'Samsung S23 Plus',
        's23-ultra': 'Samsung S23 Ultra',
        's24-plus': 'Samsung S24 Plus',
        's24-ultra': 'Samsung S24 Ultra',
        's25-ultra': 'Samsung S25 Ultra',
        's9-plus': 'Samsung S9 Plus',
        'note-9': 'Samsung Note 9',
        'note-10': 'Samsung Note 10',
        'note-10-plus': 'Samsung Note 10 Plus',
        'note-20': 'Samsung Note 20',
        'note-20-ultra': 'Samsung Note 20 Ultra',
      };
      return aliases[slug] || `Samsung ${slug.toUpperCase()}`;
    },
    priceQueries(model) {
      const base = model.replace(/^SAMSUNG\s+/i, '');
      return [
        `${base} OLED`,
        `${base} OLED BIG`,
      ];
    },
    fallbackImage: 'assets/products/samsung-oled/main.jpg',
  },
];

const QUANTITY_LABELS = ['1 pza', '5+ pzs', '100 pzs surtido', '100 pzs/modelo', 'Caja/modelo'];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm']);
const MAIN_IMAGE_FALLBACK = 'assets/products/placeholder.svg';

const SOURCE_ROOTS = (process.env.HAODE_SOURCE_ROOTS || '')
  .split(path.delimiter)
  .map((entry) => entry.trim())
  .filter(Boolean);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function pathExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function findWorkbook() {
  const candidates = [];
  for (const root of SOURCE_ROOTS) {
    if (!pathExists(root)) continue;
    for (const file of fs.readdirSync(root)) {
      const lower = file.toLowerCase();
      if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
        if (!lower.startsWith('.~')) {
          candidates.push(path.join(root, file));
        }
      }
    }
  }

  const preferred = candidates.find((file) => /hl cdmx 2026 mayo/i.test(path.basename(file)))
    || candidates.find((file) => /lcd movi/i.test(path.basename(file)));
  return preferred || candidates[0] || null;
}

function runPythonWorkbookReader(workbookPath) {
  const pythonCandidates = [
    process.env.PYTHON,
    'python3',
    'python',
  ].filter(Boolean);

  const pythonScript = String.raw`
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

path = Path(sys.argv[1])
if not path.exists():
    print(json.dumps({"error": f"Workbook not found: {path}"}))
    sys.exit(0)

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'rel': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'pkgrel': 'http://schemas.openxmlformats.org/package/2006/relationships',
}

def col_index(cell_ref):
    letters = ''.join(ch for ch in cell_ref if ch.isalpha())
    idx = 0
    for ch in letters:
        idx = idx * 26 + (ord(ch.upper()) - 64)
    return idx - 1

def text_value(node, shared):
    cell_type = node.attrib.get('t')
    value = node.findtext('main:v', default='', namespaces=NS)
    if cell_type == 's':
        try:
            return ('text', shared[int(value)])
        except Exception:
            return ('text', value)
    if cell_type == 'inlineStr':
        texts = [t.text or '' for t in node.findall('.//main:t', NS)]
        return ('text', ''.join(texts))
    if value == '':
        return ('text', '')
    try:
        number = float(value)
        if number.is_integer():
            number = int(number)
        return ('number', number)
    except Exception:
        return ('text', value)

with zipfile.ZipFile(path) as zf:
    shared = []
    if 'xl/sharedStrings.xml' in zf.namelist():
        root = ET.fromstring(zf.read('xl/sharedStrings.xml'))
        for item in root.findall('main:si', NS):
            texts = [t.text or '' for t in item.findall('.//main:t', NS)]
            shared.append(''.join(texts))

    workbook = ET.fromstring(zf.read('xl/workbook.xml'))
    rels = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
    rel_map = {
        rel.attrib['Id']: rel.attrib['Target']
        for rel in rels.findall('pkgrel:Relationship', {'pkgrel': NS['pkgrel']})
    }

    sheets = []
    for sheet in workbook.findall('main:sheets/main:sheet', NS):
        name = sheet.attrib.get('name')
        rel_id = sheet.attrib.get(f'{{{NS["rel"]}}}id')
        target = rel_map.get(rel_id, '')
        if target and not target.startswith('xl/'):
            target = 'xl/' + target.lstrip('/')
        sheets.append((name, target))

    rows = []
    for sheet_name, sheet_path in sheets:
        if sheet_path not in zf.namelist():
            continue
        sheet_xml = ET.fromstring(zf.read(sheet_path))
        for row in sheet_xml.findall('main:sheetData/main:row', NS):
            texts = []
            numbers = []
            for cell in row.findall('main:c', NS):
                kind, value = text_value(cell, shared)
                if kind == 'text':
                    if value not in (None, ''):
                        texts.append(str(value))
                else:
                    numbers.append(value)
            if not texts and not numbers:
                continue
            rows.append({
                'sheet': sheet_name,
                'text': ' '.join(texts),
                'numbers': numbers,
            })

print(json.dumps(rows, ensure_ascii=False))
`;

  for (const python of pythonCandidates) {
    const result = spawnSync(python, ['-c', pythonScript, workbookPath], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    if (!result.error && result.status === 0 && result.stdout.trim()) {
      try {
        return JSON.parse(result.stdout);
      } catch {
        // Try next candidate.
      }
    }
  }
  throw new Error('No se pudo leer el Excel. Asegúrate de tener Python disponible.');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/PROMAX/g, 'PRO MAX')
    .replace(/\+/g, ' PLUS ')
    .replace(/([0-9])(?=(PRO|MAX|PLUS|MINI|ULTRA|FE)\b)/g, '$1 ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTokens(value) {
  return normalizeText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean);
}

function getNumericValues(values) {
  return Array.isArray(values) ? values.filter((value) => typeof value === 'number' && Number.isFinite(value)) : [];
}

function getPriceValues(values) {
  return getNumericValues(values)
    .map((value) => Math.abs(value))
    .filter((value) => value >= 100)
    .slice(0, 5);
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return 'Consultar';
  const numeric = Math.abs(Number(value));
  if (!Number.isFinite(numeric) || numeric <= 0) return 'Consultar';
  return `$${numeric.toLocaleString('es-MX')} MXN`;
}

function makePriceTable(numbers) {
  const source = Array.isArray(numbers) ? numbers : [];
  return QUANTITY_LABELS.map((quantity, index) => ({
    quantity,
    price: formatPrice(source[index]),
  }));
}

function priceScore(rowText, queryTokens) {
  const tokens = toTokens(rowText);
  const set = new Set(tokens);
  if (!queryTokens.every((token) => set.has(token))) return -Infinity;

  let score = queryTokens.length * 10;
  const variantMarkers = new Set(['PRO', 'MAX', 'PLUS', 'MINI', 'ULTRA', 'FE', 'LITE', 'XL']);
  const techIndex = tokens.findIndex((token) => ['INCELL', 'OLED', 'FHD', 'FDH', 'GX'].includes(token));
  const rowModelTokens = techIndex >= 0 ? tokens.slice(0, techIndex) : tokens;
  const queryVariantTokens = queryTokens.filter((token) => variantMarkers.has(token));
  const rowVariantTokens = rowModelTokens.filter((token) => variantMarkers.has(token));
  if (rowVariantTokens.some((token) => !queryVariantTokens.includes(token))) return -Infinity;
  const extras = tokens.filter((token) => !queryTokens.includes(token) && variantMarkers.has(token));
  score -= extras.length * 5;

  if (set.has('DIAGNOSTICOS')) score -= 40;
  if (set.has('ORIGINAL')) score -= 10;
  if (set.has('TAPA')) score -= 30;
  if (set.has('BATERIA')) score -= 30;
  if (set.has('PILAMIDES')) score -= 30;
  if (set.has('COMPLETO')) score -= 20;

  return score;
}

function pickPriceRow(rows, query) {
  const queryTokens = toTokens(query);
  let best = null;

  for (const row of rows) {
    const searchableNumbers = getNumericValues(row.numbers).filter((value) => Math.abs(value) < 100);
    const rowText = `${row.text || ''} ${searchableNumbers.join(' ')}`;
    const score = priceScore(rowText, queryTokens);
    if (!Number.isFinite(score)) continue;

    const numbers = getPriceValues(row.numbers);
    if (!numbers.length) continue;

    const candidate = {
      rowText,
      score,
      numbers,
      sheet: row.sheet,
    };

    if (!best) {
      best = candidate;
      continue;
    }

    if (candidate.score > best.score) {
      best = candidate;
      continue;
    }

    if (candidate.score === best.score && candidate.numbers[0] < best.numbers[0]) {
      best = candidate;
    }
  }

  return best;
}

function normalizeImageName(name) {
  const lower = name.toLowerCase();
  return lower.replace(/\s+/g, '-');
}

function isImageFile(name) {
  return IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function isVideoFile(name) {
  return VIDEO_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function scoreImageName(name) {
  const lower = name.toLowerCase();
  let score = 0;
  if (/(^|[^a-z0-9])(main|home|cover|front|banner)([^a-z0-9]|$)/i.test(lower)) score += 20;
  if (/(首页图|主图|成品|展示|实拍|正反)/i.test(name)) score += 18;
  if (/(gallery|detail|详情)/i.test(lower)) score += 4;
  if (/(搬ic|搬 ic|教学|教程|箭头|位置|说明|截图|视频|诊断|拆机|排线)/i.test(name)) score -= 80;
  if (/(comparison|compare|对比)/i.test(lower)) score -= 20;
  if (/(png|jpg|jpeg|webp)$/i.test(lower)) score += 1;
  return score;
}

function pickMainImage(modelDir) {
  const entries = fs.readdirSync(modelDir, { withFileTypes: true });
  const images = entries
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => entry.name);

  const preferred = images.find((name) => /^main\.(jpg|jpeg|png|webp)$/i.test(name));
  if (preferred) return preferred;

  if (!images.length) return null;
  return images
    .map((name) => ({ name, score: scoreImageName(name) }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))[0].name;
}

function collectGalleryImages(modelDir, mainImageName) {
  const entries = fs.readdirSync(modelDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => entry.name)
    .filter((name) => name !== mainImageName)
    .filter((name) => !/^main\.(jpg|jpeg|png|webp)$/i.test(name))
    .sort((a, b) => {
      const aGallery = /^gallery-\d+\./i.test(a) ? 1 : 0;
      const bGallery = /^gallery-\d+\./i.test(b) ? 1 : 0;
      return bGallery - aGallery || scoreImageName(b) - scoreImageName(a) || a.localeCompare(b);
    })
    .slice(0, 3);
}

function collectVideos(modelDir) {
  const entries = fs.readdirSync(modelDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isVideoFile(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 2);
}

function buildProductDefinition(config, slug, workbookRows) {
  const model = config.modelLabel(slug);
  const productId = `${config.folder}-${slug}`.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  const modelDir = path.join(ROOT, 'assets', 'products', config.folder, slug);
  const mainImageName = pathExists(modelDir) ? pickMainImage(modelDir) : null;
  const galleryNames = pathExists(modelDir) ? collectGalleryImages(modelDir, mainImageName) : [];
  const videoNames = pathExists(modelDir) ? collectVideos(modelDir) : [];

  const mainImage = mainImageName
    ? `assets/products/${config.folder}/${slug}/${mainImageName}`
    : config.fallbackImage;
  const galleryImages = galleryNames.map((name) => `assets/products/${config.folder}/${slug}/${name}`);
  const videos = videoNames.map((name) => `assets/products/${config.folder}/${slug}/${name}`);

  const priceQueryVariants = [
    ...(config.priceQueries ? config.priceQueries(model, slug) : [config.priceQuery(model)]),
  ];

  let matchedPriceRow = null;
  for (const query of priceQueryVariants) {
    matchedPriceRow = pickPriceRow(workbookRows, query);
    if (matchedPriceRow) break;
  }

  const prices = matchedPriceRow ? makePriceTable(matchedPriceRow.numbers) : makePriceTable([]);
  const priceSource = matchedPriceRow ? matchedPriceRow.rowText : 'Consultar';

  return {
    id: productId,
    category: config.category,
    brand: config.brand,
    model,
    name: `Pantalla para ${model}`,
    quality: config.quality,
    images: [mainImage, ...galleryImages].filter(Boolean),
    videos,
    prices,
    priceSource,
    whatsappText: `Hola HAODE, quiero cotizar: Pantalla para ${model}`,
    description: `Pantalla para ${model} disponible en HAODE México para técnicos, talleres de reparación y distribuidores que compran en CDMX o desde otros estados de México. Esta refacción para celular se presenta para venta de mayoreo y menudeo, con atención profesional por WhatsApp, control comercial de calidad y envíos a todo México. Antes de confirmar el pedido, consulta disponibilidad actual, modelo exacto y cantidad requerida para evitar errores de compatibilidad y preparar una cotización clara sin prometer funciones no verificadas.`,
  };
}

function buildCatalog() {
  const workbookPath = findWorkbook();
  if (!workbookPath) {
    throw new Error('No se encontró ningún archivo de precios (.xlsx, .xls o .csv) en las carpetas buscadas.');
  }

  const workbookRows = runPythonWorkbookReader(workbookPath);
  const products = [];
  const reports = [];

  for (const config of CATEGORY_CONFIG) {
    const categoryDir = path.join(ROOT, 'assets', 'products', config.folder);
    if (!pathExists(categoryDir)) continue;

    const subdirs = fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    for (const slug of subdirs) {
      const product = buildProductDefinition(config, slug, workbookRows);
      products.push(product);

      reports.push({
        category: config.category,
        model: product.model,
        id: product.id,
        mainImage: product.images[0] || config.fallbackImage,
        galleryImages: product.images.slice(1),
        hasGallery: product.images.length > 1,
        videoCount: product.videos.length,
        videos: product.videos,
        isMissingImage: !product.images[0] || product.images[0] === config.fallbackImage || product.images[0] === MAIN_IMAGE_FALLBACK,
        hasPrice: product.prices.some((row) => row.price !== 'Consultar'),
        priceSource: product.priceSource || 'Consultar',
      });
    }
  }

  return { workbookPath, products, reports };
}

function writeGeneratedData(products, workbookPath) {
  ensureDir(DATA_DIR);
  const payload = {
    generatedAt: new Date().toISOString(),
    workbook: path.basename(workbookPath),
    products,
  };
  const content = `window.HAODE_PRODUCTS_DATA = ${JSON.stringify(payload.products, null, 2)};\nwindow.HAODE_PRODUCTS_BUILD = ${JSON.stringify({ generatedAt: payload.generatedAt, workbook: payload.workbook }, null, 2)};\n`;
  fs.writeFileSync(GENERATED_DATA_FILE, content, 'utf8');
}

function writeStructureDoc() {
  ensureDir(DOCS_DIR);
  const content = `# HAODE Product Structure\n\n` +
    `Este proyecto se genera automáticamente a partir de la carpeta \`assets/products/\` y de la hoja de precios Excel.\n\n` +
    `## Cómo agregar un producto\n\n` +
    `1. Crea una carpeta dentro de la categoría correcta.\n` +
    `2. Coloca una imagen principal llamada \`main.jpg\` o \`main.png\`.\n` +
    `3. Agrega hasta 3 imágenes extra con el formato \`gallery-01.jpg\`, \`gallery-02.jpg\`, \`gallery-03.jpg\`.\n` +
    `4. Si tienes video, usa \`video-01.mp4\` y \`video-02.mp4\`.\n` +
    `5. Ejecuta \`npm run build-products\` para regenerar la base.\n\n` +
    `## Dónde poner cada cosa\n\n` +
    `- \`assets/products/iphone-incell/<modelo>/\`\n` +
    `- \`assets/products/iphone-oled/<modelo>/\`\n` +
    `- \`assets/products/samsung-incell/<modelo>/\`\n` +
    `- \`assets/products/samsung-oled/<modelo>/\`\n\n` +
    `## Regla de precios\n\n` +
    `El generador busca automáticamente el precio en las carpetas indicadas por \`HAODE_SOURCE_ROOTS\`.\n` +
    `Si un modelo no aparece en la hoja, el sitio mostrará \`Consultar\`.\n`;
  fs.writeFileSync(STRUCTURE_DOC_FILE, content, 'utf8');
}

function writeReport(reports, workbookPath) {
  const byCategory = new Map();
  for (const entry of reports) {
    if (!byCategory.has(entry.category)) byCategory.set(entry.category, []);
    byCategory.get(entry.category).push(entry);
  }

  const lines = [];
  lines.push('# HAODE Auto Product Report');
  lines.push('');
  lines.push(`- Workbook: ${path.basename(workbookPath)}`);
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push('');
  for (const [category, items] of byCategory.entries()) {
    const withPrice = items.filter((item) => item.hasPrice).length;
    const withVideo = items.filter((item) => item.videoCount > 0).length;
    const withGallery = items.filter((item) => item.hasGallery).length;
    lines.push(`## ${category}`);
    lines.push(`- Productos: ${items.length}`);
    lines.push(`- Con precio: ${withPrice}`);
    lines.push(`- Con video: ${withVideo}`);
    lines.push(`- Con galería: ${withGallery}`);
    lines.push('');
    lines.push('| Modelo | Principal | Video | Precio | Fuente |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const item of items) {
      lines.push(`| ${item.model} | ${item.mainImage} | ${item.videoCount} | ${item.hasPrice ? 'Sí' : 'Consultar'} | ${item.priceSource.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
  }
  fs.writeFileSync(path.join(DOCS_DIR, 'product-build-report.md'), lines.join('\n'), 'utf8');
}

function writeSeriesCheckReport(reports, workbookPath) {
  ensureDir(path.dirname(SERIES_CHECK_FILE));
  const targetCategories = ['iphone-oled', 'samsung-incell', 'samsung-oled'];
  const targetReports = reports.filter((entry) => targetCategories.includes(entry.category));
  const byCategory = new Map();
  for (const category of targetCategories) {
    byCategory.set(category, targetReports.filter((entry) => entry.category === category));
  }

  const missingImages = targetReports.filter((entry) => entry.isMissingImage);
  const missingPrices = targetReports.filter((entry) => !entry.hasPrice);

  const lines = [];
  lines.push('# Series Update Check');
  lines.push('');
  lines.push(`- Workbook: ${path.basename(workbookPath)}`);
  lines.push(`- Generated: ${new Date().toISOString()}`);
  lines.push('');

  for (const category of targetCategories) {
    const items = byCategory.get(category);
    const withPrice = items.filter((item) => item.hasPrice).length;
    const withVideo = items.filter((item) => item.videoCount > 0).length;
    lines.push(`## ${category}`);
    lines.push(`- Productos actualizados: ${items.length}`);
    lines.push(`- Con precio: ${withPrice}`);
    lines.push(`- Con video: ${withVideo}`);
    lines.push('');
    lines.push('| Producto | Imagen principal | Galería | Video | Precio | Fuente precio |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const item of items) {
      const gallery = item.galleryImages.length ? item.galleryImages.join('<br>') : 'Sin galería';
      const video = item.videos.length ? item.videos.join('<br>') : 'No';
      const price = item.hasPrice ? 'Sí' : 'No';
      lines.push(`| ${item.model} | ${item.mainImage} | ${gallery} | ${video} | ${price} | ${item.priceSource.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
  }

  lines.push('## Faltan imágenes');
  if (missingImages.length) {
    missingImages.forEach((item) => lines.push(`- ${item.category}: ${item.model}`));
  } else {
    lines.push('- Ninguno');
  }
  lines.push('');
  lines.push('## Faltan precios');
  if (missingPrices.length) {
    missingPrices.forEach((item) => lines.push(`- ${item.category}: ${item.model}`));
  } else {
    lines.push('- Ninguno');
  }
  lines.push('');

  fs.writeFileSync(SERIES_CHECK_FILE, lines.join('\n'), 'utf8');
}

function writeSeoFiles(products) {
  const urls = STATIC_SEO_URLS.map((urlPath) => `${SITE_URL}${urlPath}`);

  products.filter((product) => !REDIRECT_PRODUCT_IDS.has(product.id)).forEach((product) => {
    urls.push(`${SITE_URL}/producto/${encodeURIComponent(product.id)}/`);
  });

  const sitemapEntries = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${url.endsWith('/') ? '1.0' : '0.8'}</priority>\n  </url>`)
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${sitemapEntries}\n` +
    `</urlset>\n`;

  const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`;

  fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
  fs.writeFileSync(ROBOTS_FILE, robots, 'utf8');
}

function main() {
  const { workbookPath, products, reports } = buildCatalog();
  writeGeneratedData(products, workbookPath);
  writeStructureDoc();
  writeReport(reports, workbookPath);
  writeSeriesCheckReport(reports, workbookPath);
  writeSeoFiles(products);
  console.log(`Generated ${products.length} products from ${path.basename(workbookPath)}`);
}

main();
