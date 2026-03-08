

## UX Polish & Backend Robustness Plan

### 1. Framer Motion Page Transitions

Create an `AnimatedPage` wrapper component using `framer-motion`'s `motion.div` with fade+slide-up on mount/unmount. Wrap every page's root `<div>` with it. Add `AnimatePresence` in `AppLayout.tsx` around `<Outlet />` keyed by `location.pathname`.

**Files:** `src/components/AnimatedPage.tsx` (new), `src/components/AppLayout.tsx`, all page files (wrap content).

### 2. Card Entrance Animations

Create a `StaggerContainer` + `StaggerItem` pair using `framer-motion` variants with staggerChildren. Apply to:
- HomePage services grid
- ServicesHub category list
- OrdersPage order cards
- ProfilePage menu items
- CategoryPage service list

**File:** `src/components/StaggerAnimation.tsx` (new), updates to the 5 pages above.

### 3. Cart Badge Bounce

Add a `bounce` keyframe to `tailwind.config.ts`. Apply `animate-bounce-once` class to the cart badge in `BottomNav.tsx` when `itemCount` changes (use a key or useEffect trigger).

**Files:** `tailwind.config.ts`, `src/components/BottomNav.tsx`.

### 4. Empty State Illustrations

Create an `EmptyState` component with inline SVG illustrations (different variants: cart, orders, addresses). Replace plain text empty states in:
- `Cart.tsx` — empty bag illustration
- `OrdersPage.tsx` — no orders illustration  
- `SavedAddresses.tsx` — no addresses illustration

**File:** `src/components/EmptyState.tsx` (new), updates to 3 pages.

### 5. Pull-to-Refresh

Create a `PullToRefresh` wrapper component using touch events (`touchstart`, `touchmove`, `touchend`) with a spinner indicator. Apply to `HomePage` and `OrdersPage` to re-fetch data on pull.

**File:** `src/components/PullToRefresh.tsx` (new), updates to `HomePage.tsx` and `OrdersPage.tsx`.

### 6. Backend Robustness

**Database improvements** (migration):
- Add `service_level` column (`text DEFAULT 'regular'`) to `orders` table — currently the express/regular toggle in Checkout isn't persisted
- Add `payment_status` column (`text DEFAULT 'pending'`) to `orders` — track payment state separately from order status
- Add `payment_method` column (`text`) to `orders` — store which payment method was used
- Create `profiles` trigger to auto-update `updated_at` — already exists, verify

**Frontend-backend wiring fixes:**
- **Checkout.tsx**: Persist `serviceLevel` to the new `service_level` column when creating order
- **HomePage.tsx**: Replace mock "No active orders" banner with real query for active orders from DB, show latest active order with link to track
- **OrderConfirmation.tsx**: Add skeleton loading state instead of plain "Loading..."
- **ProfilePage.tsx**: Show real order count in "Order History" menu item
- **Cart.tsx**: Persist cart to `localStorage` so it survives page refreshes (update `CartContext`)

**RLS review**: All existing policies are correct — users can only access their own data. No changes needed.

### Implementation Order
1. Create `AnimatedPage`, `StaggerAnimation`, `EmptyState`, `PullToRefresh` components
2. Run database migration for `service_level`, `payment_status`, `payment_method` columns
3. Update `tailwind.config.ts` with bounce keyframe
4. Update `CartContext` with localStorage persistence
5. Update `AppLayout` + `BottomNav` for transitions and badge bounce
6. Update all pages: wrap with `AnimatedPage`, add stagger animations, empty states, pull-to-refresh, and backend wiring fixes
7. Fix `HomePage` active order banner to query real data
8. Fix `Checkout` to persist service level

