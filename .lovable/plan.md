

## Plan: Admin Management Modules

This is a large feature set requiring new database tables, RLS policies, and 5 new admin pages plus enhancements to existing ones.

### Database Changes (Migration)

**New tables:**

1. **`outlets`** — id, name, slug, address_line, city, postal_code, phone, email, lat, lng, is_active, operating_hours (jsonb), created_at
2. **`complaints`** — id, user_id, order_id (nullable), subject, description, status (enum: open/in-progress/resolved/closed), priority (enum: low/medium/high/urgent), admin_notes, resolved_at, created_at, updated_at
3. **`blog_posts`** — id, title, slug, content (text/markdown), excerpt, cover_image_url, author_id, status (draft/published/archived), published_at, created_at, updated_at

**RLS policies for all new tables:**
- Public read for outlets (where is_active=true) and published blog posts
- Admin full CRUD on all three tables
- Users can insert/view own complaints
- Enable realtime on complaints for live status updates

**Add `outlet_id` column to `orders`** table (nullable FK to outlets) for outlet assignment.

### New Admin Pages

1. **`AdminCustomers.tsx`** — List all profiles with user details (name, phone, email from auth metadata, join date, order count). Search/filter. View customer order history in expandable row.

2. **`AdminOrdersEnhanced`** — Enhance existing AdminOrders with: order items detail view (expandable), customer info, outlet assignment dropdown, payment status management, notes field.

3. **`AdminOutlets.tsx`** — Full CRUD for outlets table. Fields: name, address, city, phone, operating hours, active toggle. Table list with edit/delete.

4. **`AdminComplaints.tsx`** — List complaints with status/priority filters. Update status, add admin notes. Link to related order. Color-coded priority badges.

5. **`AdminBlog.tsx`** — CRUD for blog posts. Markdown editor (textarea), cover image upload to service-images bucket, status toggle (draft/published), slug auto-generation.

6. **`AdminUsers.tsx`** — List all users with their roles. Assign/remove roles (admin/moderator/user) via dropdown. Shows email, name, current roles. Cannot remove own admin role (safety).

### Navigation Update

**`AdminLayout.tsx`** — Add nav items:
- Customers (Users icon)
- Outlets (MapPin icon) 
- Complaints (MessageSquare icon)
- Blog (FileText icon)
- Users & Roles (Shield icon)

### Routing Update

**`App.tsx`** — Add routes under `/admin`:
- `/admin/customers`
- `/admin/outlets`
- `/admin/complaints`
- `/admin/blog`
- `/admin/users`

### Files to Create
- `src/pages/admin/AdminCustomers.tsx`
- `src/pages/admin/AdminOutlets.tsx`
- `src/pages/admin/AdminComplaints.tsx`
- `src/pages/admin/AdminBlog.tsx`
- `src/pages/admin/AdminUsers.tsx`

### Files to Modify
- `src/App.tsx` — add 5 new routes + lazy imports
- `src/pages/admin/AdminLayout.tsx` — add 5 nav items
- `src/pages/admin/AdminOrders.tsx` — enhance with order detail, outlet assignment, customer info

### Database Migration
- Create `outlets`, `complaints`, `blog_posts` tables with RLS
- Add `outlet_id` FK to `orders`
- Create complaint status/priority types or use text with validation triggers

