import { useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/EmptyState";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const { user } = useAuth();

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
          <div className="px-5 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={`${item.serviceId}-${item.tier}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={{ left: 0.5, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -120) {
                      removeItem(item.serviceId, item.tier);
                    }
                  }}
                  className="rounded-xl glass p-4 cursor-grab active:cursor-grabbing touch-pan-y"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.serviceName}</p>
                      <p className="text-[11px] text-muted-foreground">{item.categoryName} · {item.tier === "express" ? "Express" : "Standard"}</p>
                      <p className="text-[10px] text-muted-foreground">{item.turnaround}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeItem(item.serviceId, item.tier)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 rounded-lg border border-border">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQuantity(item.serviceId, item.tier, item.quantity - 1)} className="p-2">
                        <Minus className="h-3 w-3" />
                      </motion.button>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={item.quantity}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="text-sm font-semibold w-4 text-center"
                        >
                          {item.quantity}
                        </motion.span>
                      </AnimatePresence>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQuantity(item.serviceId, item.tier, item.quantity + 1)} className="p-2">
                        <Plus className="h-3 w-3" />
                      </motion.button>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={item.price * item.quantity}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-sm font-bold text-foreground"
                      >
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                  <p className="text-[9px] text-muted-foreground/50 mt-2 text-center">← Swipe to remove</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {items.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-40 glass px-5 py-3">
            <div className="mx-auto max-w-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-foreground">₹{total.toLocaleString()}</p>
              </div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button onClick={() => navigate("/checkout")} className="h-11 rounded-xl px-8 text-sm font-semibold">
                  Proceed to Checkout
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
