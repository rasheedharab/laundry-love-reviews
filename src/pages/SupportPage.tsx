import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Phone, MapPin, ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

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
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactData, setContactData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("faqs").select("id, question, answer").eq("is_active", true).order("sort_order"),
      supabase.from("site_settings").select("key, value").eq("key", "contact_options"),
    ]).then(([faqsRes, settingsRes]) => {
      setFaqs(faqsRes.data || []);
      const contactSetting = settingsRes.data?.[0];
      if (contactSetting && Array.isArray(contactSetting.value)) {
        setContactData(contactSetting.value);
      }
      setLoading(false);
    });
  }, []);

  const contactIconMap: Record<string, React.ElementType> = {
    "message-circle": MessageCircle, mail: Mail, phone: Phone, "map-pin": MapPin,
  };

  const contactOptions = useMemo(() => {
    // Always include Live Chat and Visit Outlet as app navigation items
    const options: { icon: React.ElementType; label: string; description: string; action: () => void }[] = [
      {
        icon: MessageCircle,
        label: "Live Chat with Advisor",
        description: "Get instant help from our AI garment care advisor",
        action: () => navigate("/garment-advisor"),
      },
    ];
    // Add dynamic contacts from DB
    contactData.forEach((c: any) => {
      const Icon = contactIconMap[c.icon] || Mail;
      if (c.type === "email") {
        options.push({ icon: Icon, label: c.label, description: c.detail, action: () => window.open(`mailto:${c.detail}?subject=Support%20Request`, "_blank") });
      } else if (c.type === "phone" || c.type === "whatsapp") {
        options.push({ icon: Icon, label: c.label, description: c.detail, action: () => window.open(`tel:${c.detail.replace(/\s/g, "")}`) });
      }
    });
    // Always include outlet link
    options.push({
      icon: MapPin,
      label: "Visit an Outlet",
      description: "Find the nearest White Rabbit outlet",
      action: () => navigate("/select-outlet"),
    });
    return options;
  }, [contactData, navigate]);

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
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl glass p-4">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                </div>
              ))
            ) : (
              faqs.map((faq, i) => (
                <FAQItem
                  key={faq.id}
                  q={faq.question}
                  a={faq.answer}
                  isOpen={openFaq === i}
                  toggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))
            )}
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
