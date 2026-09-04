import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const app = fs.readFileSync(new URL('../app/app.js', import.meta.url), 'utf8');
const start = app.indexOf('async function submitWebOrder()');
const end = app.indexOf('\nfunction singleProductWhatsappUrl', start);
assert.ok(start >= 0 && end > start);

function harness(responses) {
  const events = [];
  const context = vm.createContext({
    ERP_WEB_ORDER_URL: 'https://example.invalid/orders',
    webOrderPayload: () => ({customer_name: 'QA', whatsapp: 'not-a-real-phone', items: [{}], client_request_id: 'QA', total: 100}),
    state: {attribution: {source: 'google'}},
    ga4CartItems: () => [{item_id: 'QA', quantity: 1}],
    trackGrowthEvent: (name, parameters) => { events.push({name, parameters}); return true; },
    fetch: async () => {
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return {ok: response.status >= 200 && response.status < 300, status: response.status, json: async () => response.body};
    },
    console: {info() {}},
  });
  vm.runInContext(app.slice(start, end), context);
  return {events, submit: () => context.submitWebOrder()};
}

test('new acknowledged order produces one lead without customer identifiers', async () => {
  const h = harness([{status: 201, body: {ok: true, replayed: false, order_number: 'WEB-QA'}}]);
  const result = await h.submit();
  assert.equal(result.order_number, 'WEB-QA');
  assert.equal(h.events.length, 1);
  assert.equal(h.events[0].name, 'generate_lead');
  assert.equal(h.events[0].parameters.lead_registered, true);
  assert.doesNotMatch(JSON.stringify(h.events), /not-a-real-phone|WEB-QA|customer_name/);
});

test('idempotent replay is not counted as a second new lead', async () => {
  const h = harness([
    {status: 201, body: {ok: true, replayed: false, order_number: 'WEB-QA'}},
    {status: 200, body: {ok: true, replayed: true, order_number: 'WEB-QA'}},
  ]);
  await h.submit();
  const replay = await h.submit();
  assert.equal(replay.replayed, true);
  assert.equal(h.events.length, 1);
});

for (const body of [{}, {ok: true, ignored: true}, {order_number: ''}, {order_number: '   '}, {order_number: 12}]) {
  test(`unconfirmed successful response does not generate a lead: ${JSON.stringify(body)}`, async () => {
    const h = harness([{status: 202, body}]);
    await h.submit();
    assert.equal(h.events.length, 0);
  });
}

for (const response of [{status: 500, body: {}}, new Error('Network unavailable')]) {
  test(`failed order leaves WhatsApp fallback intact: ${response.status || 'network'}`, async () => {
    const h = harness([response]);
    assert.equal(await h.submit(), null);
    assert.equal(h.events.length, 0);
  });
}
