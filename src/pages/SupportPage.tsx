import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Phone, MapPin, ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "How do I schedule a pickup?",
    a: "Add items to your cart, proceed to checkout, and select your preferred pickup date & time slot. Our rider will arrive at your doorstep within the chosen window.",
  },
  {
    q: "What is the turnaround time?",
    a: "Standard service takes 48–72 hours. Express service delivers within 24 hours for an additional charge. Turnaround times are displayed on each service page.",
  },
  {
    q: "How are prices calculated?",
    a: "Prices are per garment or per kg depending on the service. You can view exact pricing on each service detail page before adding items to your cart.",
  },
  {
    q: "Can I track my order?",
    a: "Yes! Go to Orders from the bottom navigation and tap any order to see real-time status updates from pickup through delivery.",
  },
  {
    q: "What if my garment is damaged?",
    a: "We take utmost care, but in the rare event of damage, please file a complaint from your Profile page within 48 hours of delivery. Our team will investigate and resolve it promptly.",
  },
  {
    q: "How do loyalty points work?",
    a: "You earn 1 point for every ₹10 spent on completed orders. Points can be tracked in your Profile. Redemption options are coming soon!",
  },
  {
    q: "Do you handle delicate fabrics like silk and wool?",
    a: "Absolutely. We have specialised processes for silk, wool, cashmere, and other delicate fabrics. Check our Dry Cleaning and Leather Care categories for details.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery, UPI, and all major credit/debit cards at the time of pickup or delivery.",
  },
];

function FAQItem({ q, a, isOpen, toggle }: { q: string; a: string; isOpen: boolean; toggle: () => void }) {
  return (
    <motion.div
      className="rounded-2xl glass overflow-hidden"
      initial={false}
    >
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SupportPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactOptions = [
    {
      icon: MessageCircle,
      label: "Live Chat with Advisor",
      description: "Get instant help from our AI garment care advisor",
      action: () => navigate("/garment-advisor"),
      accent: true,
    },
    {
      icon: Mail,
      label: "Email Support",
      description: "support@whiterabbit.in",
      action: () => window.open("mailto:support@whiterabbit.in?subject=Support%20Request", "_blank"),
    },
    {
      icon: Phone,
      label: "Call Us",
      description: "+91 98765 43210",
      action: () => window.open("tel:+919876543210"),
    },
    {
      icon: MapPin,
      label: "Visit an Outlet",
      description: "Find the nearest White Rabbit outlet",
      action: () => navigate("/select-outlet"),
    },
  ];

  return (
    <AnimatedPage>
      <div className="px-5 pt-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Support & Concierge</h1>
            <p className="text-xs text-muted-foreground">We're here to help</p>
          </div>
        </div>

        {/* Hero CTA — Live Chat */}
        <motion.button
          onClick={() => navigate("/garment-advisor")}
          whileTap={{ scale: 0.98 }}
          className="relative w-full mb-8 rounded-2xl glass-accent p-6 text-left overflow-hidden"
        >
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles className="h-10 w-10 text-accent-foreground" />
          </div>
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-wider text-accent-foreground/80 mb-1">AI Concierge</p>
            <p className="text-lg font-display font-bold text-accent-foreground mb-1">Chat with our Garment Advisor</p>
            <p className="text-xs text-accent-foreground/70 mb-3">
              Get instant help with fabric care, stain removal, and service recommendations.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-foreground bg-accent-foreground/15 px-3 py-1.5 rounded-full">
              <MessageCircle className="h-3.5 w-3.5" /> Start Chat
              <ExternalLink className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </motion.button>

        {/* Contact Options */}
        <div className="mb-8">
          <p className="section-label mb-3">CONTACT US</p>
          <div className="space-y-2">
            {contactOptions.map(({ icon: Icon, label, description, action }) => (
              <motion.button
                key={label}
                onClick={action}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center gap-4 rounded-2xl glass p-4 text-left transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="section-label mb-3">FREQUENTLY ASKED QUESTIONS</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                q={faq.q}
                a={faq.a}
                isOpen={openFaq === i}
                toggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Available Mon–Sat, 9 AM – 8 PM IST
          </p>
        </div>
      </div>
    </AnimatedPage>
  );
}
