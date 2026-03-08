import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <main className="pb-20">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
