import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/EmptyState";
import { StaggerContainer, StaggerItem } from "@/components/StaggerAnimation";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  return (
    <AnimatedPage>
      <div className="pb-24">
        <div className="px-5 pt-6 pb-4">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-muted-foreground text-sm">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Your Bag</h1>
          <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
        </div>

        {items.length === 0 ? (
          <div className="px-5">
            <EmptyState variant="cart" title="Your bag is empty" description="Browse our services to get started" />
            <div className="flex justify-center">
              <Button onClick={() => navigate("/services")} variant="outline" className="rounded-xl">
                Browse Services
              </Button>
            </div>
          </div>
        ) : (
          <StaggerContainer className="px-5 space-y-3">
            {items.map((item) => (
              <StaggerItem key={`${item.serviceId}-${item.tier}`}>
                <div className="rounded-xl glass p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.serviceName}</p>
                      <p className="text-[11px] text-muted-foreground">{item.categoryName} · {item.tier === "express" ? "Express" : "Standard"}</p>
                      <p className="text-[10px] text-muted-foreground">{item.turnaround}</p>
                    </div>
                    <button onClick={() => removeItem(item.serviceId, item.tier)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-lg border border-border">
                      <button onClick={() => updateQuantity(item.serviceId, item.tier, item.quantity - 1)} className="p-2">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.serviceId, item.tier, item.quantity + 1)} className="p-2">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {items.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md px-5 py-3">
            <div className="mx-auto max-w-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">₹{total.toLocaleString()}</p>
              </div>
              <Button onClick={() => navigate("/checkout")} className="h-11 rounded-xl px-8 text-sm font-semibold">
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
