const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_PREFIX = "/";
const MASTER_PATH = path.join(ROOT, "docs/master-data/products-master.csv");
const HEALTH_REPORT_PATH = path.join(ROOT, "docs/reports/product-health-report.md");
const TODAY = process.env.HAODE_AUDIT_DATE || new Date().toISOString().slice(0, 10);

const CATEGORY_LABELS = {
  "iphone-incell": "Pantallas iPhone INCELL",
  "iphone-oled": "Pantallas iPhone OLED",
  "oled-diagnostica": "Pantallas OLED Diagnóstica",
  "samsung-incell": "Pantallas Samsung INCELL",
  "samsung-oled": "Pantallas Samsung OLED",
  "samsung-tipo-original": "Pantallas Samsung Original",
  "samsung-original": "Pantallas Samsung Original",
  "gafas-ai": "Gafas AI",
  "productos-ai": "Productos AI",
  "camaras-inteligentes": "Cámaras Inteligentes",
  "camaras-digitales": "Cámaras Inteligentes",
  "micas": "Micas",
  "maquinas-de-mica": "Máquinas de Mica",
  "maquinas-de-hidrogel": "Máquinas de Mica",
  "fundas": "Fundas"
};

const MASTER_COLUMNS = [
  "id",
  "producto_nombre",
  "categoria",
  "modelo",
  "descripcion",
  "precio_publico",
  "precio_mayoreo",
  "imagen_path",
  "video_path",
  "website_present",
  "app_present",
  "website_precio_publico",
  "website_precio_mayoreo",
  "app_precio_publico",
  "app_precio_mayoreo",
  "image_exists",
  "video_exists",
  "price_status",
  "category_status",
  "product_status",
  "estado",
  "source",
  "last_checked"
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function parseCsv(text) {
  if (!text.trim()) return [];
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);

  const [header, ...records] = rows.filter((item) => item.some((value) => value !== ""));
  if (!header) return [];

  return records.map((record) => Object.fromEntries(header.map((key, index) => [key, record[index] ?? ""])));
}

function parseMoney(value) {
  if (value === undefined || value === null) return "";
  const number = String(value).replace(/[^0-9.]/g, "");
  return number ? String(Number(number)) : "";
}

function toPublicPath(assetPath) {
  if (!assetPath) return "";
  if (assetPath.startsWith(PUBLIC_PREFIX)) return assetPath;
  if (assetPath.startsWith("/")) return assetPath;
  return `${PUBLIC_PREFIX}${assetPath.replace(/^\.?\//, "")}`;
}

function publicPathToFile(publicPath) {
  if (!publicPath || !publicPath.startsWith(PUBLIC_PREFIX)) return "";
  return path.join(ROOT, publicPath.slice(PUBLIC_PREFIX.length));
}

function existsPublic(publicPath) {
  const filePath = publicPathToFile(publicPath);
  return Boolean(filePath && fs.existsSync(filePath));
}

function readWebsiteProducts() {
  const generatedPath = path.join(ROOT, "data/products.generated.js");
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(generatedPath, "utf8"), context);

  return (context.window.HAODE_PRODUCTS_DATA || []).map((product) => {
    const prices = product.prices || [];
    return {
      id: product.id || product.slug || "",
      producto_nombre: product.name || "",
      categoria: CATEGORY_LABELS[product.category] || product.category || "",
      modelo: [product.model, product.quality].filter(Boolean).join(" ").trim(),
      descripcion: product.description || "",
      precio_publico: parseMoney(prices[0]?.price),
      precio_mayoreo: parseMoney(prices[1]?.price || prices.at(-1)?.price),
      imagen_path: toPublicPath(product.images?.[0] || ""),
      video_path: toPublicPath(product.videos?.[0] || ""),
      source: "website:data/products.generated.js"
    };
  });
}

function readAppProducts() {
  const appPath = path.join(ROOT, "app/products.json");
  if (!fs.existsSync(appPath)) return [];

  return JSON.parse(fs.readFileSync(appPath, "utf8")).map((product) => ({
    id: product.id || "",
    producto_nombre: product.nombre || "",
    categoria: product.categoria || "",
    modelo: product.modelo || "",
    descripcion: product.descripcion || "",
    precio_publico: parseMoney(product.precioPublico),
    precio_mayoreo: parseMoney(product.precioMayoreo),
    imagen_path: toPublicPath(product.imagen || ""),
    video_path: "",
    estado: product.activo === false ? "Inactivo" : "Activo",
    source: "app/products.json"
  }));
}

