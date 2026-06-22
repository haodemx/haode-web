import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const today = process.env.HAODE_AUDIT_DATE || new Date().toISOString().slice(0, 10);
const publicPrefix = "/";
const requiredCategories = [
  "Pantallas iPhone OLED",
  "Pantallas iPhone INCELL",
  "Pantallas Samsung AMOLED",
  "Pantallas Samsung INCELL",
  "Micas",
  "Máquinas de Mica",
  "Gafas AI",
  "Fundas"
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function ensureDir(relativePath) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
}

function publicPathToFile(publicPath) {
  if (!publicPath || !publicPath.startsWith(publicPrefix)) {
    return "";
  }

  return path.join(root, publicPath.slice(publicPrefix.length));
}

function fileToPublicPath(filePath) {
  return `${publicPrefix}${path.relative(root, filePath).split(path.sep).join("/")}`;
}

function csvCell(value) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function writeFile(relativePath, content) {
  const filePath = path.join(root, relativePath);
  fs.writeFileSync(filePath, content.endsWith("\n") ? content : `${content}\n`);
}

function assetExists(publicPath) {
  const filePath = publicPathToFile(publicPath);
  return Boolean(filePath && fs.existsSync(filePath));
}

function findVideo(product) {
  const imageFile = publicPathToFile(product.imagen || "");

  if (!imageFile) {
    return "";
  }

  const dir = path.dirname(imageFile);

  if (!fs.existsSync(dir)) {
    return "";
  }

  const preferred = path.join(dir, "video-01.mp4");

  if (fs.existsSync(preferred)) {
    return fileToPublicPath(preferred);
  }

  const video = fs.readdirSync(dir)
    .filter((entry) => /\.(mp4|mov|webm)$/i.test(entry))
    .sort()[0];

  return video ? fileToPublicPath(path.join(dir, video)) : "";
}

function pageTargetExists(loc) {
  const marker = "https://haode.com.mx/";

  if (!loc.startsWith(marker)) {
    return false;
  }

  const relative = loc.slice(marker.length);
  const candidates = [];

  if (!relative || relative.endsWith("/")) {
    candidates.push(path.join(root, relative, "index.html"));
  } else {
    candidates.push(path.join(root, relative));
  }

  return candidates.some((candidate) => fs.existsSync(candidate));
}

function extractSitemapLocs() {
  const sitemapPath = path.join(root, "sitemap.xml");

  if (!fs.existsSync(sitemapPath)) {
    return [];
  }

  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const products = readJson("app/products.json");
const normalized = products.map((product, index) => {
  const video = findVideo(product);
  const imageExists = assetExists(product.imagen);
  const placeholderImage = /placeholder/i.test(product.imagen || "");

  return {
    id: product.id || "",
    nombre: product.nombre || "",
    categoria: product.categoria || "",
    modelo: product.modelo || "",
    descripcion: product.descripcion || "",
    precioPublico: Number(product.precioPublico || 0),
    precioMayoreo: Number(product.precioMayoreo || 0),
    imagen: product.imagen || "",
    video,
    estado: product.activo === false ? "Inactivo" : "Activo",
    stock: product.stock || "disponible",
    orden: Number(product.orden ?? index + 1),
    imageExists,
    placeholderImage,
    videoExists: Boolean(video),
    seoReady: Boolean(product.nombre && product.modelo && product.descripcion),
    priceReady: Number(product.precioPublico || 0) > 0 && Number(product.precioMayoreo || 0) > 0
  };
});

const keyCounts = new Map();
normalized.forEach((product) => {
  const key = `${product.categoria}||${product.modelo}`.trim().toLowerCase();
  keyCounts.set(key, (keyCounts.get(key) || 0) + 1);
});

const duplicates = normalized.filter((product) => {
  const key = `${product.categoria}||${product.modelo}`.trim().toLowerCase();
  return keyCounts.get(key) > 1;
});
const missingImages = normalized.filter((product) => !product.imagen || !product.imageExists);
const placeholderImages = normalized.filter((product) => product.placeholderImage);
const missingVideos = normalized.filter((product) => !product.videoExists);
const badPrices = normalized.filter((product) => !product.priceReady);
const seoMissing = normalized.filter((product) => !product.seoReady);
const presentCategories = new Set(normalized.map((product) => product.categoria).filter(Boolean));
const missingCategories = requiredCategories.filter((category) => !presentCategories.has(category));
const sitemapLocs = extractSitemapLocs();
const brokenLinks = sitemapLocs.filter((loc) => !pageTargetExists(loc));

const imageRate = normalized.length ? ((normalized.length - missingImages.length - placeholderImages.length) / normalized.length) * 100 : 0;
const priceRate = normalized.length ? ((normalized.length - badPrices.length) / normalized.length) * 100 : 0;
const videoRate = normalized.length ? ((normalized.length - missingVideos.length) / normalized.length) * 100 : 0;
const seoRate = normalized.length ? ((normalized.length - seoMissing.length) / normalized.length) * 100 : 0;

ensureDir("docs/master-data");
ensureDir("docs/autopilot");
ensureDir("docs/reports");

const csvHeader = [
  "id",
  "producto_nombre",
  "categoria",
  "modelo",
  "precio_publico",
  "precio_mayoreo",
  "imagen_path",
  "video_path",
  "estado",
  "stock",
  "orden",
  "seo_status",
  "source",
  "last_checked"
];
const csvRows = normalized
  .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre, "es"))
  .map((product) => [
    product.id,
    product.nombre,
    product.categoria,
    product.modelo,
    product.precioPublico,
    product.precioMayoreo,
    product.imagen,
    product.video,
    product.estado,
    product.stock,
    product.orden,
    product.seoReady ? "Completo" : "Falta SEO",
    "app/products.json",
    today
  ].map(csvCell).join(","));
