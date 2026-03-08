import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const timeSlots = ["9:00 AM - 11:00 AM", "11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM"];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!address.trim()) { toast.error("Please enter a pickup address"); return; }
    setLoading(true);

    try {
      // Save address
      const { data: addr } = await supabase.from("addresses").insert({
        user_id: user.id, address_line: address, label: "Pickup", is_default: true,
      }).select().single();

      // Create order
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        status: "confirmed",
        pickup_date: new Date().toISOString().split("T")[0],
        pickup_time_slot: selectedSlot,
        address_id: addr?.id,
        subtotal: total,
        total: total,
      }).select().single();

      if (orderErr) throw orderErr;

      // Create order items
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
      navigate(`/order-confirmation/${order?.id}`);
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

  return (
    <div className="pb-24">
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-display font-bold text-foreground">Review Order</h1>
      </div>

      <div className="px-5 space-y-4">
        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Order Summary</h3>
          {items.map((item) => (
            <div key={`${item.serviceId}-${item.tier}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm text-foreground">{item.serviceName} × {item.quantity}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{item.tier}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3 mt-2">
            <p className="text-sm font-bold text-foreground">Total</p>
            <p className="text-lg font-bold text-primary">₹{total.toLocaleString()}</p>
          </div>
        </div>

        {/* Pickup Address */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Pickup Address</h3>
          </div>
          <Input
            placeholder="Enter your full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-lg"
          />
        </div>

        {/* Time Slot */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Pickup Time</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-lg border p-2.5 text-xs font-medium transition-all ${
                  selectedSlot === slot ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Promo Code */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Promo Code</h3>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="rounded-lg"
            />
            <Button variant="outline" size="sm" className="rounded-lg shrink-0">Apply</Button>
          </div>
        </div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-5 py-3">
        <div className="mx-auto max-w-lg">
          <Button onClick={handlePlaceOrder} disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold">
            {loading ? "Placing Order..." : `Pay ₹${total.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