function readWebsiteTextIndex() {
  const targets = [
    "index.html",
    "productos.html",
    "productos-ai.html",
    "micas.html",
    "ai-mouse.html",
    "ai-smart-glasses-aimb-g3.html",
    "ai-smart-glasses-aimb-g5.html",
    "ai-smart-glasses-s1.html",
    "ai-smart-glasses-w630.html"
  ];
  const folders = ["producto", "productos", "productos-ai", "micas", "categoria", "distribuidores", "contacto"];
  const files = [];

  targets.forEach((target) => {
    const filePath = path.join(ROOT, target);
    if (fs.existsSync(filePath)) files.push(filePath);
  });

  folders.forEach((folder) => {
    const folderPath = path.join(ROOT, folder);
    if (!fs.existsSync(folderPath)) return;
    const stack = [folderPath];
    while (stack.length) {
      const current = stack.pop();
      const stat = fs.statSync(current);
      if (stat.isDirectory()) {
        fs.readdirSync(current).forEach((entry) => stack.push(path.join(current, entry)));
      } else if (/\.html$/i.test(current)) {
        files.push(current);
      }
    }
  });

  return files.map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");
}

function appearsInStaticWebsite(product, websiteText) {
  if (!product) return false;
  const imagePath = product.imagen_path || "";
  const imageRelative = imagePath.startsWith(PUBLIC_PREFIX) ? imagePath.slice(PUBLIC_PREFIX.length) : imagePath;
  const candidates = [
    product.id,
    product.producto_nombre,
    imagePath,
    imageRelative
  ].filter((value) => value && value.length > 3);

  return candidates.some((value) => websiteText.includes(value));
}

function byId(products) {
  return new Map(products.filter((product) => product.id).map((product) => [product.id, product]));
}

function chooseField(existing, appProduct, websiteProduct, field) {
  if (existing?.[field]) return existing[field];
  if (appProduct?.[field]) return appProduct[field];
  return websiteProduct?.[field] || "";
}

function statusFromChecks({ existsInMaster, appProduct, websiteProduct, imagePath, videoPath, priceStatus, categoryStatus }) {
  const issues = [];
  if (!existsInMaster) issues.push("nuevo_en_fuentes");
  if (!websiteProduct) issues.push("faltante_web");
  if (!appProduct) issues.push("faltante_app");
  if (!imagePath || !existsPublic(imagePath)) issues.push("imagen_faltante");
  if (!videoPath || !existsPublic(videoPath)) issues.push("video_faltante");
  if (priceStatus !== "OK") issues.push("precio_revisar");
  if (categoryStatus !== "OK") issues.push("categoria_revisar");
  return issues.length ? issues.join("|") : "OK";
}

function comparePrice(masterValue, sourceValue) {
  if (!sourceValue) return "SIN_DATO_FUENTE";
  if (!masterValue) return "SIN_DATO_MASTER";
  return Number(masterValue) === Number(sourceValue) ? "OK" : "DIFERENTE";
}

