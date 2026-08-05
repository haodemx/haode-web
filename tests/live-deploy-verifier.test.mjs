import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyLiveDeploy } from '../scripts/verify-live-deploy.mjs';

const BASE_URL = 'https://haode.com.mx';

function response(body, status = 200, contentType = 'text/html; charset=utf-8') {
  return new Response(body, {
    status,
    headers: { 'content-type': contentType },
  });
}

function createFetch(routes) {
  return async (input) => {
    const url = String(input);
    return routes[url] ?? response('Not found', 404, 'text/plain; charset=utf-8');
  };
}

const validHomepage = `
  <!doctype html>
  <form data-home-catalog-search-form action="/productos/" method="get">
    <input data-home-catalog-search-input name="q">
  </form>
`;

const validProductsPage = `
  <!doctype html>
  <form data-site-catalog-search-form action="/productos/" method="get">
    <input data-site-catalog-search-input name="q">
  </form>
`;

const validSitemap = `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://haode.com.mx/</loc></url>
    <url><loc>https://haode.com.mx/productos/</loc></url>
    <url><loc>https://haode.com.mx/producto/x200t-cortadora-micas/</loc></url>
  </urlset>
`;

test('passes when the live search stays on the website and every sitemap URL responds', async () => {
  const fetchImpl = createFetch({
    [`${BASE_URL}/`]: response(validHomepage),
    [`${BASE_URL}/productos/`]: response(validProductsPage),
    [`${BASE_URL}/sitemap.xml`]: response(validSitemap, 200, 'application/xml'),
    [`${BASE_URL}/producto/x200t-cortadora-micas/`]: response('<!doctype html><title>X200T</title>'),
  });

  const result = await verifyLiveDeploy({ baseUrl: BASE_URL, fetchImpl, concurrency: 2 });

  assert.equal(result.ok, true);
  assert.equal(result.totalUrls, 3);
  assert.equal(result.okUrls, 3);
  assert.equal(result.productPages, 1);
  assert.equal(result.productPagesOk, 1);
  assert.deepEqual(result.failures, []);
});

test('fails when the live homepage search points to the App even if all URLs respond', async () => {
  const appHomepage = `
    <!doctype html>
    <form data-home-catalog-search-form action="/app/" method="get">
      <input data-home-catalog-search-input name="q">
    </form>
  `;
  const fetchImpl = createFetch({
    [`${BASE_URL}/`]: response(appHomepage),
    [`${BASE_URL}/productos/`]: response(validProductsPage),
    [`${BASE_URL}/sitemap.xml`]: response(validSitemap, 200, 'application/xml'),
    [`${BASE_URL}/producto/x200t-cortadora-micas/`]: response('<!doctype html><title>X200T</title>'),
  });

  const result = await verifyLiveDeploy({ baseUrl: BASE_URL, fetchImpl, concurrency: 2 });

  assert.equal(result.ok, false);
  assert.ok(result.failures.some((failure) => failure.type === 'homepage_search_target'));
});

test('fails when a sitemap URL is broken', async () => {
  const fetchImpl = createFetch({
    [`${BASE_URL}/`]: response(validHomepage),
    [`${BASE_URL}/productos/`]: response(validProductsPage),
    [`${BASE_URL}/sitemap.xml`]: response(validSitemap, 200, 'application/xml'),
    [`${BASE_URL}/producto/x200t-cortadora-micas/`]: response('Missing', 404),
  });

  const result = await verifyLiveDeploy({ baseUrl: BASE_URL, fetchImpl, concurrency: 2 });

  assert.equal(result.ok, false);
  assert.equal(result.totalUrls, 3);
  assert.equal(result.okUrls, 2);
  assert.equal(result.productPagesOk, 0);
  assert.ok(result.failures.some((failure) => (
    failure.type === 'url_status'
      && failure.url === `${BASE_URL}/producto/x200t-cortadora-micas/`
      && failure.status === 404
  )));
});
