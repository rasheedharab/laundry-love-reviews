

## Plan: Add Glassmorphism Design System

### Approach
Introduce reusable glassmorphism utility classes in `index.css` and apply them across key UI surfaces — cards, nav bars, modals, and interactive elements — to create a frosted-glass premium aesthetic while keeping the existing warm palette intact.

### Changes

**1. `src/index.css` — Add glass utility classes**
- `.glass` — Base: `backdrop-blur-xl`, semi-transparent `bg-card/60`, subtle `border border-white/15`, soft `shadow-lg`
- `.glass-sm` — Lighter blur for smaller elements (pills, badges)
- `.glass-dark` — Dark variant for overlays on images (hero text area, category card labels)
- `.glass-accent` — Accent-tinted glass for CTAs and promotional cards

**2. `src/pages/HomePage.tsx` — Apply glass to major surfaces**
- Header location pill & profile button → `glass` with transparent bg
- Hero text overlay area → `glass-dark` with rounded corners replacing the solid gradient
- Active order card → `glass-dark`
- Ritual step cards → `glass`
- Care tip cards → `glass`
- Trust strip → `glass`
- Chat FAB → glass ring effect
- Promo banner → `glass-accent` overlay
- Membership teaser → `glass-dark`
- Referral card → `glass`

**3. `src/components/BottomNav.tsx` — Glassmorphic nav bar**
- Replace `bg-card/95 backdrop-blur-md` with stronger `glass` treatment: `bg-card/40 backdrop-blur-2xl border-t border-white/10`

**4. `src/pages/Cart.tsx` — Glass cart item cards**
- Cart item cards and sticky checkout bar → `glass` class

**5. `src/pages/ProfilePage.tsx` — Glass menu cards**
- Premium Club banner and menu items → `glass` / `glass-dark`

**6. `src/pages/ServiceDetail.tsx` — Glass tier selector and sticky CTA**
- Tier selection cards and bottom "Add to Bag" bar → `glass` treatment

**7. `src/pages/Checkout.tsx` — Glass section cards**
- Schedule, address, and summary cards → `glass`

### Technical Notes
- All glass classes use CSS custom properties so they adapt to light/dark themes automatically
- `backdrop-blur` is GPU-accelerated and well-supported on modern mobile browsers
- Semi-transparent borders use `white/15` in light mode and `white/10` in dark mode via the `.dark` selector
- Existing `rounded-2xl` and color tokens stay unchanged — glass is additive

