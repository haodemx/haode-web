import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:4175';
const OUTPUT_STEM = process.env.UI_AUDIT_OUTPUT
  ? path.resolve(process.env.UI_AUDIT_OUTPUT)
  : path.join(ROOT, 'docs', 'reports', 'ui-acceptance-audit-latest');
const CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.UI_AUDIT_CONCURRENCY || 5)));
const DEFAULT_WIDTHS = [360, 390, 768, 1440, 1920];
const HEIGHT_BY_WIDTH = new Map([
  [360, 844],
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
]);

function parseViewports() {
  const requested = String(process.env.UI_AUDIT_WIDTHS || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 320);
  const widths = requested.length ? requested : DEFAULT_WIDTHS;
  return [...new Set(widths)].map((width) => ({
    width,
    height: HEIGHT_BY_WIDTH.get(width) || (width < 768 ? 844 : 900),
  }));
}

function normalizePathname(value) {
  const url = new URL(value, 'https://haode.com.mx');
  const cleanPath = url.pathname.replace(/\/+$/, '') || '/';
  const hasFileExtension = /\.[a-z0-9]+$/i.test(cleanPath);
  const pathname = cleanPath === '/' || hasFileExtension ? cleanPath : `${cleanPath}/`;
  return `${pathname}${url.hash || ''}`;
}

function readSitemapTargets() {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const canonicalRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].replaceAll('&amp;', '&'))
    .map((url) => ({
      route: normalizePathname(url),
      expectedStatus: 200,
      canonical: true,
      commercial: true,
      source: 'sitemap',
    }));

  const extraTargets = [
    {
      route: '/offline.html',
      expectedStatus: 200,
      canonical: false,
      commercial: false,
      source: 'state',
    },
    {
      route: '/captura-ui-pagina-no-existe/',
      expectedStatus: 404,
      canonical: false,
      commercial: false,
      source: 'state',
    },
    ...[
      '#inicio',
      '#lista',
      '#grupo/Pantallas',
      '#categoria/Pantallas%20iPhone%20INCELL',
      '#producto/iphone-incell-14',
      '#producto/x200t-cortadora-micas',
      '#carrito',
      '#contacto',
    ].map((hash) => ({
      route: `/app/${hash}`,
      expectedStatus: 200,
      canonical: false,
      commercial: true,
      source: 'app-state',
    })),
  ];

  const byRoute = new Map();
  for (const target of [...canonicalRoutes, ...extraTargets]) {
    if (!byRoute.has(target.route)) byRoute.set(target.route, target);
  }
  return [...byRoute.values()];
}

function cleanConsoleMessage(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
}

