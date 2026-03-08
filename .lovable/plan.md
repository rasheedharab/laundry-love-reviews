

## Audit & Enhancement Plan — White Rabbit Premium Laundry PWA

### Screen Audit (10 Reference Images)

All 10 reference screens are implemented:

| # | Screen | File | Status |
|---|--------|------|--------|
| 1 | Category Page (hero + service list + bottom CTA) | CategoryPage.tsx | Done |
| 2 | Home Page (greeting, hero, services grid) | HomePage.tsx | Done |
| 3 | Select Outlet (search, map, boutique list) | SelectOutlet.tsx | Done |
| 4 | Services Hub (category list + ritual link) | ServicesHub.tsx | Done |
| 5 | Profile (avatar, premium club card, menu) | ProfilePage.tsx | Done |
| 6 | 7-Step Ritual (numbered steps overlay) | RitualPage.tsx | Done |
| 7 | Payment (dark theme, saved cards, UPI) | PaymentPage.tsx | Done |
| 8 | Orders (active cards + history rows) | OrdersPage.tsx | Done |
| 9 | Schedule Pickup / Checkout (date/time/level) | Checkout.tsx | Done |
| 10 | Membership (tier cards, club benefits) | MembershipPage.tsx | Done |

Additional screens also implemented: Onboarding, Login, Signup, Cart, ServiceDetail, TrackOrder, OrderConfirmation.

**Note:** You shared 10 reference images (not 20). All 10 are accounted for.

---

### Comprehensive Feature & Enhancement Plan

#### A. AI-Powered Features (using Lovable AI)

1. **AI Garment Care Advisor** — Chat assistant via edge function that recommends care treatments based on garment type, fabric, and stain description. Accessible from Home and ServiceDetail pages.

2. **AI Smart Reorder** — Analyze past orders and suggest recurring services ("You usually clean your suits monthly — schedule next pickup?").

3. **AI Stain Identification** — User uploads a photo of a stain; AI identifies stain type and recommends the right service/treatment tier.

#### B. Engagement & Retention Features

4. **Push Notifications** — Web push via service worker for order status updates, promotions, and pickup reminders.

5. **Loyalty Points System** — Earn points per order, redeem for discounts. New DB table `loyalty_points` with transaction log. Display points on Profile and Home.

6. **Referral Program** — Generate unique referral codes, track signups, reward both referrer and referee. Wire up the existing "Refer a Friend" menu item.

7. **Ratings & Reviews** — Post-delivery review flow with star rating + text. Display on ServiceDetail pages.

8. **Favorites / Wishlist** — Save frequently used services for quick reorder.

9. **In-App Notifications Center** — Bell icon on Home leading to a notifications page (order updates, promos, membership alerts).

#### C. Workflow & Functionality Gaps

10. **Saved Addresses CRUD** — Wire up the "Saved Addresses" profile menu item with add/edit/delete/set-default UI (DB table already exists).

11. **Payment Methods Management** — Wire up "Payment Methods" profile menu to add/remove cards (currently static mock data on PaymentPage).

12. **Promo Code Application** — Add promo code input on Checkout page that validates against `promo_codes` table and applies discount.

13. **Order Reorder** — "Reorder" button on completed orders that pre-fills the cart.

14. **Real-time Order Tracking** — Enable Supabase Realtime on `orders` table so TrackOrder auto-updates status without refresh.

15. **Profile Editing** — Allow users to update name, phone, avatar from Profile page.

16. **Email Verification Flow** — Post-signup verification banner on Home if email unverified.

#### D. Premium Quality & UX Polish

17. **Skeleton Loading States** — Replace "Loading..." text with shimmer skeletons on all data-fetching pages.

18. **Pull-to-Refresh** — Add pull-to-refresh gesture on Home and Orders pages.

19. **Haptic Feedback** — Vibration API on key interactions (add to bag, confirm pickup).

20. **Micro-animations** — Framer Motion page transitions, card entrance animations, cart badge bounce.

21. **Empty State Illustrations** — Custom SVG illustrations for empty cart, no orders, etc.

22. **Dark Mode Toggle** — Leverage existing dark theme CSS variables with a toggle in Profile/Settings.

23. **Multi-language Support (i18n)** — Start with English + Hindi for the Indian market.

#### E. Integrations

24. **Stripe Payments** — Replace mock payment flow with real Stripe checkout for card payments.

25. **Google Maps** — Real map on SelectOutlet and TrackOrder pages via Maps embed.

26. **WhatsApp Support** — Deep link from "Support & Concierge" menu item to WhatsApp business number.

27. **Calendar Integration** — Add pickup to device calendar via `.ics` download after booking.

#### F. Business Features

28. **Admin Dashboard** — Separate admin route for order management, service CRUD, promo code management (with proper role-based access using `user_roles` table).

29. **Analytics Events** — Track key user actions (service views, add-to-bag, checkout completion) for business insights.

30. **Seasonal Promotions Banner** — Dynamic promotional banners on Home page driven by a `promotions` DB table.

---

### Recommended Implementation Priority

**Phase 1 (High Impact):**
- AI Garment Care Advisor chatbot
- Saved Addresses CRUD
- Profile editing
- Promo code application on checkout
- Skeleton loading states
- Real-time order tracking
- Stripe payments integration

**Phase 2 (Engagement):**
- Loyalty points system
- Ratings & reviews
- Push notifications
- Referral program
- In-app notifications center

**Phase 3 (Polish & Scale):**
- AI stain identification (photo upload)
- Dark mode toggle
- Admin dashboard
- Google Maps integration
- Multi-language support

