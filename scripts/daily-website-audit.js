const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE_BASE = 'https://haodemx.github.io/haode-web/';
const PUBLIC_PREFIX = '/haode-web/';
const TODAY = process.env.HAODE_AUDIT_DATE || new Date().toISOString().slice(0, 10);
const REPORT_PATH = path.join(ROOT, 'docs', 'reports', 'daily-website-audit.md');

function walk(dir, predicate, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function publicToFile(urlPath) {
  let clean = urlPath.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean.startsWith(SITE_BASE)) clean = clean.slice('https://haodemx.github.io'.length);
  if (clean.startsWith(PUBLIC_PREFIX)) clean = clean.slice(PUBLIC_PREFIX.length);
  if (clean.startsWith('/')) return null;
  if (clean.endsWith('/')) clean += 'index.html';
  const file = path.join(ROOT, clean);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) return path.join(file, 'index.html');
  return file;
}

function extractAttrs(html, attr) {
  const pattern = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, 'gi');
  return [...html.matchAll(pattern)]
    .map((match) => match[1])
    .filter((value) => !value.includes('${'));
}

function hasBodyContent(html) {
  if (/<meta[^>]+http-equiv=["']refresh["']/i.test(html)) return true;
  const body = html.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i)?.[1] || html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length > 30;
}

function readProducts() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'data', 'products.generated.js'), 'utf8'), context);
  return context.window.HAODE_PRODUCTS_DATA || [];
}

function productAssetPath(asset) {
  if (!asset) return null;
  const clean = asset.startsWith(PUBLIC_PREFIX) ? asset.slice(PUBLIC_PREFIX.length) : asset.replace(/^\/+/, '');
  return path.join(ROOT, clean);
}

function checkJsonLd(html) {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) return { present: false, valid: false };
  const valid = blocks.every((block) => {
    try {
      JSON.parse(block[1].trim());
      return true;
    } catch {
      return false;
    }
  });
  return { present: true, valid };
}

const htmlFiles = walk(ROOT, (file) => file.endsWith('.html') && !file.includes('/node_modules/')).sort();
const products = readProducts();