async function inspectTarget(page, target, viewport) {
  const consoleErrors = [];
  const onConsole = (message) => {
    if (message.type() === 'error') consoleErrors.push(cleanConsoleMessage(message.text()));
  };
  const onPageError = (error) => consoleErrors.push(cleanConsoleMessage(error.message));
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  const startedAt = Date.now();
  let response;
  let navigationError = '';
  try {
    response = await page.goto(`${BASE_URL}${target.route}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
    await page.waitForTimeout(target.source === 'app-state' ? 450 : 140);
  } catch (error) {
    navigationError = cleanConsoleMessage(error.message);
  }

  let pageAudit = {
    title: '',
    description: '',
    canonical: '',
    h1: '',
    bodyTextLength: 0,
    overflow: 0,
    headerOverflow: 0,
    badVisibleImages: [],
    whatsappLinks: 0,
    visibleWhatsappLinks: 0,
  };

  if (!navigationError) {
    pageAudit = await page.evaluate(() => {
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && Number(style.opacity) > 0
          && rect.width > 0
          && rect.height > 0;
      };
      const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return isVisible(element)
          && rect.bottom > 0
          && rect.top < window.innerHeight
          && rect.right > 0
          && rect.left < window.innerWidth;
      };
      const visibleImages = [...document.images].filter(isInViewport);
      const whatsapp = [...document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]')];
      const header = document.querySelector('.reference-header, .app-header, header');

      return {
        title: document.title.trim(),
        description: document.querySelector('meta[name="description"]')?.content?.trim() || '',
        canonical: document.querySelector('link[rel="canonical"]')?.href || '',
        h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim() || '',
        bodyTextLength: document.body?.innerText?.trim().length || 0,
        overflow: Math.max(
          0,
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
        headerOverflow: header ? Math.max(0, header.scrollWidth - header.clientWidth) : 0,
        badVisibleImages: visibleImages
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        whatsappLinks: whatsapp.length,
        visibleWhatsappLinks: whatsapp.filter(isInViewport).length,
      };
    });
  }

  page.off('console', onConsole);
  page.off('pageerror', onPageError);

  const status = response?.status() || (pageAudit.bodyTextLength > 0 ? target.expectedStatus : 0);
  const expectedCanonical = target.canonical
    ? new URL(target.route.replace(/#.*$/, ''), 'https://haode.com.mx').toString()
    : '';
  const actualCanonical = pageAudit.canonical
    ? new URL(pageAudit.canonical, 'https://haode.com.mx').toString()
    : '';

  return {
    route: target.route,
    source: target.source,
    viewport,
    expectedStatus: target.expectedStatus,
    status,
    durationMs: Date.now() - startedAt,
    navigationError,
    expectedCanonical,
    ...pageAudit,
    canonicalMatches: !target.canonical
      || normalizePathname(actualCanonical) === normalizePathname(expectedCanonical),
    consoleErrors: [...new Set(consoleErrors)].slice(0, 8),
    commercial: target.commercial,
  };
}

function classifyCheck(check) {
  const issues = [];
  const add = (priority, rule, detail) => issues.push({
    priority,
    rule,
    detail,
    route: check.route,
    viewport: check.viewport.width,
  });

  if (check.navigationError || check.status >= 500 || check.status === 0 || check.bodyTextLength === 0) {
    add('P0', 'page_unavailable', check.navigationError || `HTTP ${check.status}, body ${check.bodyTextLength}`);
  } else if (check.status !== check.expectedStatus) {
    add('P1', 'unexpected_status', `expected ${check.expectedStatus}, got ${check.status}`);
  }
  if (check.overflow > 1) add('P1', 'horizontal_overflow', `${check.overflow}px`);
  if (check.headerOverflow > 1) add('P1', 'header_overflow', `${check.headerOverflow}px`);
  if (check.badVisibleImages.length) {
    add('P1', 'broken_first_screen_image', check.badVisibleImages.join(', '));
  }
  if (!check.h1) add('P1', 'missing_h1', 'No H1 rendered');
  if (check.commercial && check.whatsappLinks === 0) {
    add('P1', 'missing_whatsapp_path', 'No WhatsApp link in the rendered page');
  }
  if (!check.title) add('P2', 'missing_title', 'No document title');
  if (!check.description && check.source === 'sitemap') {
    add('P2', 'missing_meta_description', 'No meta description');
  }
  if (check.source === 'sitemap' && !check.canonical) {
    add('P2', 'missing_canonical', 'No canonical link');
  } else if (!check.canonicalMatches) {
    add('P2', 'canonical_mismatch', `${check.canonical} != ${check.expectedCanonical}`);
  }
  if (check.commercial && check.visibleWhatsappLinks === 0) {
    add('P2', 'whatsapp_not_first_screen', 'WhatsApp exists but is not visible in the first screen');
  }

  return issues;
}

async function auditViewport(browser, targets, viewport) {
  const context = await browser.newContext({
    viewport,
    serviceWorkers: 'block',
    ignoreHTTPSErrors: true,
  });
  const baseOrigin = new URL(BASE_URL).origin;
  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url());
    const shouldMirrorOfficialSite = baseOrigin !== 'https://haode.com.mx'
      && requestUrl.origin === 'https://haode.com.mx';
    if (shouldMirrorOfficialSite) {
      const localUrl = new URL(`${requestUrl.pathname}${requestUrl.search}`, BASE_URL);
      const localResponse = await context.request.fetch(localUrl.toString());
      await route.fulfill({ response: localResponse });
      return;
    }
    const isExternalHttp = ['http:', 'https:'].includes(requestUrl.protocol)
      && requestUrl.origin !== baseOrigin
      && requestUrl.hostname !== 'haode.com.mx';
    if (isExternalHttp) {
      await route.abort();
      return;
    }
    await route.continue();
  });

  let nextIndex = 0;
  const checks = [];
  const workers = Array.from({ length: Math.min(CONCURRENCY, targets.length) }, async () => {
    const page = await context.newPage();
    while (nextIndex < targets.length) {
      const index = nextIndex;
      nextIndex += 1;
      const target = targets[index];
      const check = await inspectTarget(page, target, viewport);
      checks.push(check);
      if ((index + 1) % 25 === 0 || index + 1 === targets.length) {
        process.stdout.write(`audit ${viewport.width}px ${index + 1}/${targets.length}\n`);
      }
    }
    await page.close();
  });

  await Promise.all(workers);
  await context.close();
  return checks.sort((a, b) => a.route.localeCompare(b.route));
}

function markdownTable(issues) {
  if (!issues.length) return '无。';
  const rows = [
    '| 优先级 | 规则 | 宽度 | 路由 | 详情 |',
    '| --- | --- | ---: | --- | --- |',
  ];
  for (const issue of issues) {
    rows.push(`| ${issue.priority} | ${issue.rule} | ${issue.viewport} | \`${issue.route}\` | ${issue.detail.replace(/\|/g, '\\|')} |`);
  }
  return rows.join('\n');
}

