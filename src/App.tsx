import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AppLayout from "@/components/AppLayout";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import HomePage from "@/pages/HomePage";
import ServicesHub from "@/pages/ServicesHub";
import CategoryPage from "@/pages/CategoryPage";
import ServiceDetail from "@/pages/ServiceDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import PaymentPage from "@/pages/PaymentPage";
import OrderConfirmation from "@/pages/OrderConfirmation";
import OrdersPage from "@/pages/OrdersPage";
import TrackOrder from "@/pages/TrackOrder";
import ProfilePage from "@/pages/ProfilePage";
import MembershipPage from "@/pages/MembershipPage";
import RitualPage from "@/pages/RitualPage";
import SelectOutlet from "@/pages/SelectOutlet";
import GarmentAdvisor from "@/pages/GarmentAdvisor";
import SavedAddresses from "@/pages/SavedAddresses";
import EditProfile from "@/pages/EditProfile";
import NotificationsPage from "@/pages/NotificationsPage";
import ReferralPage from "@/pages/ReferralPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const onboarded = localStorage.getItem("wr_onboarded");
  return <Navigate to={onboarded ? "/home" : "/onboarding"} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/services" element={<ServicesHub />} />
                <Route path="/services/:slug" element={<CategoryPage />} />
                <Route path="/service/:slug" element={<ServiceDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/membership" element={<MembershipPage />} />
                <Route path="/ritual" element={<RitualPage />} />
                <Route path="/select-outlet" element={<SelectOutlet />} />
                <Route path="/saved-addresses" element={<SavedAddresses />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/referral" element={<ReferralPage />} />
              </Route>
              <Route path="/garment-advisor" element={<GarmentAdvisor />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/track-order/:id" element={<TrackOrder />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
