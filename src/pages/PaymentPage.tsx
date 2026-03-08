import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const savedCards = [
  { id: "1", type: "Visa", last4: "4832", expiry: "09/27" },
  { id: "2", type: "Mastercard", last4: "7291", expiry: "03/28" },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total } = (location.state as { orderId?: string; total?: number }) || {};
  const [selectedCard, setSelectedCard] = useState(savedCards[0].id);

  const handlePay = () => {
    if (orderId) {
      navigate(`/order-confirmation/${orderId}`);
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "hsl(25 20% 10%)", color: "hsl(35 20% 92%)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "hsl(25 15% 18%)" }}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm font-semibold uppercase tracking-[0.15em]">Payment</h1>
      </div>

      {/* Order Summary Card */}
      <div className="mx-5 mb-5 rounded-2xl p-4" style={{ background: "hsl(25 15% 15%)" }}>
        <p className="text-[10px] uppercase tracking-wider opacity-60 mb-1">Order Summary</p>
        <p className="text-sm font-semibold">White Rabbit — Garment Care</p>
        <p className="text-xs opacity-50 mt-1">Est. delivery in 3–5 business days</p>
      </div>

      {/* Saved Cards */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-60">Saved Cards</p>
          <button className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "hsl(25 80% 52%)" }}>
            <Plus className="inline h-3 w-3 mr-0.5" /> Add New
          </button>
        </div>
        <div className="space-y-2">
          {savedCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(card.id)}
              className="flex w-full items-center gap-3 rounded-2xl p-4 transition-all"
              style={{ background: selectedCard === card.id ? "hsl(25 15% 18%)" : "hsl(25 15% 13%)", border: selectedCard === card.id ? "1px solid hsl(25 80% 52%)" : "1px solid transparent" }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(25 15% 20%)" }}>
                <CreditCard className="h-5 w-5 opacity-60" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{card.type} •••• {card.last4}</p>
                <p className="text-[10px] opacity-40">Expires {card.expiry}</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                selectedCard === card.id ? "border-accent" : "border-muted-foreground/30"
              }`} style={selectedCard === card.id ? { borderColor: "hsl(25 80% 52%)" } : {}}>
                {selectedCard === card.id && <div className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(25 80% 52%)" }} />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* UPI & Wallets */}
      <div className="px-5 mb-5">
        <p className="text-[10px] uppercase tracking-[0.15em] font-semibold opacity-60 mb-3">UPI & Wallets</p>
        <button className="flex w-full items-center gap-3 rounded-2xl p-4" style={{ background: "hsl(25 15% 13%)" }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(25 15% 20%)" }}>
            <Wallet className="h-5 w-5 opacity-60" />
          </div>
          <span className="text-sm font-medium">UPI / Wallet Payment</span>
        </button>
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
          onClick={handlePay}
          className="w-full h-12 rounded-2xl text-sm font-semibold uppercase tracking-wider"
          style={{ background: "hsl(35 20% 92%)", color: "hsl(25 20% 10%)" }}
        >
          Pay Now →
        </Button>
      </div>
    </div>
  );
}
