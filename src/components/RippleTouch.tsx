import { useCallback, useRef, useState, type MouseEvent, type TouchEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface Props {
  children: ReactNode;
  className?: string;
  as?: "button" | "div";
  onClick?: () => void;
  disabled?: boolean;
}

let rippleId = 0;

export default function RippleTouch({ children, className = "", as = "div", onClick, disabled }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const spawn = useCallback((clientX: number, clientY: number) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;
    const id = ++rippleId;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  }, [disabled]);

  const handleClick = useCallback((e: MouseEvent) => {
    spawn(e.clientX, e.clientY);
    onClick?.();
  }, [spawn, onClick]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (t) spawn(t.clientX, t.clientY);
  }, [spawn]);

  const Comp = as === "button" ? "div" : "div";

  return (
    <div
      ref={ref}
      role={as === "button" ? "button" : undefined}
      tabIndex={as === "button" ? 0 : undefined}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      className={`relative overflow-hidden ${className}`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ opacity: 0.35, scale: 0 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              background: "radial-gradient(circle, hsl(var(--burnt-orange) / 0.25) 0%, hsl(var(--burnt-orange) / 0.08) 60%, transparent 100%)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
