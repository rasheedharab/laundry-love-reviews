

## Problem

The `ServiceDetail` page currently picks its hero image using a **category-level** map (`heroImageMap`) with only 6 generic category images, falling back to a single default. Meanwhile, `src/lib/serviceImages.ts` already has 24 service-specific, high-quality images mapped by service slug — but this file is never imported or used on the detail page.

## Plan

**Single file change — `src/pages/ServiceDetail.tsx`:**

1. Import the `serviceImages` map from `@/lib/serviceImages`.
2. Update the hero image resolution to prioritize in this order:
   - `service.image_url` (database override, if set)
   - `serviceImages[service.slug]` (service-specific local image)
   - `heroImageMap[categorySlug]` (category fallback)
   - `serviceHeroDefault` (ultimate fallback)

This is a ~3-line change: one new import and updating the `heroImage` const.

