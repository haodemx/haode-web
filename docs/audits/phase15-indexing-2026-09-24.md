# Phase 1.5 indexing evidence — 2026-09-24

## Scope

This check is limited to the four high-value URLs identified by the Day 0 URL Inspection sample. It does not infer full-site index coverage.

| URL | Live GSC state | Sitemap signal in GSC | Source verification | Remediation decision |
|---|---|---|---|---|
| `/categoria/iphone-incell/` | Google does not currently recognize the URL | Not shown in the inspection panel | 200, self-canonical, indexable, unique static content, valid structured data, present in source sitemap and internal links | No source defect found; request recrawl |
| `/categoria/iphone-oled/` | Discovered — currently not indexed | Detected | 200, self-canonical, indexable, unique static content, valid structured data, present in source sitemap and internal links | No source defect found; request recrawl |
| `/categoria/samsung-tipo-original/` | Google does not currently recognize the URL | Not shown in the inspection panel | 200, self-canonical, indexable, unique static content, valid structured data, present in source sitemap and internal links | No source defect found; request recrawl |
| `/producto/samsung-oled-s24-ultra/` | Discovered — currently not indexed | Detected | 200, self-canonical, indexable, unique product content/schema, present in source sitemap and internal links | No source defect found; request recrawl |

## Verification

The focused local suite passed 27/27 checks covering canonical, robots/indexability, sitemap membership, static uniqueness, structured data and internal links. No evidence justified a cosmetic content rewrite, canonical change or additional GEO page.

The source sitemap contains all four URLs. GSC's missing referring-sitemap display for two URLs is therefore recorded as a Google discovery state, not silently converted into a source defect.

## External action boundary

The four GSC `Request indexing` controls were located and left unsubmitted pending action-time confirmation. Once submitted, observe for 1–3 weeks and record either `Indexed` or the new evidence-backed exclusion reason. A recrawl request is not proof of indexing.