writeFile("docs/master-data/products-master.csv", [csvHeader.join(","), ...csvRows].join("\n"));

writeFile("docs/master-data/README.md", `# HAODE 产品主数据中心

此目录是 HAODE AUTOPILOT V1 的产品主数据中心。

## 主文件

- \`products-master.csv\`

## 字段

- \`producto_nombre\`: 产品名称
- \`categoria\`: 产品分类
- \`precio_publico\`: 零售价
- \`precio_mayoreo\`: 批发价
- \`imagen_path\`: 图片路径
- \`video_path\`: 视频路径
- \`estado\`: Activo / Inactivo

## 读取原则

- 网站、APP、Firestore 同步流程以后应以此文件作为运营主数据基准。
- 当前 V1 不改变线上 APP 的 Firebase 优先读取逻辑，避免影响现有 GitHub Pages 和 Firestore。
- 价格、产品名称、品牌信息禁止自动修改，必须由老板确认。
`);

writeFile("docs/autopilot/daily-audit.md", `# HAODE 每日巡检

巡检日期：${today}

## 检查项

| 项目 | 结果 | 数量 | 自动处理 |
|---|---|---:|---|
| 错图 | 需要人工确认图片内容，已检查路径存在性 | 0 | 否 |
| 缺图 | ${missingImages.length ? "发现缺图或路径不存在" : "未发现"} | ${missingImages.length} | 可自动修复路径，不自动换图 |
| 占位图 | ${placeholderImages.length ? "发现占位图" : "未发现"} | ${placeholderImages.length} | 需要真实素材 |
| 缺视频 | ${missingVideos.length ? "发现缺视频" : "未发现"} | ${missingVideos.length} | 可自动补路径，素材缺失需报告 |
| 错价格 | 不自动判定，需价格表确认 | ${badPrices.length} | 禁止自动改价 |
| 重复产品 | ${duplicates.length ? "发现重复风险" : "未发现"} | ${duplicates.length} | 仅记录 |
| 失效链接 | ${brokenLinks.length ? "发现 sitemap 失效链接" : "未发现"} | ${brokenLinks.length} | 可自动修复 |

## 问题清单

### 缺图或图片路径不存在
${missingImages.length ? missingImages.map((product) => `- ${product.id} | ${product.modelo} | ${product.imagen || "无图片路径"}`).join("\n") : "- 无"}

### 占位图
${placeholderImages.length ? placeholderImages.map((product) => `- ${product.id} | ${product.modelo} | ${product.imagen}`).join("\n") : "- 无"}

### 缺视频
${missingVideos.length ? missingVideos.map((product) => `- ${product.id} | ${product.modelo}`).join("\n") : "- 无"}

### 错价格字段风险
${badPrices.length ? badPrices.map((product) => `- ${product.id} | ${product.modelo} | Publico ${product.precioPublico} | Mayoreo ${product.precioMayoreo}`).join("\n") : "- 无"}

### 重复产品风险
${duplicates.length ? duplicates.map((product) => `- ${product.id} | ${product.categoria} | ${product.modelo}`).join("\n") : "- 无"}

### 失效链接
${brokenLinks.length ? brokenLinks.map((loc) => `- ${loc}`).join("\n") : "- 无"}

## 自动修复规则

允许自动修复：
- 图片路径错误
- 视频路径错误
- SEO 缺失
- 分类缺失

禁止自动修改：
- 价格
- 产品名称
- 品牌信息
`);

