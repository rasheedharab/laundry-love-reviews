import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";

export default function FloatingCartButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();

  const hidden = itemCount === 0 || location.pathname === "/cart" || location.pathname === "/checkout";

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/cart")}
          className="fixed bottom-[5.5rem] left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          aria-label="View cart"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
