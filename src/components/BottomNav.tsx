import { Home, Grid3X3, ClipboardList, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useRef } from "react";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/services", icon: Grid3X3, label: "Services" },
  { path: "/orders", icon: ClipboardList, label: "Orders" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const prevCount = useRef(itemCount);
  const badgeKey = useRef(0);

  useEffect(() => {
    if (itemCount !== prevCount.current) {
      badgeKey.current += 1;
      prevCount.current = itemCount;
    }
  }, [itemCount]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{label}</span>
              {label === "Services" && itemCount > 0 && (
                <span
                  key={badgeKey.current}
                  className="absolute -top-0.5 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground animate-bounce-once"
                >
                  {itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
