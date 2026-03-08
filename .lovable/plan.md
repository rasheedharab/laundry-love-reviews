

# Design System Overhaul — Milanese Minimal Premium Feel

Based on the uploaded style guide image, I'll audit and align the entire app's design system to match the **Cream White / Deep Espresso / Burnt Ochre (#C2570A)** palette with proper contrasts, premium glassmorphism, refined iconography, and optimized brand logo sizing.

## Current State Assessment

- **Colors**: Already close — CSS variables use burnt-orange/cream/charcoal. But the accent HSL `25 80% 52%` maps to ~#E87820 (more orange), not the specified **#C2570A** (deeper, richer burnt ochre).
- **Fonts**: Playfair Display + DM Sans — matches the style guide. Good.
- **Glassmorphism**: Already implemented via `.glass` utilities. Needs contrast refinement for readability.
- **Icons**: Currently using generic Lucide icons (emojis for ritual steps, care tips). Need premium SVG iconography.
- **Logo sizing**: `h-12` in footer, `h-16` in profile guest view, `h-20` in splash — some too small.

## Plan

### 1. Correct the Burnt Ochre accent color

Update `src/index.css` CSS variables to shift accent from the current orangey hue to the true **#C2570A** (HSL ~`18 82% 40%`):

- `--burnt-orange: 18 82% 40%` (was `25 80% 52%`)
- `--burnt-orange-dark: 18 70% 34%` (was `25 60% 44%`)
- Update `--accent`, `--primary`, and `--ring` to use matching values
- Dark mode: adjust accordingly for proper contrast on dark surfaces

### 2. Improve contrast and glass readability

- Ensure glass-dark overlays have sufficient text contrast (currently `text-primary-foreground` on semi-transparent dark — verify)
- Increase glass border opacity slightly for better definition
- Ensure muted-foreground text meets WCAG AA on both light and dark glass surfaces

### 3. Replace emoji icons with premium Lucide icons on HomePage

Replace all emoji-based icons with curated Lucide icons:

- **Ritual steps**: `🔍`→`Search`, `✨`→`Sparkles`, `🌿`→`Leaf`, `☁️`→`Cloud`, `👔`→`Shirt`, `✓`→`ShieldCheck`, `🎁`→`Package`
- **Care tips**: `🧵`→`Scissors`, `👜`→`Briefcase`, `🧶`→`Wind`
- Style these icons with accent color in rounded containers for a polished look

### 4. Optimize brand logo sizes

- **Splash screen**: Increase from `h-20` to `h-28` for stronger brand presence
- **Footer/brand mark** (HomePage bottom): Increase from `h-12` to `h-16`
- **Profile guest state**: Keep `h-16` (already reasonable)
- **Login page logo**: Verify and ensure at least `h-14`
- **Onboarding**: Ensure brand text/logo is prominent

### 5. Refine button styling to match style guide

The style guide shows full-width rounded buttons with clear hierarchy:
- **Primary**: Full-width, rounded-full, burnt ochre bg, white text
- **Secondary**: Full-width, rounded-full, outline with border

Ensure `Button` default and the key CTAs (Book Now, Sign In, etc.) match this pattern consistently.

### 6. Files to modify

| File | Changes |
|------|---------|
| `src/index.css` | Update accent/primary HSL values to match #C2570A, refine glass opacity values |
| `src/pages/HomePage.tsx` | Replace emoji icons with Lucide icons, increase footer logo size |
| `src/components/SplashScreen.tsx` | Increase logo from h-20 to h-28 |
| `src/pages/ProfilePage.tsx` | Minor contrast/icon refinements |
| `src/pages/Login.tsx` | Verify logo size is adequate |
| `src/components/BottomNav.tsx` | Ensure icon stroke weights feel premium |

### 7. Color mapping (light mode)

```text
Current → Target
--primary:    25 60% 44%  →  18 82% 40%   (#C2570A)
--accent:     25 80% 52%  →  18 82% 40%   (#C2570A)
--ring:       25 60% 44%  →  18 82% 40%
--burnt-orange: 25 80% 52% → 18 82% 40%
--burnt-orange-dark: 25 60% 44% → 18 70% 34%
```

This is a visual-only change — no database or backend modifications needed.

