(function attachX200tVideo(global) {
  'use strict';
  const video = global.document.querySelector('[data-x200t-operation]');
  if (!video) return;
  const errorMessage = global.document.querySelector('[data-x200t-video-error]');
  const milestones = [10, 25, 50, 75];
  const sources = new Set(['direct', 'google', 'bing', 'chatgpt', 'perplexity', 'gemini', 'claude', 'copilot', 'facebook', 'instagram', 'tiktok', 'other_referral', 'haode_web']);
  let started = false;
  let completed = false;
  let finished = false;
  let seekInProgress = false;
  let previousPercent = 0;
  let previousTime = 0;
  let watchedRanges = [];
  const reported = new Set();

  function recordPlayback() {
    const current = video.currentTime;
    if (current > previousTime) {
      const ranges = [...watchedRanges, [previousTime, current]].sort((a, b) => a[0] - b[0]);
      watchedRanges = [];
      for (const range of ranges) {
        const last = watchedRanges[watchedRanges.length - 1];
        if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
        else watchedRanges.push([...range]);
      }
    }
    previousTime = current;
  }

  function percent() {
    if (!Number.isFinite(video.duration) || video.duration <= 0 || !Number.isFinite(video.currentTime)) return null;
    return Math.max(0, Math.min(100, video.currentTime / video.duration * 100));
  }

  function emit(name, at) {
    const consent = global.HaodePrivacy?.getConsent?.();
    if (!consent?.analytics || at === null) return false;
    const attribution = global.HaodeCampaign?.capture?.();
    const source = sources.has(attribution?.source) ? attribution.source : 'other_referral';
    const parameters = {
      product_id: 'x200t-cortadora-micas', video_id: 'haode-x200t-operacion-es-mx-v01',
      video_title: 'Operación de cortadora de micas de hidrogel HAODE X200T',
      video_provider: 'haode',
      video_url: 'https://haode.com.mx/assets/products/cut-machine/x200t/haode-x200t-operacion-es-mx-v01.mp4',
      video_duration: Math.round(video.duration), video_current_time: Math.round(video.currentTime),
      video_percent: Math.round(at), source
    };
    // Share the existing quotation session only under its existing dual-consent rule.
    const session = consent.advertising ? global.HaodeConversions?.getSessionId?.() : '';
    if (typeof session === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(session)) {
      parameters.quotation_session_id = session;
    }
    return global.HaodeAnalytics?.event(name, parameters) === true;
  }

  function start() {
    const at = percent();
    if (at === null || video.paused || video.ended || seekInProgress || video.seeking) return;
    if (finished && video.currentTime < 0.5) {
      started = completed = finished = false;
      reported.clear();
      watchedRanges = [];
    }
    if (!started && emit('video_start', at)) {
      started = true;
      previousPercent = at;
      previousTime = video.currentTime;
    }
  }

  video.addEventListener('play', start);
  video.addEventListener('timeupdate', () => {
    if (video.paused || video.ended || video.seeking || seekInProgress) return;
    start();
    const at = percent();
    if (!started || at === null) return;
    recordPlayback();
    for (const milestone of milestones) {
      if (previousPercent < milestone && at >= milestone && !reported.has(milestone)
          && emit('video_progress', milestone)) reported.add(milestone);
    }
    previousPercent = at;
  });
  // A seek is navigation, not evidence that skipped portions were watched.
  video.addEventListener('seeking', () => { seekInProgress = true; });
  video.addEventListener('seeked', () => {
    seekInProgress = false;
    previousPercent = percent() ?? 0;
    previousTime = video.currentTime;
  });
  video.addEventListener('ended', () => {
    finished = true;
    if (!started || seekInProgress || video.seeking || percent() === null) return;
    recordPlayback();
    const watched = watchedRanges.reduce((sum, [from, to]) => sum + to - from, 0);
    // Reaching the end after a seek is not a completed view. Require 95% of
    // distinct media time observed during consented, uninterrupted playback.
    if (!completed && watched >= video.duration * 0.95 && emit('video_complete', percent())) completed = true;
  });
  global.addEventListener('haode:privacy-consent', () => {
    if (!global.HaodePrivacy?.getConsent?.()?.analytics) {
      started = completed = finished = false;
      reported.clear();
      watchedRanges = [];
      previousPercent = percent() ?? 0;
      previousTime = video.currentTime;
    }
  });
  // A failed <source> emits a non-bubbling error before video.error is set.
  video.addEventListener('error', event => {
    if (errorMessage && (event.target === video || event.target?.tagName === 'SOURCE')) errorMessage.hidden = false;
  }, true);
  video.addEventListener('loadeddata', () => { if (errorMessage) errorMessage.hidden = true; });
})(window);
