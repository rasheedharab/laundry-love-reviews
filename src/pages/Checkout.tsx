import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Zap, Tag, X, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import AnimatedPage from "@/components/AnimatedPage";

const timeSlots = ["08:00 AM — 10:00 AM", "10:00 AM — 12:00 PM", "01:00 PM — 03:00 PM", "04:00 PM — 06:00 PM"];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[1]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [serviceLevel, setServiceLevel] = useState<"regular" | "express">("regular");
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ id: string; code: string; discount_percent: number | null; discount_amount: number | null } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i + 1);
      return { day: format(d, "EEE").toUpperCase(), date: format(d, "d"), full: d, month: format(d, "MMMM yyyy") };
    });
  }, []);

  const discount = promoApplied
    ? promoApplied.discount_percent ? total * promoApplied.discount_percent / 100 : (promoApplied.discount_amount || 0)
    : 0;
  const finalTotal = Math.max(0, total - discount);
  const estReturn = format(addDays(dates[selectedDate].full, serviceLevel === "express" ? 2 : 5), "EEE, MMM d");

  const handlePlaceOrder = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!address.trim()) { toast.error("Please enter a pickup address"); return; }
    setLoading(true);

    try {
      const { data: addr } = await supabase.from("addresses").insert({
        user_id: user.id, address_line: address, label: "Pickup", is_default: true,
      }).select().single();

      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        status: "confirmed",
        pickup_date: format(dates[selectedDate].full, "yyyy-MM-dd"),
        pickup_time_slot: selectedSlot,
        address_id: addr?.id,
        subtotal: total,
        discount: discount,
        total: finalTotal,
        promo_code_id: promoApplied?.id || null,
        service_level: serviceLevel,
      } as any).select().single();

      if (orderErr) throw orderErr;

      if (order) {
        const orderItems = items.map((item) => ({
          order_id: order.id,
          service_id: item.serviceId,
          tier: item.tier,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        }));
        await supabase.from("order_items").insert(orderItems);
      }

      clearCart();
      navigate(`/payment`, { state: { orderId: order?.id, total: finalTotal } });
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    const { data, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.trim().toUpperCase())
      .eq("is_active", true)
      .single();
    if (error || !data) {
      toast.error("Invalid or expired promo code");
    } else {
      setPromoApplied({ id: data.id, code: data.code, discount_percent: data.discount_percent, discount_amount: data.discount_amount });
      toast.success(`Promo "${data.code}" applied!`);
    }
    setPromoLoading(false);
  };

  return (
    <AnimatedPage>
      <div className="pb-28">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">Schedule Pickup</h1>
          <div className="w-10" />
        </div>

        <div className="px-5 pt-5 space-y-6">
          {/* Service Level Toggle */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-3">Service Level</p>
            <div className="flex rounded-2xl glass p-1.5">
              <button
                onClick={() => setServiceLevel("regular")}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
                  serviceLevel === "regular" ? "bg-foreground text-primary-foreground" : "text-foreground"
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => setServiceLevel("express")}
                className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all relative ${
                  serviceLevel === "express" ? "bg-foreground text-primary-foreground" : "text-foreground"
                }`}
              >
                Express
                <Badge className="absolute -top-1.5 right-2 bg-accent text-accent-foreground border-0 text-[7px] uppercase tracking-wider px-1.5 py-0">
                  Priority
                </Badge>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Pickup Date</p>
              <p className="text-xs text-muted-foreground">{dates[selectedDate].month}</p>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {dates.slice(0, 5).map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`flex flex-col items-center rounded-2xl px-4 py-3 min-w-[64px] transition-all ${
                    selectedDate === i
                      ? "bg-foreground text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{d.day}</span>
                  <span className="text-xl font-bold">{d.date}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-3">Time Window</p>
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full flex items-center justify-between rounded-2xl border-2 p-4 text-sm font-medium transition-all ${
                    selectedSlot === slot ? "border-foreground" : "border-border"
                  }`}
                >
                  <span className="text-foreground">{slot}</span>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                    selectedSlot === slot ? "border-foreground bg-foreground" : "border-muted-foreground/40"
                  }`}>
                    {selectedSlot === slot && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Location</p>
              <button className="text-[10px] font-semibold text-accent uppercase tracking-wider">Edit</button>
            </div>
            <div className="rounded-2xl glass p-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="h-5 w-5 text-foreground" />
                <Input
                  placeholder="Enter pickup address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border-0 p-0 h-auto text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <div className="h-px bg-border mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Est. Return</p>
                    <p className="text-xs font-semibold text-foreground">{estReturn}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promo Code */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-3">Promo Code</p>
            <div className="rounded-2xl glass p-4">
              {promoApplied ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">{promoApplied.code}</span>
                    <span className="text-xs text-muted-foreground">
                      ({promoApplied.discount_percent ? `${promoApplied.discount_percent}% off` : `₹${promoApplied.discount_amount} off`})
                    </span>
                  </div>
                  <button onClick={() => setPromoApplied(null)} className="p-1 rounded-full hover:bg-secondary">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 border-0 p-0 h-auto text-sm placeholder:text-muted-foreground focus-visible:ring-0 uppercase"
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="text-xs font-bold uppercase tracking-wider text-foreground disabled:opacity-40"
                  >
                    {promoLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="pt-2">
            <div className="h-px bg-border mb-4" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-base font-bold text-foreground">₹{finalTotal.toLocaleString()}.00</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-accent">Discount</span>
                <span className="text-xs text-accent">-₹{discount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Fixed CTA */}
        <div className="fixed bottom-16 left-0 right-0 z-40 glass px-5 py-3">
          <div className="mx-auto max-w-lg">
            <Button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full h-13 rounded-2xl bg-foreground text-primary-foreground text-sm font-bold uppercase tracking-wider hover:bg-foreground/90"
            >
              {loading ? "Processing..." : "Pay"}
            </Button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
