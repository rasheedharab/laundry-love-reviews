
## What needs to be built

**Three distinct work streams:**

### 1. Missing Laundry Services (data seeding)
The DB has 24 services across 6 categories but is missing the common everyday items Indian laundry apps (Laundrywala, Tumble Dry, UCare, Mr.Fresh) all carry. Need to add ~20 services:

**Dry Cleaning** (shirts, trousers, sarees cotton/silk, kurtas, sherwani, blazer, sweater, jeans, t-shirts, casual jacket)  
**Laundry** (per-kg wash, steam iron only, woollens wash, baby clothes, sports wear set, uniforms)

These are plain `INSERT` statements — no schema change needed.

---

### 2. Subscription Plans (new feature)
Indian laundry apps sell monthly/quarterly/yearly bundle plans (X kg/month, unlimited pickups, discounts on services). This is different from the existing "White Rabbit Club" membership tiers (Silver/Gold/Platinum). Two new tables needed:

```text
subscription_plans
  id, name, billing_cycle (monthly/quarterly/yearly),
  price, original_price, kg_limit, features (jsonb),
  is_popular, is_active, sort_order, created_at

user_subscriptions
  id, user_id, plan_id (→ subscription_plans),
  status (active/expired/cancelled),
  starts_at, ends_at, created_at
```

**Seed data — 3 plans:**
| Plan | Cycle | Price | Saves |
|---|---|---|---|
| Starter | Monthly | ₹799/mo | — |
| Premium | Quarterly | ₹1,999/qtr | ₹398 |
| Elite | Yearly | ₹5,999/yr | ₹3,589 |

---

### 3. Frontend Pages & Updates

**New: `src/pages/SubscriptionsPage.tsx`** — route `/subscriptions`
- 3 tab toggles: Monthly / Quarterly / Yearly
- Plan cards (features checklist, price, savings badge, CTA)
- Loads plans from DB, filters by selected billing_cycle
- "Subscribe Now" shows toast (demo) until payment is wired

**New: `src/pages/admin/AdminSubscriptionPlans.tsx`** — route `/admin/subscriptions`
- Same table + search + bulk action + CRUD dialog pattern as other admin pages

**`src/pages/HomePage.tsx`** — add a subscription teaser banner (between the Promo Banner and 7-Step Ritual sections)
- Card with "₹799/month · Unlimited Pickups" hook, links to `/subscriptions`

**`src/pages/ProfilePage.tsx`** — add active subscription section
- Fetch user's active subscription joined with plan name
- Show between the stats row and the loyalty widget: a compact "My Plan" card showing plan name + expiry
- If no subscription, show a "Get a plan" prompt linking to `/subscriptions`

**`src/App.tsx`** + **`src/pages/admin/AdminLayout.tsx`**
- Add `/subscriptions` user route
- Add admin nav entry + route for subscription plans management

---

### Execution order
1. Run DB migration (new tables + RLS policies)
2. Insert missing services (dry cleaning + laundry items)
3. Insert 3 subscription plan rows
4. Build `SubscriptionsPage.tsx`
5. Build `AdminSubscriptionPlans.tsx`
6. Update `App.tsx` routes
7. Update `AdminLayout.tsx` nav
8. Update `HomePage.tsx` banner
9. Update `ProfilePage.tsx` subscription section
