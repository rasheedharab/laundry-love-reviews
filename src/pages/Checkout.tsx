import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, format } from "date-fns";

const timeSlots = ["08:00 AM – 10:00 AM", "10:00 AM – 12:00 PM", "02:00 PM – 04:00 PM", "04:00 PM – 06:00 PM"];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [serviceLevel, setServiceLevel] = useState<"regular" | "express">("regular");
  const [loading, setLoading] = useState(false);

  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i + 1);
      return { day: format(d, "EEE").toUpperCase(), date: format(d, "d"), full: d };
    });
  }, []);

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
        total: total,
      }).select().single();

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
      navigate(`/payment`, { state: { orderId: order?.id, total } });
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

  const estReturn = format(addDays(dates[selectedDate].full, serviceLevel === "express" ? 2 : 5), "dd MMM yyyy");

  return (
    <div className="pb-28">
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-xl font-display font-bold text-foreground uppercase tracking-wider">Schedule Pickup</h1>
      </div>

      <div className="px-5 space-y-5">
        {/* Service Level Toggle */}
        <div>
          <p className="section-label mb-3">SERVICE LEVEL</p>
          <div className="flex gap-2">
            <button
              onClick={() => setServiceLevel("regular")}
              className={`flex-1 rounded-2xl border-2 p-3.5 text-center text-sm font-semibold transition-all ${
                serviceLevel === "regular" ? "border-foreground bg-foreground text-primary-foreground" : "border-border text-foreground"
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => setServiceLevel("express")}
              className={`flex-1 rounded-2xl border-2 p-3.5 text-center text-sm font-semibold transition-all relative ${
                serviceLevel === "express" ? "border-accent bg-accent text-accent-foreground" : "border-border text-foreground"
              }`}
            >
              <Zap className="inline h-3.5 w-3.5 mr-1" />
              Express
              <span className="absolute -top-2 right-3 bg-accent text-accent-foreground text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                Priority
              </span>
            </button>
          </div>
        </div>

        {/* Date Picker */}
        <div>
          <p className="section-label mb-3">SELECT DATE</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {dates.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate(i)}
                className={`flex flex-col items-center rounded-2xl border-2 px-4 py-3 min-w-[60px] transition-all ${
                  selectedDate === i ? "border-foreground bg-foreground text-primary-foreground" : "border-border text-foreground"
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">{d.day}</span>
                <span className="text-lg font-bold">{d.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <p className="section-label mb-3">TIME WINDOW</p>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`w-full rounded-2xl border-2 p-3.5 text-left text-sm font-medium transition-all ${
                  selectedSlot === slot ? "border-foreground bg-foreground/5" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                    selectedSlot === slot ? "border-foreground" : "border-muted-foreground"
                  }`}>
                    {selectedSlot === slot && <div className="h-2 w-2 rounded-full bg-foreground" />}
                  </div>
                  <span className="text-foreground">{slot}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pickup Address */}
        <div>
          <p className="section-label mb-3">PICKUP LOCATION</p>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-foreground">Enter Address</span>
            </div>
            <Input
              placeholder="Full pickup address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-xl border-border"
            />
          </div>
        </div>

        {/* Processing Info */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Processing Atelier</p>
          <p className="text-sm font-semibold text-foreground">White Rabbit — Central Studio</p>
          <p className="text-xs text-muted-foreground mt-1">Est. return by {estReturn}</p>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-5 py-3">
        <div className="mx-auto max-w-lg">
          <Button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-foreground text-primary-foreground text-sm font-semibold uppercase tracking-wider hover:bg-foreground/90"
          >
            {loading ? "Processing..." : `Confirm Pickup → ₹${total.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
