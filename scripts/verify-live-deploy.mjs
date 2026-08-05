import { pathToFileURL } from 'node:url';

function normalizeBaseUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  url.pathname = '/';
  return url;
}

function extractTaggedElement(html, tagName, attributeName) {
  const pattern = new RegExp(`<${tagName}\\b(?=[^>]*\\b${attributeName}\\b)[^>]*>`, 'i');
  return html.match(pattern)?.[0] ?? '';
}

function extractAttribute(tag, attributeName) {
  const pattern = new RegExp(`\\b${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(pattern);
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
}

function decodeXmlText(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)]
    .map((match) => decodeXmlText(match[1].trim()))
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index);
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), Math.max(1, items.length));
  await Promise.all(Array.from({ length: workerCount }, run));
  return results;
}

export async function verifyLiveDeploy({
  baseUrl = 'https://haode.com.mx',
  fetchImpl = globalThis.fetch,
  concurrency = 12,
} = {}) {
  const base = normalizeBaseUrl(baseUrl);
  const homepageUrl = new URL('/', base).toString();
  const productsUrl = new URL('/productos/', base).toString();
  const sitemapUrl = new URL('/sitemap.xml', base).toString();
  const failures = [];
  const fetched = new Map();

  async function fetchDocument(url) {
    if (fetched.has(url)) return fetched.get(url);

    let result;
    try {
      const response = await fetchImpl(url, {
        headers: {
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'cache-control': 'no-cache',
          'user-agent': 'HAODE-live-deploy-verifier/1.0',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
      });
      result = {
        status: response.status,
        ok: response.ok,
        body: await response.text(),
      };
    } catch (error) {
      result = {
        status: 0,
        ok: false,
        body: '',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    fetched.set(url, result);
    return result;
  }

  const [homepage, products, sitemap] = await Promise.all([
    fetchDocument(homepageUrl),
    fetchDocument(productsUrl),
    fetchDocument(sitemapUrl),
  ]);

  for (const [name, url, result] of [
    ['homepage', homepageUrl, homepage],
    ['products', productsUrl, products],
    ['sitemap', sitemapUrl, sitemap],
  ]) {
    if (!result.ok) {
      failures.push({
        type: 'core_url_status',
        name,
        url,
        status: result.status,
        ...(result.error ? { error: result.error } : {}),
      });
    }
  }

  if (homepage.ok) {
    const searchForm = extractTaggedElement(homepage.body, 'form', 'data-home-catalog-search-form');
    const searchAction = extractAttribute(searchForm, 'action');
    let searchPath = '';

    try {
      searchPath = new URL(searchAction, base).pathname.replace(/\/$/, '') || '/';
    } catch {
      searchPath = '';
    }

    if (!searchForm || searchPath !== '/productos') {
      failures.push({
        type: 'homepage_search_target',
        expected: '/productos/',
        actual: searchAction || null,
      });
    }
  }

  if (products.ok) {
    const siteSearchForm = extractTaggedElement(products.body, 'form', 'data-site-catalog-search-form');
    if (!siteSearchForm) {
      failures.push({ type: 'products_search_missing', url: productsUrl });
    }
  }

  const sitemapUrls = sitemap.ok ? extractSitemapUrls(sitemap.body) : [];
  if (sitemap.ok && sitemapUrls.length === 0) {
    failures.push({ type: 'sitemap_empty', url: sitemapUrl });
  }

  const sameOriginUrls = [];
  for (const url of sitemapUrls) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      failures.push({ type: 'sitemap_url_invalid', url });
      continue;
    }

    if (parsed.origin !== base.origin) {
      failures.push({ type: 'sitemap_origin', url, expectedOrigin: base.origin });
      continue;
    }
    sameOriginUrls.push(url);
  }

  const urlResults = await mapWithConcurrency(sameOriginUrls, concurrency, async (url) => {
    const result = await fetchDocument(url);
    if (!result.ok) {
      failures.push({
        type: 'url_status',
        url,
        status: result.status,
        ...(result.error ? { error: result.error } : {}),
      });
    }
    return { url, ok: result.ok };
  });

  const productResults = urlResults.filter(({ url }) => new URL(url).pathname.startsWith('/producto/'));

  return {
    ok: failures.length === 0,
    baseUrl: base.origin,
    sitemapStatus: sitemap.status,
    totalUrls: sitemapUrls.length,
    okUrls: urlResults.filter(({ ok }) => ok).length,
    productPages: productResults.length,
    productPagesOk: productResults.filter(({ ok }) => ok).length,
    failures,
  };
}

async function main() {
  const result = await verifyLiveDeploy({ baseUrl: process.env.BASE_URL || 'https://haode.com.mx' });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
