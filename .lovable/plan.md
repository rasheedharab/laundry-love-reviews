

## White Rabbit — Premium Laundry Service PWA

### Phase 1: Foundation & PWA Setup
- Configure PWA with vite-plugin-pwa (manifest, icons, offline support, install prompt)
- Set up mobile-first layout with bottom tab navigation (Home, Services, Orders, Profile)
- Design system: warm earth tones (cream, burnt orange, dark brown/charcoal), premium typography
- Connect Supabase backend (Lovable Cloud)

### Phase 2: Onboarding & Auth
- Splash/onboarding carousel (3 slides with brand imagery and taglines like "Expertise in Every Thread")
- Sign up / Login screens (email + password, optional phone)
- User profiles table with name, phone, saved addresses

### Phase 3: Home Screen
- Location selector dropdown at top
- Hero section: "Expert care for your wardrobe" with Book Now CTA
- Active order banner (shows current order status with pickup time)
- Services grid (Laundry, Dry Cleaning, Premium Wear, Shoe Care) with icons
- Brand logo at bottom

### Phase 4: Services Pages
- **Services hub** — category grid/list view
- **Category pages** — each with hero banner + service list:
  - Party & Occasion Wear (Wedding Lehengas, Tuxedos, Designer Gowns, Ethnic Sets)
  - Dry Cleaning (Overcoats, Silk Blouses, Suit Trousers, Evening Wear)
  - Leather Care (Jackets, Designer Bags, Heritage Belts, Custom Orders)
  - Carpets & Rugs (Deep Shampooing, Silk Rug Care, Wool Carpet, Fringe Restoration)
  - Sofa Care (Fabric Deep Clean, Leather Conditioning, Ottoman, Dining Chair)
- Each service shows image, name, badge (e.g., "SPECIAL HANDLING"), and price

### Phase 5: Service Detail & Cart
- Service detail page with image carousel, description, tier selection (Standard vs Express with different prices/timelines)
- "What's Included" checklist
- Add to Bag button with price
- Shopping bag/cart with item management

### Phase 6: Booking & Checkout
- Review Order screen: service summary, scheduled pickup slot selector, pickup location (saved addresses with edit), promo code input
- Pay button → Order confirmation screen with order ID, status badge, pickup details
- Track Order and View Details CTAs

### Phase 7: Orders & Profile
- Orders tab: list of past and active orders with status tracking
- Profile tab: user info, saved addresses, order history, settings

### Database Schema (Supabase)
- **profiles** — user details, phone, default address
- **addresses** — saved pickup/delivery locations per user
- **service_categories** — Dry Cleaning, Leather Care, etc.
- **services** — individual services with pricing tiers, images, descriptions
- **orders** — order records with status, scheduled slot, address, promo code
- **order_items** — items within each order
- **promo_codes** — discount codes

