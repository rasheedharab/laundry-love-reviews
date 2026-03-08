

## Problem

The onboarding flow ends by navigating to `/login`, and the root redirect sends new users to `/onboarding` first. After onboarding, users are funneled to login/signup before they can browse. Public pages like home, services, categories, service details, blog, cart, etc. are already unprotected in the router — the only barrier is the navigation flow.

## Plan

**Two small changes:**

### 1. `src/pages/Onboarding.tsx` — Navigate to `/home` instead of `/login`
Change the "Get Started" button destination from `/login` to `/home` so users land on the app after onboarding without being forced to sign up.

### 2. `src/App.tsx` — Root redirect goes to `/home` after onboarding
Update `RootRedirect` to send onboarded users to `/home` (already does this) — no change needed here. But also ensure the root `/` sends non-onboarded users to `/onboarding` which then goes to `/home`. This is already correct.

**That's it.** The only actual code change is one line in `Onboarding.tsx`: change `navigate("/login")` to `navigate("/home")`. The profile page already gracefully handles unauthenticated users with a "Sign In" prompt. All transactional pages (checkout, orders, addresses, etc.) are already behind `ProtectedRoute`.

