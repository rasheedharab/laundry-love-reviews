import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "@/components/SplashScreen";
import InAppNotificationListener from "@/components/InAppNotificationListener";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
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
import BlogPage from "@/pages/BlogPage";
import MyComplaintsPage from "@/pages/MyComplaintsPage";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminServices from "@/pages/admin/AdminServices";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminPromos from "@/pages/admin/AdminPromos";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminOutlets from "@/pages/admin/AdminOutlets";
import AdminComplaints from "@/pages/admin/AdminComplaints";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminUsers from "@/pages/admin/AdminUsers";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function RootRedirect() {
  const onboarded = localStorage.getItem("wr_onboarded");
  return <Navigate to={onboarded ? "/home" : "/onboarding"} replace />;
}

function AppShell() {
  const { loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <>
      <Toaster />
      <Sonner />
      <InAppNotificationListener />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/services" element={<ServicesHub />} />
            <Route path="/services/:slug" element={<CategoryPage />} />
            <Route path="/service/:slug" element={<ServiceDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/ritual" element={<RitualPage />} />
            <Route path="/select-outlet" element={<SelectOutlet />} />
            <Route path="/saved-addresses" element={<ProtectedRoute><SavedAddresses /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/my-complaints" element={<ProtectedRoute><MyComplaintsPage /></ProtectedRoute>} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="outlets" element={<AdminOutlets />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="promos" element={<AdminPromos />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="/garment-advisor" element={<GarmentAdvisor />} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/track-order/:id" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
          <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <AppShell />
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
