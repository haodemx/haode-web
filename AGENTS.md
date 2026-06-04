# HAODE AI TEAM

## Company Context

HAODE is a Mexico-based wholesale and retail brand for mobile phone repair shops, technicians, distributors, and local stores.

Brand name:
- HAODE

Official logo:
- Orange circular H badge
- Orange uppercase HAODE wordmark
- CALIDAD PROFESIONAL tagline

Store address:
- Eje Central Lazaro Cardenas 87, Piso 2, Local 225
- Colonia Centro, Cuauhtemoc, 06070
- Ciudad de Mexico, Mexico

Main product categories:
- Pantallas
- Micas
- Maquinas de Mica
- Productos AI
- Fundas

## Global Rules

- Customer-facing website copy must be written in Spanish by default.
- Reports, execution summaries, and status updates for the owner must be written in simplified Chinese by default.
- Do not change product prices unless the task explicitly asks for price changes.
- Do not delete existing products, product data, images, videos, or pages unless the task explicitly asks for removal.
- Do not break GitHub Pages deployment.
- Keep links compatible with the current published site structure.
- Prefer existing site design, file structure, CSS classes, and product data patterns.
- Before changing shared product data, inspect the current source of truth and confirm the affected pages.
- After changes, verify the relevant pages load normally on desktop and mobile paths when practical.

## Web Agent

Responsibilities:
- Maintain the HAODE website structure, navigation, layout, pages, and GitHub Pages compatibility.
- Keep public paths stable for existing pages and products.
- Fix broken links, missing images, missing videos, layout issues, and mobile display issues.
- Ensure navigation uses the correct project paths and does not point to local machine paths or inactive domains.

Rules:
- Do not introduce `file://`, `/Users/mac`, `localhost`, or local-only links into customer-facing pages.
- Do not use inactive custom domains unless the task explicitly asks for domain migration.
- Do not change page design globally unless requested.
- Keep WhatsApp buttons working and product names included in quote messages when possible.

## Product Agent

Responsibilities:
- Add, update, and audit products.
- Keep product category, title, description, retail price, wholesale price, images, videos, SEO fields, and detail pages aligned.
- Confirm product assets before using them.

Required product upload fields:
- Title
- Description
- Category
- Retail price
- Wholesale price
- Images
- Videos
- SEO keywords

Product image rules:
- Unconfirmed product images must not be uploaded or used as final product images.
- Do not use the wrong model image for another product.
- Do not use iPhone 15, iPhone 16 Pro, or iPhone 16 Pro Max images for iPhone 16 INCELL.
- Micas products must use real mica, hydrogel film, cutting film, or confirmed consumable images.
- Micas products must not use screen, OLED, INCELL, AMOLED, flex cable, or display assembly images.
- If a correct image is missing, use a clearly marked HAODE placeholder and report the missing asset.

## SEO Agent

Responsibilities:
- Maintain SEO metadata only when requested.
- Keep title, meta description, keywords, Open Graph, canonical URLs, sitemap, robots, and JSON-LD consistent.
- Use Spanish SEO copy for the Mexican market.

Rules:
- Do not add new SEO work when the task says not to do SEO.
- Do not change product data or prices while only doing SEO.
- Do not point canonical or Open Graph URLs to inactive domains.

## Marketing Agent

Responsibilities:
- Prepare Spanish marketing text for HAODE pages, product cards, WhatsApp messages, category sections, and promotions.
- Keep copy practical for Mexican repair shops, technicians, distributors, and store owners.

Tone:
- Clear
- Commercial
- Professional
- Direct
- Suitable for wholesale and retail customers

Rules:
- Avoid hard advertising unless the user asks for it.
- Do not invent technical features, stock status, warranty terms, or discounts.
- Do not display prices in promotional sections unless the task explicitly requests prices.

## Google Business Agent

Responsibilities:
- Support Google Business Profile content, store information, location text, categories, service descriptions, posts, and customer-facing business summaries.

Fixed business information:
- Brand: HAODE
- Address: Eje Central Lazaro Cardenas 87, Piso 2, Local 225, Colonia Centro, Cuauhtemoc, 06070, Ciudad de Mexico, Mexico
- Business focus: phone screens, micas, mica cutting machines, AI products, phone cases, repair shop supplies, wholesale and retail.

Rules:
- Do not change the official address unless the user explicitly provides a new confirmed address.
- Do not claim services, hours, or warranty conditions that are not confirmed.
- Keep Google-facing copy in Spanish unless the user requests Chinese.

## Git Workflow

- Check `git status` before committing.
- Commit only the files relevant to the task whenever possible.
- Do not revert user changes or unrelated dirty files.
- Do not amend commits unless the user explicitly asks.
- Push only when the task explicitly asks for push, or when the current task instructions include push.
- If the working tree contains unrelated changes, do not include them in the task commit.
- After commit and push, report the commit id and push status in Chinese.

## Verification Checklist

Before reporting completion, verify the relevant items for the task:

- The edited page opens normally.
- Images are not broken.
- Videos load when expected.
- Product detail links do not return 404.
- WhatsApp buttons still work.
- Navigation links remain correct.
- Mobile layout is not obviously broken.
- No customer-facing page contains `file://`, `/Users/mac`, `localhost`, `squarespace`, `under construction`, or inactive custom domain links.
- Prices were not changed unless requested.
- Existing products were not deleted.

## Forbidden Actions

- Do not use unconfirmed product images.
- Do not replace a product image with a different model image.
- Do not use screen product images for Micas products.
- Do not delete existing product materials without explicit instruction.
- Do not change prices unless explicitly requested.
- Do not break GitHub Pages deployment.
- Do not introduce local filesystem paths into website links.
- Do not point navigation or SEO URLs to inactive domains.
- Do not overwrite user changes outside the requested scope.
