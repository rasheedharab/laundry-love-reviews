

## Plan: Premium Service Cards on Category Pages

### Problem
All services in the database have `null` for `image_url`. The current card design uses a small 80×80 thumbnail that falls back to a plain "✦" symbol, making the service list look empty and unfinished.

### Approach
Since there are no per-service images in the database, we'll redesign the service cards to be visually rich without relying on individual photos — using the **category hero image as a shared backdrop** with per-card gradient tints, better typography, and glass effects from the existing design system.

### Changes

**`src/pages/CategoryPage.tsx` — Redesign service list cards**

Replace the current horizontal row layout (tiny thumbnail + text) with taller, visually striking cards:

- **Card layout**: Full-width cards (~140px tall) with the category hero image as a subtle, blurred background per card, overlaid with a gradient and glass effect
- **Visual hierarchy**: Service name in display font, badge (if present) as a pill, price prominently shown, turnaround time as a secondary detail
- **Quick-add button**: Accent-colored circular button with glass treatment, positioned bottom-right
- **Alternating accent**: Odd/even cards get slightly different gradient directions (left-to-right vs right-to-left) for visual variety
- **Fallback design**: Uses the category hero image (`heroImages[slug]`) as the card background — every card gets rich imagery from the category asset, no blank thumbnails

### Files Modified
- `src/pages/CategoryPage.tsx` — Service card redesign only (hero section and header remain unchanged)

