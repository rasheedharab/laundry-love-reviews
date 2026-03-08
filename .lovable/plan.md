

## Analysis: Where Images Come From

**Current state:** All category and service images are stored as **local asset files** (`src/assets/*.jpg`) and mapped via hardcoded JavaScript objects. The database `image_url` columns for both `service_categories` and `services` tables are **all NULL**.

This means the admin panel's image upload feature for categories and services is functional but pointless — the frontend ignores the `image_url` from the database and uses hardcoded local imports instead.

### Images That Need Backend Migration

| Source | Count | Currently | Needs Migration |
|--------|-------|-----------|-----------------|
| Category images (`cat-*.jpg`) | 6 | Local assets, hardcoded map in 3 files | Yes — upload to storage, save URLs to `service_categories.image_url` |
| Service images (`svc-*.jpg`) | 24 | Local assets, hardcoded map in `serviceImages.ts` | Yes — upload to storage, save URLs to `services.image_url` |
| Blog cover images | 5 | Already in `public/images/` with URLs in DB | No change needed |
| Onboarding images | 3 | Local assets, app-chrome | No — not admin-editable content |
| Hero background, logo | 2 | Local assets, app-chrome | No — brand assets, not content |

### Plan

**Step 1 — Upload 30 images to the `service-images` storage bucket**
- Upload all 6 `cat-*.jpg` and 24 `svc-*.jpg` files to the existing `service-images` bucket
- This must be done programmatically via an edge function or manually by the user since we can't upload binary files from migrations

**Alternative approach (practical):** Since we can't upload binary assets via SQL migrations, we'll update the frontend to serve local assets as fallbacks BUT prioritize the `image_url` from the database when it exists. Then provide a simple way for the admin to upload replacement images via the existing admin panel.

**Step 2 — Update `service_categories` and `services` rows with image URLs**
- Once images are in storage, update each row's `image_url` with the public URL

**Step 3 — Update frontend to use `image_url` from database (with local fallback)**
- **`ServicesHub.tsx`**: Use `cat.image_url` from DB, fall back to local `heroImages[cat.slug]`
- **`CategoryPage.tsx`**: Same pattern — prefer DB `image_url`, fall back to local
- **`ServiceDetail.tsx`**: Use `service.image_url` from DB, fall back to `serviceImages[slug]`
- **`HomePage.tsx`**: Use category `image_url` from DB, fall back to local
- **`src/lib/serviceImages.ts`**: Keep as fallback map, used when DB `image_url` is null

This approach means:
1. Everything works identically right now (local images as fallback)
2. When admin uploads a new image via the admin panel, it automatically takes priority
3. No broken images during transition
4. Admin panel already supports image upload for both categories and services — it will "just work" once frontend reads `image_url`

### Files to Modify
- `src/pages/ServicesHub.tsx` — use `cat.image_url || heroImages[cat.slug]`
- `src/pages/CategoryPage.tsx` — same pattern
- `src/pages/ServiceDetail.tsx` — use `service.image_url || serviceImages[slug]`
- `src/pages/HomePage.tsx` — same pattern for category cards

No database schema changes needed — `image_url` columns already exist on both tables.

