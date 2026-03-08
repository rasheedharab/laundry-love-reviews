

## Plan: Persist All Hardcoded Frontend Data to Backend

### What's Already in the Database
- Service categories (6), services (24), blog posts (5), promo codes (2) — all good.

### What's Hardcoded and Needs Backend Tables + Data

**1. Outlets** — `outlets` table exists but is empty. Insert the 3 boutiques from `SelectOutlet.tsx`, then update the page to fetch from the database.

**2. FAQs** — No table exists. Create a `faqs` table and insert the 8 FAQ items from `SupportPage.tsx`, then update the page to fetch dynamically.

**3. Membership Tiers** — No table exists. Create a `membership_tiers` table and insert the 3 tiers from `MembershipPage.tsx`, then update the page to fetch dynamically.

---

### Database Changes

**Migration 1 — Create `faqs` table:**
```sql
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active faqs" ON public.faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

**Migration 2 — Create `membership_tiers` table:**
```sql
CREATE TABLE public.membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price text NOT NULL,
  period text DEFAULT '/mo',
  icon text DEFAULT 'star',
  features jsonb DEFAULT '[]',
  is_popular boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active tiers" ON public.membership_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tiers" ON public.membership_tiers FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
```

**Data Inserts:**
- 3 outlets into `outlets` (with name, slug, address, city, postal_code, phone, operating_hours)
- 8 FAQs into `faqs`
- 3 membership tiers into `membership_tiers`

### Frontend Changes (no visual changes, just data source)

1. **`SelectOutlet.tsx`** — Remove hardcoded `boutiques` array. Fetch from `outlets` table. Show loading skeleton while fetching.

2. **`SupportPage.tsx`** — Remove hardcoded `faqs` array. Fetch from `faqs` table ordered by `sort_order`. Show skeleton while loading.

3. **`MembershipPage.tsx`** — Remove hardcoded `tiers` array. Fetch from `membership_tiers` table ordered by `sort_order`. Map icon string to Lucide component. Show skeleton while loading.

All pages will render identically to current state but will be admin-editable from the backend going forward.

