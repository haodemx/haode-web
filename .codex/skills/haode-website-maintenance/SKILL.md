---
name: haode-website-maintenance
description: Use when the user asks to inspect, repair, verify, or maintain the HAODE website, including broken links, missing images, 404s, sitemap, robots, SEO, or deployment checks.
---

# HAODE Website Maintenance

Use this skill for site checks, fixes, and deployment validation.

## Workflow

1. Inspect the project structure before editing.
2. Check broken links, 404s, missing images, case-sensitive path issues, sitemap, robots, and SEO metadata.
3. Protect existing prices, product data, image paths, and published URLs.
4. Do not replace confirmed product images with unrelated ones.
5. Fix only the affected pages unless the user asks for a broader change.
6. Test the relevant pages locally after the fix.
7. Run `git status` and review the diff before commit.
8. Commit and push `main` when the task is ready to publish.

