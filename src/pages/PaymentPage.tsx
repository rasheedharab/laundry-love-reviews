import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnimatedPage from "@/components/AnimatedPage";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total } = (location.state as { orderId?: string; total?: number }) || {};
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRazorpayPayment = async () => {
    if (!orderId || !total) {
      toast.error("Order details missing");
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order via edge function
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          amount: total,
          currency: "INR",
          receipt: `order_${orderId}`,
          notes: { order_id: orderId },
        },
      });

      if (error) throw error;

      // Check if in demo mode (keys not configured)
      if (data.demo_mode) {
        setDemoMode(true);
        toast.info("Payment gateway in demo mode. Simulating successful payment.");
        // Simulate successful payment in demo mode
        setTimeout(() => {
          navigate(`/order-confirmation/${orderId}`);
        }, 1500);
        return;
      }

      if (!razorpayLoaded || !window.Razorpay) {
        toast.error("Payment gateway not loaded. Please try again.");
        setLoading(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "White Rabbit",
        description: "Premium Garment Care",
        order_id: data.order_id,
        handler: async function (response: any) {
          // Verify payment on backend
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
            "verify-razorpay-payment",
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
              },
            }
          );

          if (verifyError || !verifyData?.verified) {
            toast.error("Payment verification failed");
            setLoading(false);
            return;
          }

          toast.success("Payment successful!");
          navigate(`/order-confirmation/${orderId}`);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#c46a32", // accent color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        toast.error(response.error.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const handleDemoPay = () => {
    setLoading(true);
    toast.info("Demo mode: Simulating payment...");
    setTimeout(() => {
      if (orderId) {
        navigate(`/order-confirmation/${orderId}`);
      } else {
        navigate("/orders");
      }
    }, 1500);
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen flex flex-col" style={{ background: "hsl(25 20% 10%)", color: "hsl(35 20% 92%)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "hsl(25 15% 18%)" }}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold uppercase tracking-[0.15em]">Payment</h1>
        </div>

        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="mx-5 mb-4 flex items-center gap-3 rounded-xl p-3" style={{ background: "hsl(40 70% 50% / 0.15)" }}>
            <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "hsl(40 70% 55%)" }} />
            <p className="text-xs" style={{ color: "hsl(40 70% 55%)" }}>
              Demo mode active. Payment gateway keys will be configured before launch.
            </p>
          </div>
        )}

        {/* Order Summary Card */}
        <div className="mx-5 mb-5 rounded-2xl p-4" style={{ background: "hsl(25 15% 15%)" }}>
          <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Order Summary</p>
          <p className="text-sm font-semibold">White Rabbit — Garment Care</p>
          <p className="text-xs opacity-50 mt-1">Est. delivery in 3–5 business days</p>
          {orderId && (
            <p className="text-[10px] opacity-40 mt-2">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="px-5 mb-5">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-60 mb-3">Payment Method</p>
          
          {/* Razorpay Option */}
          <button
            onClick={handleRazorpayPayment}
            disabled={loading}
            className="flex w-full items-center gap-3 rounded-2xl p-4 mb-2 transition-all"
            style={{ background: "hsl(25 15% 13%)", border: "1px solid hsl(25 80% 52%)" }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(25 15% 20%)" }}>
              <CreditCard className="h-5 w-5" style={{ color: "hsl(25 80% 52%)" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Pay with Razorpay</p>
              <p className="text-[10px] opacity-50">Cards, UPI, Wallets, NetBanking</p>
            </div>
            <CheckCircle2 className="h-5 w-5" style={{ color: "hsl(25 80% 52%)" }} />
          </button>

          {/* UPI Direct */}
          <button
            className="flex w-full items-center gap-3 rounded-2xl p-4 opacity-50"
            style={{ background: "hsl(25 15% 13%)" }}
            disabled
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(25 15% 20%)" }}>
              <Wallet className="h-5 w-5 opacity-60" />
            </div>
            <span className="text-sm font-medium">UPI Direct</span>
            <span className="ml-auto text-[9px] uppercase tracking-wider opacity-40">Coming Soon</span>
          </button>
        </div>

        {/* Security Info */}
        <div className="px-5 mb-5">
          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "hsl(25 15% 13%)" }}>
            <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: "hsl(120 40% 40% / 0.2)" }}>
              <CheckCircle2 className="h-3 w-3" style={{ color: "hsl(120 40% 50%)" }} />
            </div>
            <p className="text-[10px] opacity-60">256-bit SSL encrypted. PCI DSS compliant.</p>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Fixed Bottom */}
        <div className="px-5 pb-8 pt-4" style={{ borderTop: "1px solid hsl(25 12% 20%)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider opacity-50">Total to Pay</p>
            <p className="text-xl font-bold font-display">₹{(total || 0).toLocaleString()}</p>
          </div>
          <Button
            onClick={handleRazorpayPayment}
            disabled={loading}
            className="w-full h-12 rounded-2xl text-sm font-semibold uppercase tracking-wider"
            style={{ background: "hsl(35 20% 92%)", color: "hsl(25 20% 10%)" }}
          >
            {loading ? "Processing..." : "Pay Now →"}
          </Button>
        </div>
      </div>
    </AnimatedPage>
  );
}
