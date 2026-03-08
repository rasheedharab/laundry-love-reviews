import { useRef, useState, useCallback, type ReactNode, type TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface Props {
  children: ReactNode;
  threshold?: number;
  edgeWidth?: number;
}

export default function SwipeBack({ children, threshold = 80, edgeWidth = 28 }: Props) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, threshold * 1.5], [0, 0.45]);
  const indicatorScale = useTransform(x, [0, threshold], [0.5, 1]);
  const indicatorX = useTransform(x, [0, threshold * 1.5], [-12, 8]);

  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);
  const decided = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || touch.clientX > edgeWidth) return;
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    tracking.current = true;
    decided.current = false;
  }, [edgeWidth]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!tracking.current) return;
    const touch = e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    if (!decided.current) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        tracking.current = false;
        x.set(0);
        return;
      }
      if (Math.abs(dx) > 10) {
        decided.current = true;
      }
      return;
    }

    if (dx > 0) {
      x.set(Math.min(dx * 0.6, threshold * 2));
    }
  }, [x, threshold]);

  const onTouchEnd = useCallback(() => {
    if (!tracking.current && !decided.current) return;
    tracking.current = false;
    decided.current = false;

    if (x.get() >= threshold) {
      animate(x, threshold * 2, { duration: 0.15, ease: "easeOut" }).then(() => {
        navigate(-1);
        requestAnimationFrame(() => x.set(0));
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }, [x, threshold, navigate]);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Edge indicator */}
      <motion.div
        className="fixed left-0 top-0 bottom-0 z-[60] flex items-center pointer-events-none"
        style={{ opacity }}
      >
        <motion.div
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-accent/90 shadow-lg shadow-accent/20"
          style={{ scale: indicatorScale, x: indicatorX }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-foreground">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
