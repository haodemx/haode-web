import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import vm from 'node:vm';
import test from 'node:test';

function requestHarness(fetchImpl = fetch) {
  const source = fs.readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
  const code = source.slice(source.indexOf('function timeoutError('), source.indexOf('async function loadErpPublicStock('));
  const state = { diagnostics: { externalRequests: {}, catalogAttempts: [] } };
  const context = { state, window: { setTimeout, clearTimeout }, AbortController, fetch: fetchImpl, performance, EXTERNAL_CATALOG_TIMEOUT_MS: 20, ERP_CATALOG_RETRY_DELAY_MS: 0, ERP_PUBLIC_CATALOG_URL: 'https://example.invalid/catalog', updateProductDiagnostics() {}, console: { info() {} } };
  const loader = source.slice(source.indexOf('async function loadErpPublicCatalog('), source.indexOf('function mergeErpCatalog('));
  vm.runInNewContext(`${code}\n${loader}\nglobalThis.request = fetchJsonWithTimeout; globalThis.catalog = loadErpPublicCatalog;`, context);
  return { request: context.request, catalog: context.catalog, state };
}

test('ERP JSON deadline covers body download after fast headers', async () => {
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.flushHeaders();
    const timer = setTimeout(() => res.end('{"products":[]}'), 200);
    res.on('close', () => clearTimeout(timer));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const { request, state } = requestHarness();
    await assert.rejects(request(`http://127.0.0.1:${server.address().port}/catalog`, {}, 60, 'ERP catalog'), /tardó/);
    assert.equal(state.diagnostics.externalRequests.catalog.status, 'timeout');
    assert.equal(state.diagnostics.externalRequests.catalog.phase, 'body');
    assert.equal(state.diagnostics.externalRequests.catalog.httpStatus, 200);
    assert.ok(state.diagnostics.externalRequests.catalog.elapsedMs >= 50);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});

test('catalog recovers once after a timed-out request and retains its first failure', async () => {
  let calls = 0;
  const fixture = { products: [{ sku: 'recovered-only' }] };
  const h = requestHarness((_url, { signal }) => ++calls === 1
    ? new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))))
    : Promise.resolve(Response.json(fixture)));
  assert.deepEqual(await h.catalog(), fixture.products);
  assert.equal(calls, 2);
  assert.deepEqual(Array.from(h.state.diagnostics.catalogAttempts, a => a.status), ['timeout', 'success']);
  assert.equal(h.state.diagnostics.catalogAttempts[0].phase, 'fetch');
  assert.doesNotMatch(JSON.stringify(h.state.diagnostics.catalogAttempts), /recovered-only|https:/);
});

test('persistent timeout stops after two requests; HTTP/empty/invalid JSON do not retry', async () => {
  let calls = 0;
  const h = requestHarness((_url, { signal }) => {
    calls += 1;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))));
  });
  assert.equal((await h.catalog()).length, 0);
  assert.equal(calls, 2);
  assert.deepEqual(Array.from(h.state.diagnostics.catalogAttempts, a => a.status), ['timeout', 'timeout']);
  for (const [response, status] of [[new Response('', { status: 503 }), 'http_error'], [Response.json({ products: [] }), 'empty'], [new Response('{bad'), 'parse_error']]) {
    let count = 0;
    const q = requestHarness(async () => { count += 1; return response; });
    assert.equal((await q.catalog()).length, 0);
    assert.equal(count, 1);
    assert.equal(q.state.diagnostics.catalogAttempts[0].status, status);
  }
});

test('ERP header timeout and network failure have distinct safe timing records', async () => {
  const stalledFetch = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
  });
  const stalled = requestHarness(stalledFetch);
  await assert.rejects(stalled.request('https://example.invalid/?private=query', {}, 20, 'ERP catalog'), /tardó/);
  assert.equal(stalled.state.diagnostics.externalRequests.catalog.phase, 'fetch');
  assert.equal(stalled.state.diagnostics.externalRequests.catalog.status, 'timeout');
  assert.equal(stalled.state.diagnostics.externalRequests.catalog.headersMs, null);
  const network = requestHarness(async () => { throw new TypeError('failed to fetch'); });
  await assert.rejects(network.request('https://example.invalid/', {}, 50, 'ERP catalog'), /failed to fetch/);
  assert.equal(network.state.diagnostics.externalRequests.catalog.status, 'network_error');
  assert.doesNotMatch(JSON.stringify(stalled.state), /private|query|https:|payload|example/);
});

test('ERP JSON parse rejection is caught before cleanup and classified separately', async () => {
  const { request, state } = requestHarness(async () => new Response('{invalid', { status: 200 }));
  await assert.rejects(request('https://example.invalid/', {}, 50, 'ERP catalog'), SyntaxError);
  assert.equal(state.diagnostics.externalRequests.catalog.status, 'parse_error');
  assert.equal(state.diagnostics.externalRequests.catalog.phase, 'body');
});

test('ERP HTTP failures do not become successful body reads', async () => {
  const { request, state } = requestHarness(async () => new Response('unavailable', { status: 503 }));
  await assert.rejects(request('https://example.invalid/', {}, 50, 'ERP catalog'), /ERP catalog 503/);
  assert.equal(state.diagnostics.externalRequests.catalog.status, 'http_error');
  assert.equal(state.diagnostics.externalRequests.catalog.httpStatus, 503);
});

test('successful ERP response preserves payload and bounded independent catalog/stock records', async () => {
  const payload = { products: [{ sku: 'fixture-only', quality: 'approved-local-wins' }] };
  const { request, state } = requestHarness(async () => Response.json(payload));
  assert.deepEqual(await request('https://example.invalid/', {}, 50, 'ERP catalog'), payload);
  await request('https://example.invalid/', {}, 50, 'ERP stock');
  const catalog = state.diagnostics.externalRequests.catalog;
  assert.equal(catalog.status, 'success');
  assert.equal(catalog.phase, 'complete');
  assert.ok(catalog.elapsedMs >= catalog.headersMs);
  assert.notEqual(catalog, state.diagnostics.externalRequests.stock);
  assert.deepEqual(Object.keys(catalog).sort(), ['elapsedMs', 'headersMs', 'httpStatus', 'phase', 'startedAtMs', 'status', 'timeoutMs']);
  assert.doesNotMatch(JSON.stringify(state.diagnostics.externalRequests), /fixture-only|approved-local-wins|https:/);
});
