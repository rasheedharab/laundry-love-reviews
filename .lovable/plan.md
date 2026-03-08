

## Plan: HomePage Animations, Service Images & Admin Category/Service Management

### 1. Stagger Animations on HomePage Sections

**`src/pages/HomePage.tsx`**
- Import `motion` (already imported) and wrap three sections with `motion.div` stagger containers:
  - **Categories grid** (line ~176): Replace `<div className="grid grid-cols-2 gap-3">` with `motion.div` using `staggerChildren: 0.08`, each category card becomes `motion.button` with fade+slide variant
  - **Ritual steps** (line ~241): Replace the horizontal scroll `<div className="flex gap-3 ...">` with `motion.div` stagger container, each step becomes `motion.button`
  - **Care tips** (line ~299): Replace `<div className="space-y-3">` with `motion.div`, each tip becomes `motion.button`
- Reuse same variant pattern as CategoryPage (`hidden: { opacity: 0, y: 24, scale: 0.97 }` → `visible`)

### 2. Service-Specific Images via Edge Function

Since the service images in `src/assets/` are static placeholder files and `image_url` is null in the database, we'll build an admin-triggered image generation flow:

**`src/lib/serviceImages.ts`** — Already maps 24 slugs to local assets. These will serve as fallbacks. The real images will come from the `image_url` column in the database, managed via admin.

For now, the existing local images + the `serviceImages` map will continue to be used as defaults. Admins can upload/set custom image URLs through the new management UI (see section 3).

### 3. Admin Category Management — New Page

**Create `src/pages/admin/AdminCategories.tsx`**
- Full CRUD for `service_categories` table
- Fields: name, slug (auto-generated), description, icon, image_url, sort_order
- Image URL field allows pasting an external URL or uploading (storage bucket needed)
- Reorder via sort_order input
- Table list with edit/delete actions, same pattern as `AdminServices.tsx`

**Database**: Create a storage bucket `service-images` for category and service image uploads.

**Migration**: 
- Create `service-images` storage bucket with public access policy

### 4. Enhance Admin Services Page

**`src/pages/admin/AdminServices.tsx`** — Add missing fields to the form:
- Add `image_url` field (text input for URL or file upload to storage bucket)
- Add `whats_included` field (comma-separated text input, stored as text array)
- Add `sort_order` field (number input)
- Display service image thumbnail in the table list

### 5. Admin Navigation Update

**`src/pages/admin/AdminLayout.tsx`** — Add "Categories" nav item pointing to `/admin/categories`

**`src/App.tsx`** — Add route: `<Route path="categories" element={<AdminCategories />} />`

### 6. Storage Bucket Setup

**Database migration**: Create a `service-images` public storage bucket so admins can upload images directly for categories and services. Add RLS policy allowing authenticated admins to upload/delete, and public read access.

### Files to Create
- `src/pages/admin/AdminCategories.tsx`

### Files to Modify
- `src/pages/HomePage.tsx` — stagger animations on 3 sections
- `src/pages/admin/AdminServices.tsx` — add image_url, whats_included, sort_order fields
- `src/pages/admin/AdminLayout.tsx` — add Categories nav item
- `src/App.tsx` — add AdminCategories route

### Database Changes
- Create `service-images` storage bucket with public read + admin write policies

