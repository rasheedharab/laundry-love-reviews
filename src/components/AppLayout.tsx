import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./BottomNav";
import SwipeBack from "./SwipeBack";

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const rootPaths = ["/home", "/services", "/orders", "/profile"];

export default function AppLayout() {
  const location = useLocation();
  const isRoot = rootPaths.includes(location.pathname);

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background">
      <main className="pb-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {isRoot ? (
              <Outlet />
            ) : (
              <SwipeBack>
                <Outlet />
              </SwipeBack>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
