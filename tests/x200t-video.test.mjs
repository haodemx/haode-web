import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { withX200tOperationVideo } = require('../scripts/x200t-operation-video.cjs');
const script = fs.readFileSync(new URL('../x200t-video.js', import.meta.url), 'utf8');

function fixture() {
  const handlers = {}, events = [], listeners = {};
  const consent = { analytics: false, advertising: false };
  const video = { duration: 60, currentTime: 0, paused: false, ended: false, seeking: false,
    addEventListener: (name, handler) => { handlers[name] = handler; } };
  let sessionReads = 0;
  const error = { hidden: true };
  vm.runInNewContext(script, { window: {
    document: { querySelector: selector => selector === '[data-x200t-operation]' ? video : error },
    addEventListener: (name, handler) => { listeners[name] = handler; },
    HaodePrivacy: { getConsent: () => consent },
    HaodeCampaign: { capture: () => ({ source: 'chatgpt', email: 'private@example.com' }) },
    HaodeConversions: { getSessionId: () => { sessionReads++; return '12345678-1234-1234-1234-123456789abc'; } },
    HaodeAnalytics: { event: (name, parameters) => { events.push({ name, parameters }); return true; } }
  } });
  return { video, consent, events, error, fire: (name, target = video) => handlers[name]({ target }), privacy: () => listeners['haode:privacy-consent'](), sessionReads: () => sessionReads };
}

test('video waits for analytics consent and never backfills denied playback', () => {
  const f = fixture();
  f.fire('play'); f.video.currentTime = 30; f.fire('timeupdate');
  assert.equal(f.events.length, 0);
  f.consent.analytics = true; f.fire('timeupdate');
  assert.deepEqual(f.events.map(e => e.name), ['video_start']);
  assert.equal(f.sessionReads(), 0, 'analytics-only consent must not create a quotation session');
  f.video.currentTime = 46; f.fire('timeupdate');
  assert.deepEqual(f.events.filter(e => e.name === 'video_progress').map(e => e.parameters.video_percent), [75]);
  assert.doesNotMatch(JSON.stringify(f.events), /private@example|email/);
  f.consent.analytics = false; f.privacy(); f.video.currentTime = 55; f.fire('timeupdate');
  assert.equal(f.events.length, 2);
});

test('pause/resume and duplicate media events do not duplicate starts, progress or completion', () => {
  const f = fixture(); f.consent.analytics = f.consent.advertising = true;
  f.fire('play'); f.fire('play');
  for (const time of [6.1, 6.2, 15.1, 30.1, 45.1]) { f.video.currentTime = time; f.fire('timeupdate'); }
  f.video.paused = true; f.fire('play'); f.fire('timeupdate');
  f.video.paused = false; f.fire('play');
  f.video.currentTime = 60; f.video.ended = true; f.fire('ended'); f.fire('ended');
  assert.equal(f.events.filter(e => e.name === 'video_start').length, 1);
  assert.deepEqual(f.events.filter(e => e.name === 'video_progress').map(e => e.parameters.video_percent), [10, 25, 50, 75]);
  assert.equal(f.events.filter(e => e.name === 'video_complete').length, 1);
  assert.equal(f.events[0].parameters.source, 'chatgpt');
  assert.equal(f.events[0].parameters.quotation_session_id, '12345678-1234-1234-1234-123456789abc');
  assert.equal('session_id' in f.events[0].parameters, false, 'preserve the GA4-native session identifier');
});

test('seeking does not claim skipped progress, invalid metadata is ignored, errors expose fallback', () => {
  const f = fixture(); f.consent.analytics = true;
  f.video.duration = NaN; f.fire('play'); assert.equal(f.events.length, 0);
  f.video.duration = 60; f.fire('play');
  f.video.seeking = true; f.video.currentTime = 50; f.fire('seeking');
  // Chromium clears the native flag before its final timeupdate, before seeked.
  f.video.seeking = false; f.fire('timeupdate'); f.fire('seeked');
  f.video.currentTime = 51; f.fire('timeupdate');
  assert.equal(f.events.length, 1);
  f.video.currentTime = 59.9; f.fire('seeking'); f.fire('timeupdate'); f.fire('seeked');
  f.video.currentTime = 60; f.video.ended = true; f.fire('ended');
  assert.equal(f.events.length, 1, 'seeking to the end must not claim a complete view');
  f.fire('error', { tagName: 'TRACK' }); assert.equal(f.error.hidden, true);
  f.fire('error', { tagName: 'SOURCE' }); assert.equal(f.error.hidden, false);
  f.fire('loadeddata'); assert.equal(f.error.hidden, true);
});

test('approved video survives product generation idempotently and never modifies other products', () => {
  const html = '<html><head></head><body><img src="original.png"><div class="detail-video-wrap" hidden><h2>Video</h2><div data-detail-videos></div></div><p>$6,100 MXN</p></body></html>';
  assert.equal(withX200tOperationVideo(html, 'mica-hd'), html);
  const next = withX200tOperationVideo(html, 'x200t-cortadora-micas');
  assert.equal(withX200tOperationVideo(next, 'x200t-cortadora-micas'), next);
  assert.ok(next.includes('original.png') && next.includes('$6,100 MXN'));
  assert.match(next, /preload="none"/);
  assert.doesNotMatch(next, /autoplay|<track[^>]+default/);
  const schema = JSON.parse(next.match(/data-x200t-video-schema>(.*?)<\/script>/s)[1]);
  assert.equal(schema.duration, 'PT1M');
  assert.equal(schema.contentUrl, 'https://haode.com.mx/assets/products/cut-machine/x200t/haode-x200t-operacion-es-mx-v01.mp4');
  assert.throws(() => withX200tOperationVideo('<html></html>', 'x200t-cortadora-micas'), /requires/);
});