function buildMarkdown(report) {
  const p0 = report.issues.filter((issue) => issue.priority === 'P0');
  const p1 = report.issues.filter((issue) => issue.priority === 'P1');
  const p2 = report.issues.filter((issue) => issue.priority === 'P2');
  const routeTypes = report.targets.reduce((summary, target) => {
    summary[target.source] = (summary[target.source] || 0) + 1;
    return summary;
  }, {});

  return [
    '# HAODE 网站与 App UI 正式验收报告',
    '',
    `生成时间：${report.generatedAtLocal}`,
    `检查环境：\`${report.baseUrl}\``,
    '',
    '## 验收范围',
    '',
    `- canonical sitemap 路由：${routeTypes.sitemap || 0}`,
    `- App 关键 hash 状态：${routeTypes['app-state'] || 0}`,
    `- 离线/404 状态：${routeTypes.state || 0}`,
    `- 屏幕宽度：${report.viewports.map((viewport) => viewport.width).join(' / ')}`,
    `- 总页面渲染次数：${report.checks.length}`,
    '',
    '## 结果汇总',
    '',
    '| 指标 | 数量 |',
    '| --- | ---: |',
    `| P0 | ${p0.length} |`,
    `| P1 | ${p1.length} |`,
    `| P2 | ${p2.length} |`,
    `| 无问题渲染 | ${report.cleanChecks} |`,
    '',
    'P0/P1 必须在生产部署前关闭。P2 是优化项，不涉及价格、库存、图片真实性或业务规则猜测。',
    '',
    '## P0',
    '',
    markdownTable(p0),
    '',
    '## P1',
    '',
    markdownTable(p1),
    '',
    '## P2',
    '',
    markdownTable(p2),
    '',
    '## 人工视觉复核',
    '',
    '- 24 种网站代表版面：桌面 1440 × 900、手机 390 × 844。',
    '- 12 个 App 关键状态：手机 390 × 844。',
    '- 自动检查不能证明照片型号正确；未确认媒体继续使用既有占位策略并列入业务素材清单。',
    '- 同模板商品页按共享模板验收，异常 SKU 路由仍在本报告的全路由检查范围内。',
    '',
  ].join('\n');
}

async function main() {
  const targets = readSitemapTargets();
  const viewports = parseViewports();
  const browser = await chromium.launch({ headless: true });
  const checks = [];

  try {
    for (const viewport of viewports) {
      checks.push(...await auditViewport(browser, targets, viewport));
    }
  } finally {
    await browser.close();
  }

  const issues = checks.flatMap(classifyCheck);
  const checksWithIssues = new Set(issues.map((issue) => `${issue.viewport}:${issue.route}`));
  const generatedAt = new Date();
  const report = {
    generatedAt: generatedAt.toISOString(),
    generatedAtLocal: `${new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(generatedAt)} America/Mexico_City`,
    baseUrl: BASE_URL,
    viewports,
    targets,
    checks,
    issues,
    cleanChecks: checks.length - checksWithIssues.size,
  };
  const compactReport = {
    generatedAt: report.generatedAt,
    generatedAtLocal: report.generatedAtLocal,
    baseUrl: report.baseUrl,
    viewports: report.viewports,
    targets: report.targets,
    checks: report.checks.map((check) => ({
      route: check.route,
      source: check.source,
      viewport: check.viewport.width,
      status: check.status,
      expectedStatus: check.expectedStatus,
      durationMs: check.durationMs,
      overflow: check.overflow,
      headerOverflow: check.headerOverflow,
      badVisibleImages: check.badVisibleImages,
      hasH1: Boolean(check.h1),
      whatsappLinks: check.whatsappLinks,
      visibleWhatsappLinks: check.visibleWhatsappLinks,
      canonicalMatches: check.canonicalMatches,
    })),
    issues: report.issues,
    cleanChecks: report.cleanChecks,
  };

  fs.mkdirSync(path.dirname(OUTPUT_STEM), { recursive: true });
  fs.writeFileSync(`${OUTPUT_STEM}.json`, `${JSON.stringify(compactReport, null, 2)}\n`, 'utf8');
  fs.writeFileSync(`${OUTPUT_STEM}.md`, buildMarkdown(report), 'utf8');

  const summary = {
    routes: targets.length,
    viewports: viewports.map((viewport) => viewport.width),
    checks: checks.length,
    p0: issues.filter((issue) => issue.priority === 'P0').length,
    p1: issues.filter((issue) => issue.priority === 'P1').length,
    p2: issues.filter((issue) => issue.priority === 'P2').length,
    output: path.relative(ROOT, OUTPUT_STEM),
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (summary.p0 || summary.p1) process.exitCode = 1;
}

await main();
