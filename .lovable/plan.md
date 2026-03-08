

## UI Redesign Plan — Matching Reference Designs

Based on the 10 uploaded reference images, here's the plan to redesign each screen to match the premium Milanese Minimal aesthetic.

### Design System Refinements (from 3a.png)
- Ensure Burnt Ochre `#C2570A` is the primary accent
- Uppercase letter-spaced section labels (e.g., "ATELIER SERVICES", "AVAILABLE BOUTIQUES")
- Rounded pill icons for service categories (Wash, Press, Fold style)
- Cream white backgrounds with soft card borders

### Screen-by-Screen Changes

**1. Category Page** (from 1a.png — CategoryPage.tsx)
- Full-height hero image card with gradient overlay, category title at bottom
- Subtitle label "ATELIER SERVICES / Select Treatment"
- Service list: icon in rounded square, name + description + orange price ("from ₹499")
- Bottom CTA bar: "ARRANGE COLLECTION" dark button

**2. Orders Page** (from 8aa.png — OrdersPage.tsx)
- Split into "ACTIVE" and "HISTORY" sections with divider labels
- Active orders: large card with order ref (#WR-XXXX), status dot + label, date, total amount, "Track Status" dark button + receipt icon
- History: compact rows with checkmark, DONE badge, date, items count, amount

**3. Order Tracking Page** (new — TrackOrder.tsx, route `/track-order/:id`)
- Header: "TRACK ORDER" with back arrow + notification bell
- Static map placeholder image with "EN ROUTE" badge
- Order reference + arrival time
- Vertical timeline: Order Placed, Pickup Scheduled, In Cleaning (active/orange), Quality Check, Out for Delivery (pending/gray)
- Valet card at bottom with avatar + name + call button

**4. Schedule Pickup / Checkout** (from 9aa.png — Checkout.tsx)
- Rename to "SCHEDULE PICKUP"
- Service level toggle: Regular (filled dark) / Express with PRIORITY badge
- Horizontal scrollable date picker (MON 16, TUE 17, etc.)
- Time window radio buttons (08:00 AM - 10:00 AM, etc.)
- Location card with processing atelier + est. return date
- "CONFIRM PICKUP →" dark CTA button

**5. Payment Page** (from 7aa.png — new PaymentPage.tsx)
- Dark theme background
- Service order summary card (name + item count + delivery estimate)
- Saved cards section with card type icon, masked number, expiry, radio select
- "ADD NEW" link
- UPI & Wallets section
- Fixed bottom: "TOTAL TO PAY ₹X,XXX" + "Pay Now →" white button

**6. Profile Page** (from 5aa.png — ProfilePage.tsx)
- Settings gear icon top-right
- Centered avatar circle with image
- Name + location below avatar
- Premium Club card: orange gradient with "WHITE RABBIT / PREMIUM CLUB" + masked number + ACTIVE badge
- Menu items: Saved Addresses, Payment Methods, Order History, Refer a Friend, Support & Concierge — each in rounded card with icon + chevron

**7. 7-Step Ritual Page** (from 6aa.png — new RitualPage.tsx)
- Fullscreen overlay with X close button
- "7-Step Ritual" header
- Numbered steps with colored icon, title, description, and generated placeholder image
- Steps: Inspection, Manual Spotting, Eco-Wash, Gentle Drying, Hand-Finishing, Quality Check, Premium Packaging

**8. Membership / White Rabbit Club** (from 10aa.png — new MembershipPage.tsx)
- Premium gradient card header
- Three tier cards: Silver ($29), Gold ($59 — "Most Popular"), Platinum ($99)
- Each with checkmark features + "Select [Tier]" button
- "The Club Ritual" section with benefits
- "Join the Club" orange full-width CTA

**9. Select Outlet Page** (from 3aa.png — new SelectOutlet.tsx)
- "SELECT OUTLET" header with back arrow
- Search bar with location arrow icon
- Map placeholder area
- Bottom sheet: "AVAILABLE BOUTIQUES" + count + FILTER link
- Boutique cards with name, address, distance (orange), open hours, SELECT button

### New Routes
- `/track-order/:id` — TrackOrder
- `/payment` — PaymentPage (after Schedule Pickup)
- `/ritual` — RitualPage (linked from Home or Service Detail)
- `/membership` — MembershipPage (linked from Profile)
- `/select-outlet` — SelectOutlet (linked from Checkout flow)

### Implementation Order
1. Update existing pages (Profile, Orders, Category, Checkout) to match designs
2. Create new pages (TrackOrder, PaymentPage, RitualPage, MembershipPage, SelectOutlet)
3. Update routing in App.tsx
4. Add uppercase label utility class for section headers

