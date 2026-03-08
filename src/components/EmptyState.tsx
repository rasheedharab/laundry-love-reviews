import { motion } from "framer-motion";

type Variant = "cart" | "orders" | "addresses";

const illustrations: Record<Variant, JSX.Element> = {
  cart: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" className="stroke-muted-foreground/10" strokeWidth="2" />
      <path d="M35 45h6l8 30h32l6-20H47" className="stroke-muted-foreground/30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="55" cy="82" r="3" className="fill-muted-foreground/25" />
      <circle cx="77" cy="82" r="3" className="fill-muted-foreground/25" />
      <path d="M52 58h16M60 50v16" className="stroke-muted-foreground/15" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  orders: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" className="stroke-muted-foreground/10" strokeWidth="2" />
      <rect x="38" y="30" width="44" height="56" rx="6" className="stroke-muted-foreground/30" strokeWidth="2.5" fill="none" />
      <path d="M50 48h20M50 58h14M50 68h18" className="stroke-muted-foreground/15" strokeWidth="2" strokeLinecap="round" />
      <circle cx="82" cy="78" r="14" className="fill-background stroke-muted-foreground/25" strokeWidth="2" />
      <path d="M77 78l3 3 5-5" className="stroke-muted-foreground/30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  addresses: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" className="stroke-muted-foreground/10" strokeWidth="2" />
      <path d="M60 28c-13.8 0-25 10.7-25 24 0 18 25 40 25 40s25-22 25-40c0-13.3-11.2-24-25-24z" className="stroke-muted-foreground/30" strokeWidth="2.5" fill="none" />
      <circle cx="60" cy="52" r="8" className="stroke-muted-foreground/20" strokeWidth="2" fill="none" />
    </svg>
  ),
};

interface EmptyStateProps {
  variant: Variant;
  title: string;
  description?: string;
}

export default function EmptyState({ variant, title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center py-16 text-center"
    >
      <div className="mb-5">{illustrations[variant]}</div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>}
    </motion.div>
  );
}