writeFile("docs/autopilot/autopilot-rules.md", `# HAODE AUTOPILOT V1 规则

## 目标

让老板不再负责网站与 APP 的日常细节管理，由系统自动维护：
- 网站
- App
- 产品数据
- 图片
- 视频
- SEO

## 产品主数据中心

- 主数据文件：\`docs/master-data/products-master.csv\`
- 当前生成来源：\`app/products.json\`
- 以后网站、APP、Firestore 同步流程应优先以主数据中心为基准。
- V1 不直接改变线上运行读取顺序，避免破坏 Firebase、Firestore、APP 和 GitHub Pages。

## 允许自动修复

- 图片路径错误
- 视频路径错误
- SEO 缺失
- 分类缺失
- sitemap 失效链接

## 禁止自动修改

- 价格
- 产品名称
- 品牌信息
- 删除产品
- 删除数据

## 必须报告老板确认

- 价格表与系统价格不一致
- 产品名称需要统一
- 产品重复但无法确认保留哪一个
- 找不到真实产品图片或视频素材
`);

writeFile("docs/autopilot/weekly-audit.md", `# HAODE 每周巡检

巡检日期：${today}

## 分类完整性

- 当前分类数量：${presentCategories.size}
- 目标分类数量：${requiredCategories.length}
- 缺失分类：${missingCategories.length ? missingCategories.join(", ") : "无"}

## SEO 缺失

- SEO 完整产品：${normalized.length - seoMissing.length}
- SEO 缺失产品：${seoMissing.length}

## 产品缺失

- 当前主数据产品总数：${normalized.length}
- Excel 价表缺失型号需要老板确认库存与图片后再新增。

## App 同步状态

- 当前主数据来源：\`app/products.json\`
- 当前 APP 线上逻辑：优先 Firestore，失败 fallback 到 \`products.json\`
- AUTOPILOT V1 状态：已建立 \`docs/master-data/products-master.csv\` 作为运营主数据中心。
- 后续建议：新增同步脚本，将主数据中心安全同步到 \`products.json\` 与 Firestore。
`);

writeFile("docs/reports/product-health-report.md", `# HAODE 产品准确率报告

生成日期：${today}

## 统计

| 指标 | 当前值 | 目标 |
|---|---:|---:|
| 产品总数 | ${normalized.length} | - |
| 正确图片率 | ${imageRate.toFixed(1)}% | 95%+ |
| 正确价格率 | ${priceRate.toFixed(1)}% | 95%+ |
| 视频覆盖率 | ${videoRate.toFixed(1)}% | 95%+ |
| SEO 覆盖率 | ${seoRate.toFixed(1)}% | 95%+ |

## 解释

- 正确图片率当前按“图片路径存在且不是占位图”统计，图片内容是否对应型号仍需人工或视觉审核确认。
- 正确价格率当前按“零售价和批发价均大于 0”统计，是否等于最新价格表必须通过价格表审计确认。
- 视频覆盖率按产品目录是否存在视频文件统计。
- SEO 覆盖率按产品名称、型号、描述是否完整统计。

## 需要老板决定

- 价格和产品名称不自动修改。
- 找不到真实素材的产品不自动补图。
- 是否把 \`iPhone 13 Pro Max OLED PREMIUM\` 统一命名为 \`OLED PREMIUM MOVE IC\` 需要确认。
`);

writeFile("docs/reports/daily-ceo-report.md", `# HAODE CEO 日报

日期：${today}

## 今天发现的问题

- 缺视频产品：${missingVideos.length}
- 缺图或图片路径不存在：${missingImages.length}
- 占位图：${placeholderImages.length}
- 重复产品风险：${duplicates.length}
- sitemap 失效链接：${brokenLinks.length}

## 今天已修复的问题

- 已建立 \`docs/master-data/products-master.csv\`，统一管理产品名称、分类、价格、图片、视频和状态。
- 已建立每日巡检、每周巡检、产品准确率报告和 CEO 日报机制。
- 已明确自动修复边界：可修路径、SEO、分类；禁止自动改价格、产品名和品牌信息。

## 需要老板决定的问题

- 价格变更必须由老板确认。
- 产品名称变更必须由老板确认。
- 缺真实产品素材时，需要老板提供或确认素材。
- Excel 中存在但 APP 未上架的型号，需确认库存和图片后再新增。

## 明日优先级

1. 优先补齐缺视频产品。
2. 复核 sitemap 中的失效链接。
3. 对缺失 SEO 的产品补西班牙语描述和关键词。
4. 建立主数据中心到 Firestore 的安全同步流程。
`);

console.log(JSON.stringify({
  date: today,
  products: normalized.length,
  categories: presentCategories.size,
  missingImages: missingImages.length,
  placeholderImages: placeholderImages.length,
  missingVideos: missingVideos.length,
  duplicates: duplicates.length,
  brokenLinks: brokenLinks.length,
  imageRate: Number(imageRate.toFixed(1)),
  priceRate: Number(priceRate.toFixed(1)),
  videoRate: Number(videoRate.toFixed(1)),
  seoRate: Number(seoRate.toFixed(1))
}, null, 2));
