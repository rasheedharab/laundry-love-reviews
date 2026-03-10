

## Plan

### 1. Floating Cart Button (Global Access)

Add a floating cart FAB (Floating Action Button) visible on all pages when cart has items:

- Create a new `FloatingCartButton` component that shows a shopping bag icon with item count badge
- Position it fixed at bottom-right (above the bottom nav, left of the chat FAB on home)
- Animate in/out based on `itemCount > 0` using framer-motion
- Tapping it navigates to `/cart`
- Render it in `AppLayout.tsx` so it appears on all pages with the bottom nav

### 2. Subscription Plans Section on Home Page

Add a subscription showcase section between the "Premium Club" teaser and "Care Tips" section (~line 431 in HomePage.tsx):

- Fetch `subscription_plans` (active, ordered by `sort_order`)
- Show 3 cycle tabs (Monthly / Quarterly / Yearly) styled like pill toggles
- Display plan cards in a horizontal scrollable row with:
  - Plan name, price, original price (strikethrough), savings badge
  - Key features (first 3)
  - "Subscribe" CTA button
- Tapping a card navigates to `/subscriptions`
- Use `ScrollReveal` wrapper consistent with rest of homepage
- Use glass card styling matching the existing design language

### 3. Subscription Plans Section on Services Page

Add a similar but more compact subscription banner at the bottom of `ServicesHub.tsx` (before the Ritual link):

- Reuse the same data fetch pattern
- Show a promotional card with cycle tabs and top 1-2 plans
- "View All Plans" link to `/subscriptions`

### 4. Shared Component

Extract a `SubscriptionShowcase` component used by both pages to avoid duplication:

- Props: `compact?: boolean` (services page uses compact mode)
- Handles its own data fetching from `subscription_plans`
- Cycle toggle + plan cards + CTA

### Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/FloatingCartButton.tsx` | New — floating cart FAB |
| `src/components/AppLayout.tsx` | Add `FloatingCartButton` |
| `src/components/SubscriptionShowcase.tsx` | New — reusable subscription plans section |
| `src/pages/HomePage.tsx` | Import and render `SubscriptionShowcase` after Premium Club section |
| `src/pages/ServicesHub.tsx` | Import and render `SubscriptionShowcase compact` before Ritual link |