const issues = [];
const internalBrokenLinks = [];
const brokenAssets = [];
const blankPages = [];
const seoIssues = [];
const categoryIssues = [];
const homeButtonIssues = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = rel(file);

  if (!hasBodyContent(html)) blankPages.push(relative);

  const hrefs = extractAttrs(html, 'href');
  const srcs = extractAttrs(html, 'src');
  const assets = [
    ...srcs,
    ...hrefs.filter((href) => /\.(css|js|png|jpe?g|webp|avif|svg|mp4|webm|mov|ico)$/i.test(href.split('?')[0])),
  ];

  for (const href of hrefs) {
    if (/^(https?:|mailto:|tel:|whatsapp:|#)/i.test(href)) continue;
    const target = publicToFile(href);
    if (target && !fs.existsSync(target)) internalBrokenLinks.push(`${relative} -> ${href}`);
  }

  for (const asset of assets) {
    if (/^(https?:|data:|mailto:|tel:)/i.test(asset)) continue;
    const target = publicToFile(asset);
    if (target && !fs.existsSync(target)) brokenAssets.push(`${relative} -> ${asset}`);
  }

  const skipPageSeo = relative === '404.html'
    || relative.startsWith('app/')
    || /^google[a-z0-9]+\.html$/i.test(relative)
    || /<meta[^>]+http-equiv=["']refresh["']/i.test(html);
  if (skipPageSeo) continue;
  if (!/<title>[^<]{10,}<\/title>/i.test(html)) seoIssues.push(`${relative}: title 缺失或过短`);
  if (!/<meta\s+name=["']description["']\s+content=["'][^"']{40,}["']/i.test(html)) seoIssues.push(`${relative}: meta description 缺失或过短`);
  if (!/<meta\s+property=["']og:title["']\s+content=["'][^"']+["']/i.test(html)) seoIssues.push(`${relative}: og:title 缺失`);
  if (!/<meta\s+property=["']og:description["']\s+content=["'][^"']+["']/i.test(html)) seoIssues.push(`${relative}: og:description 缺失`);
  if (!/<meta\s+property=["']og:image["']\s+content=["'][^"']+["']/i.test(html)) seoIssues.push(`${relative}: og:image 缺失`);
  const jsonLd = checkJsonLd(html);
  if (!jsonLd.present) seoIssues.push(`${relative}: JSON-LD 缺失`);
  else if (!jsonLd.valid) seoIssues.push(`${relative}: JSON-LD 无效`);
}

for (const category of [
  'categoria/iphone-incell/index.html',
  'categoria/iphone-oled/index.html',
  'categoria/samsung-incell/index.html',
  'categoria/samsung-oled/index.html',
  'categoria/pantallas/index.html',
  'categoria/productos-ai/index.html',
]) {
  const file = path.join(ROOT, category);
  if (!fs.existsSync(file)) categoryIssues.push(`${category}: 文件缺失`);
  else if (!hasBodyContent(fs.readFileSync(file, 'utf8'))) categoryIssues.push(`${category}: 页面内容为空`);
}

const homeHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const href of extractAttrs(homeHtml, 'href').filter((href) => href.startsWith(PUBLIC_PREFIX) || href.startsWith('#'))) {
  if (href.startsWith('#')) {
    const id = href.slice(1);
    if (id && !new RegExp(`id=["']${id}["']`).test(homeHtml)) homeButtonIssues.push(`index.html -> ${href}`);
    continue;
  }
  const target = publicToFile(href);
  if (target && !fs.existsSync(target)) homeButtonIssues.push(`index.html -> ${href}`);
}

const missingCover = [];
const missingImages = [];
const missingVideos = [];
for (const product of products) {
  const cover = product.images?.[0] || '';
  if (!cover || !fs.existsSync(productAssetPath(cover))) missingCover.push(`${product.id} | ${product.name || ''} | ${cover || '空'}`);
  for (const image of product.images || []) {
    if (!fs.existsSync(productAssetPath(image))) missingImages.push(`${product.id} | ${image}`);
  }
  if (!product.videos?.length) missingVideos.push(`${product.id} | ${product.name || ''} | 空`);
  for (const video of product.videos || []) {
    if (!fs.existsSync(productAssetPath(video))) missingVideos.push(`${product.id} | ${product.name || ''} | ${video}`);
  }
}

if (!fs.existsSync(path.join(ROOT, '404.html'))) issues.push('404.html 缺失');
if (!fs.existsSync(path.join(ROOT, 'sitemap.xml'))) seoIssues.push('sitemap.xml 缺失');
if (!fs.existsSync(path.join(ROOT, 'robots.txt'))) seoIssues.push('robots.txt 缺失');
if (fs.existsSync(path.join(ROOT, 'robots.txt')) && !fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8').includes(`${SITE_BASE}sitemap.xml`)) {
  seoIssues.push('robots.txt 未指向线上 sitemap');
}

function section(title, rows, empty = '无') {
  const body = rows.length ? rows.map((item) => `- ${item}`).join('\n') : `- ${empty}`;
  return `## ${title}\n\n${body}\n`;
}

const googlePost = `Hoy en HAODE México tenemos opciones para técnicos y tiendas de reparación: pantallas para iPhone y Samsung, micas, máquina de corte y productos AI. Estamos en Eje Central 87, piso 2, local 225, Centro CDMX. Escríbenos por WhatsApp para confirmar disponibilidad antes de venir.`;
const facebookPost = `¿Buscas refacciones para reparación celular en CDMX? En HAODE trabajamos pantallas iPhone/Samsung, micas y accesorios para técnicos, tiendas y distribuidores. Mándanos el modelo por WhatsApp y te ayudamos a confirmar disponibilidad.`;
const instagramPost = `Pantallas, micas y accesorios para reparación celular en Centro CDMX. Envíanos tu modelo por WhatsApp y cotizamos para menudeo o mayoreo. #HAODEMexico #ReparacionCelular #CDMX #PantallasCelulares`;

const found = [
  ...issues,
  ...internalBrokenLinks.map((item) => `死链接: ${item}`),
  ...brokenAssets.map((item) => `资源缺失: ${item}`),
  ...blankPages.map((item) => `空白页: ${item}`),
  ...categoryIssues.map((item) => `分类页: ${item}`),
  ...homeButtonIssues.map((item) => `首页按钮: ${item}`),
  ...seoIssues.map((item) => `SEO: ${item}`),
  ...missingCover.map((item) => `产品封面缺失: ${item}`),
  ...missingImages.map((item) => `产品图片缺失: ${item}`),
  ...missingVideos.map((item) => `产品视频缺失: ${item}`),
];

const report = `# HAODE 官网每日审计报告

生成日期：${TODAY}

## 审计范围

- HTML 页面：${htmlFiles.length}
- 网站产品数据：${products.length}
- 检查项：404 页面、站内死链接、空白页面、分类页、首页按钮、产品封面图、图片路径、视频路径、title、meta description、Open Graph、JSON-LD、sitemap.xml、robots.txt。

${section('发现的问题', found)}
${section('已修复内容', ['修复 `scripts/test-catalog-filters.js`：移除过期的 86 个产品硬编码，改为根据当前产品数据动态计算分类数量。', '新增 `scripts/daily-website-audit.js`：可重复生成每日网站审计报告。'])}
${section('未修复内容', [
  missingVideos.length ? `仍有 ${missingVideos.length} 个产品视频为空或缺失，因缺少已确认视频素材，本次只记录不替换。` : '无产品视频缺失。',
  seoIssues.length ? `仍有 ${seoIssues.length} 个 SEO 标签/JSON-LD 问题需要逐页补齐。` : 'SEO 基础项未发现未修复问题。',
  found.length ? '价格异常、APP 漏发等产品控制项不在本次自动修复范围，避免误改价格或误删产品。' : '无',
])}
${section('缺图清单', missingCover.length || missingImages.length ? [...missingCover, ...missingImages] : [])}
## Google Business 西班牙语发文

${googlePost}

## Facebook 发文

${facebookPost}

## Instagram 发文

${instagramPost}

## 明日建议

- 优先补齐产品视频素材：从缺视频清单开始，确认型号后再上传，不使用其他型号视频代替。
- 分批补齐仍缺的 Open Graph image / JSON-LD 页面，先处理首页、核心分类页和高访问产品页。
- 继续执行 \`npm run product-control\` 和 \`node scripts/daily-website-audit.js\`，把新增产品数量变化纳入每日检查。
`;

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, report);

console.log(JSON.stringify({
  htmlPages: htmlFiles.length,
  products: products.length,
  foundIssues: found.length,
  missingCover: missingCover.length,
  missingImages: missingImages.length,
  missingVideos: missingVideos.length,
  seoIssues: seoIssues.length,
  report: rel(REPORT_PATH),
}, null, 2));
