---
name: haode-product-upload
description: Use when the user asks to upload a product, add a new product, publish a SKU, or provide product images, videos, model numbers, or prices for HAODE México.
---

# HAODE Product Upload

Use this skill when the user says to upload a product, add a new SKU, or put a product on the site.

## Workflow

1. Identify the product category first: `Pantallas`, `Micas`, `Gafas AI`, `Productos AI`, `Máquinas de Mica`, `Fundas`, or `Cámaras`.
2. Keep all product copy in Spanish by default.
3. Use only the user-provided or project-local assets. Do not invent images or pull random web images.
4. Never mix screen photos with membrane/mica photos.
5. If an image is not clearly confirmed, do not publish it.
6. Build the product page content with:
   - product name
   - category
   - specs
   - retail price
   - wholesale price
   - SEO title
   - SEO description
   - image and video paths
7. Update the related category page, product detail page, homepage new-products area, and sitemap when the product is meant to go live.
8. Finish by verifying the page, running `git status`, committing, and pushing `main` when the task requires publishing.

