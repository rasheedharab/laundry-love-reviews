import { useRef, useState, useCallback, type ReactNode, type MouseEvent, type TouchEvent } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  tiltMax?: number;
  scale?: number;
  glare?: boolean;
}

export default function TiltCard({ children, className = "", tiltMax = 8, scale = 1.02, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const updateTilt = useCallback((clientX: number, clientY: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * -tiltMax * 2,
      y: (x - 0.5) * tiltMax * 2,
    });
  }, [tiltMax]);

  const handleMouseMove = useCallback((e: MouseEvent) => updateTilt(e.clientX, e.clientY), [updateTilt]);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (t) updateTilt(t.clientX, t.clientY);
  }, [updateTilt]);

  const handleEnter = useCallback(() => setIsHovering(true), []);
  const handleLeave = useCallback(() => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const glareX = ((tilt.y / (tiltMax * 2)) + 0.5) * 100;
  const glareY = ((tilt.x / (tiltMax * 2)) + 0.5) * 100;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovering ? scale : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
      {glare && isHovering && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, hsl(var(--burnt-orange) / 0.12) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}