function createControlData() {
  const websiteText = readWebsiteTextIndex();
  const existingRows = parseCsv(readTextIfExists(MASTER_PATH));
  const existingMap = byId(existingRows);
  const websiteProducts = readWebsiteProducts();
  const appProducts = readAppProducts();
  const websiteMap = byId(websiteProducts);
  const appMap = byId(appProducts);
  const ids = [...new Set([...existingMap.keys(), ...websiteMap.keys(), ...appMap.keys()])].sort();

  const rows = ids.map((id) => {
    const existing = existingMap.get(id);
    const websiteProduct = websiteMap.get(id);
    const appProduct = appMap.get(id);
    const imagePath = chooseField(existing, appProduct, websiteProduct, "imagen_path");
    const videoPath = chooseField(existing, websiteProduct, appProduct, "video_path");
    const precioPublico = chooseField(existing, appProduct, websiteProduct, "precio_publico");
    const precioMayoreo = chooseField(existing, appProduct, websiteProduct, "precio_mayoreo");
    const websiteCategory = websiteProduct?.categoria || "";
    const appCategory = appProduct?.categoria || "";
    const category = websiteCategory && appCategory && websiteCategory === appCategory
      ? websiteCategory
      : chooseField(existing, appProduct, websiteProduct, "categoria");
    const categoryStatus = [websiteCategory, appCategory].filter(Boolean).every((value) => value === category) ? "OK" : "DIFERENTE";
    const websitePublicStatus = comparePrice(precioPublico, websiteProduct?.precio_publico);
    const websiteWholesaleStatus = comparePrice(precioMayoreo, websiteProduct?.precio_mayoreo);
    const appPublicStatus = comparePrice(precioPublico, appProduct?.precio_publico);
    const appWholesaleStatus = comparePrice(precioMayoreo, appProduct?.precio_mayoreo);
    const priceStatus = (!precioPublico || !precioMayoreo) ? "REVISAR" : [websitePublicStatus, websiteWholesaleStatus, appPublicStatus, appWholesaleStatus]
      .filter((value) => value !== "SIN_DATO_FUENTE")
      .every((value) => value === "OK") ? "OK" : "REVISAR";
    const source = [
      existing?.source,
      websiteProduct?.source,
      appProduct?.source
    ].filter(Boolean).join("|");
    const staticWebsitePresent = !websiteProduct && appearsInStaticWebsite({
      id,
      producto_nombre: chooseField(existing, appProduct, websiteProduct, "producto_nombre"),
      imagen_path: imagePath
    }, websiteText);
    const websitePresent = websiteProduct ? "yes" : (staticWebsitePresent ? "yes_static" : "no");
    const productStatus = statusFromChecks({
      existsInMaster: Boolean(existing),
      appProduct,
      websiteProduct: websiteProduct || staticWebsitePresent,
      imagePath,
      videoPath,
      priceStatus,
      categoryStatus
    });

    return {
      id,
      producto_nombre: chooseField(existing, appProduct, websiteProduct, "producto_nombre"),
      categoria: category,
      modelo: chooseField(existing, appProduct, websiteProduct, "modelo"),
      descripcion: chooseField(existing, appProduct, websiteProduct, "descripcion"),
      precio_publico: precioPublico,
      precio_mayoreo: precioMayoreo,
      imagen_path: imagePath,
      video_path: videoPath,
      website_present: websitePresent,
      app_present: appProduct ? "yes" : "no",
      website_precio_publico: websiteProduct?.precio_publico || "",
      website_precio_mayoreo: websiteProduct?.precio_mayoreo || "",
      app_precio_publico: appProduct?.precio_publico || "",
      app_precio_mayoreo: appProduct?.precio_mayoreo || "",
      image_exists: existsPublic(imagePath) ? "yes" : "no",
      video_exists: videoPath && existsPublic(videoPath) ? "yes" : "no",
      price_status: priceStatus,
      category_status: categoryStatus,
      product_status: productStatus,
      estado: existing?.estado || appProduct?.estado || "Activo",
      source,
      last_checked: TODAY
    };
  });

  return { rows, websiteProducts, appProducts };
}

function writeMaster(rows) {
  ensureDir(MASTER_PATH);
  const csv = [
    MASTER_COLUMNS.join(","),
    ...rows.map((row) => MASTER_COLUMNS.map((column) => csvEscape(row[column])).join(","))
  ].join("\n");
  fs.writeFileSync(MASTER_PATH, `${csv}\n`);
}

function formatIssueRows(rows, predicate, fields) {
  const matches = rows.filter(predicate);
  if (!matches.length) return "- 无";

  return matches
    .map((row) => `- ${fields.map((field) => `${field}: ${row[field] || "空"}`).join(" | ")}`)
    .join("\n");
}

