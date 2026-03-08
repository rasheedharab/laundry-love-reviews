

## Plan: Premium HomePage Overhaul

### Problem
The HomePage service category cards use plain icon-based cards instead of the rich image cards already used in ServicesHub. The page also lacks content depth — no promotional banners, no membership teaser, no testimonials, no ritual preview, no referral CTA.

### Changes

**1. Service category cards with hero images**
- Import the same category hero images (`catPartyWear`, `catDryCleaning`, etc.) already used in `ServicesHub.tsx`
- Replace the icon-based grid with image cards matching the ServicesHub style: full-bleed photo, gradient overlay, title + tagline at bottom, hover zoom
- Show all 6 categories instead of slicing to 4

**2. Add new content sections below services (in order):**

- **Promotional Banner** — A full-width rounded card with a gradient background promoting "First Order 20% Off" or similar, linking to `/services`
- **7-Step Ritual Preview** — A horizontal scrollable row showing 3-4 ritual steps as compact cards with step numbers, linking to `/ritual`
- **Membership / Premium Club Teaser** — A dark gradient card with gold accents showing tier benefits, linking to `/membership`
- **Garment Care Tips** — 2-3 quick tip cards (e.g., "Storing Silk", "Leather Care 101") linking to the Garment Advisor chat
- **Referral CTA** — A card with "Invite Friends, Earn Rewards" messaging, linking to `/referral`
- **Trust / Social Proof Strip** — A row of stats like "10,000+ garments cared for", "4.9★ rating", "500+ happy clients"

**3. Visual polish**
- Keep the existing hero section, header, location selector, active order card, and chat FAB unchanged
- Move brand logo footer below all new sections
- Ensure all new sections use the same warm premium palette (cream, charcoal, burnt-orange, gold) and rounded-2xl cards

### Files Modified
- `src/pages/HomePage.tsx` — Full rewrite of the content below the hero section