function writeHealthReport(rows, websiteProducts, appProducts) {
  ensureDir(HEALTH_REPORT_PATH);
  const missingImages = rows.filter((row) => row.image_exists !== "yes");
  const missingVideos = rows.filter((row) => row.video_exists !== "yes");
  const priceIssues = rows.filter((row) => row.price_status !== "OK");
  const categoryIssues = rows.filter((row) => row.category_status !== "OK");
  const missingInWebsite = rows.filter((row) => !row.website_present.startsWith("yes"));
  const missingInApp = rows.filter((row) => row.app_present !== "yes");
  const productIssues = rows.filter((row) => row.product_status !== "OK");
  const imageRate = rows.length ? ((rows.length - missingImages.length) / rows.length) * 100 : 0;
  const videoRate = rows.length ? ((rows.length - missingVideos.length) / rows.length) * 100 : 0;
  const priceRate = rows.length ? ((rows.length - priceIssues.length) / rows.length) * 100 : 0;
  const categoryRate = rows.length ? ((rows.length - categoryIssues.length) / rows.length) * 100 : 0;
  const websiteRate = rows.length ? ((rows.length - missingInWebsite.length) / rows.length) * 100 : 0;
  const appRate = rows.length ? ((rows.length - missingInApp.length) / rows.length) * 100 : 0;
  const overallRate = Math.min(imageRate, priceRate, categoryRate, websiteRate, appRate);

  const report = `# HAODE Product Control System 健康报告

生成日期：${TODAY}

## 系统目标

防止网站和 APP 出现：

- 图片错误
- 图片缺失
- 视频缺失
- 价格错误
- 产品漏发
- 分类错误

## 唯一主数据源

- 主数据文件：\`docs/master-data/products-master.csv\`
- 网站数据源：\`data/products.generated.js\`
- APP 数据源：\`app/products.json\`

说明：价格只做比对和报告，禁止自动修改。

## 总体统计

| 指标 | 当前值 | 目标 |
| --- | ---: | ---: |
| Master 产品总数 | ${rows.length} | 与网站/APP一致 |
| 网站数据源产品数 | ${websiteProducts.length} | 逐步并入 Master |
| 网站实际展示覆盖数 | ${rows.length - missingInWebsite.length} | ${rows.length} |
| APP 产品数 | ${appProducts.length} | ${rows.length} |
| 图片存在率 | ${imageRate.toFixed(1)}% | 99%+ |
| 视频存在率 | ${videoRate.toFixed(1)}% | 99%+ |
| 价格一致率 | ${priceRate.toFixed(1)}% | 99%+ |
| 分类一致率 | ${categoryRate.toFixed(1)}% | 99%+ |
| 网站发布完整率 | ${websiteRate.toFixed(1)}% | 99%+ |
| APP 发布完整率 | ${appRate.toFixed(1)}% | 99%+ |
| 当前产品准确率 | ${overallRate.toFixed(1)}% | 99%+ |

## 异常汇总

| 异常类型 | 数量 | 自动处理策略 |
| --- | ---: | --- |
| 图片缺失/路径不存在 | ${missingImages.length} | 允许自动修复路径，不允许乱换图 |
| 视频缺失/路径不存在 | ${missingVideos.length} | 允许自动修复路径，缺素材则报告 |
| 价格不一致 | ${priceIssues.length} | 禁止自动修改价格 |
| 分类不一致 | ${categoryIssues.length} | 允许自动修复分类 |
| 网站漏发 | ${missingInWebsite.length} | 允许补页面/补路径 |
| APP 漏发 | ${missingInApp.length} | 允许生成同步建议，不直接改价 |

## 产品漏发

### 网站缺失
${formatIssueRows(rows, (row) => !row.website_present.startsWith("yes"), ["id", "producto_nombre", "categoria"])}

### APP 缺失
${formatIssueRows(rows, (row) => row.app_present !== "yes", ["id", "producto_nombre", "categoria"])}

## 图片异常

${formatIssueRows(rows, (row) => row.image_exists !== "yes", ["id", "producto_nombre", "imagen_path"])}

## 视频异常

${formatIssueRows(rows, (row) => row.video_exists !== "yes", ["id", "producto_nombre", "video_path"])}

## 价格异常

${formatIssueRows(rows, (row) => row.price_status !== "OK", ["id", "producto_nombre", "precio_publico", "precio_mayoreo", "website_precio_publico", "website_precio_mayoreo", "app_precio_publico", "app_precio_mayoreo"])}

## 分类异常

${formatIssueRows(rows, (row) => row.category_status !== "OK", ["id", "producto_nombre", "categoria"])}

## 自动比对机制

每次修改网站或 APP 后执行：

\`\`\`bash
npm run product-control
\`\`\`

该命令会自动：

1. 读取 \`products-master.csv\`
2. 比对网站产品数据
3. 比对 APP 产品数据
4. 检查图片文件是否存在
5. 检查视频文件是否存在
6. 检查产品是否漏发
7. 生成本报告

## 禁止事项

- 禁止自动修改价格。
- 禁止使用其他型号图片代替。
- 禁止用占位图冒充真实产品图。
- 禁止删除已有产品。

## 允许自动修复

- 图片路径错误。
- 视频路径错误。
- 分类字段错误。
- 漏发页面的结构性补齐。
`;

  fs.writeFileSync(HEALTH_REPORT_PATH, report);

  return {
    total: rows.length,
    website: websiteProducts.length,
    app: appProducts.length,
    missingImages: missingImages.length,
    missingVideos: missingVideos.length,
    priceIssues: priceIssues.length,
    categoryIssues: categoryIssues.length,
    missingInWebsite: missingInWebsite.length,
    missingInApp: missingInApp.length,
    accuracy: Number(overallRate.toFixed(1))
  };
}

const { rows, websiteProducts, appProducts } = createControlData();
writeMaster(rows);
const summary = writeHealthReport(rows, websiteProducts, appProducts);
console.log(JSON.stringify(summary, null, 2));
