import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/logo.png";
import onb1 from "@/assets/onboarding-1.png";
import onb2 from "@/assets/onboarding-2.png";
import onb3 from "@/assets/onboarding-3.png";

const slides = [
  { image: onb1, title: "Premium Garment Care", subtitle: "Expertise in every thread — trusted by those who value their wardrobe." },
  { image: onb2, title: "Meticulous Attention", subtitle: "Hand-finished cleaning with specialized fabric preservation techniques." },
  { image: onb3, title: "Doorstep Convenience", subtitle: "Scheduled pickup & delivery — luxury care without leaving home." },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else {
      localStorage.setItem("wr_onboarded", "1");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 pt-12 pb-8">
      <img src={logoImg} alt="White Rabbit" className="mb-8 h-16 w-auto" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <img src={slides[step].image} alt={slides[step].title} className="mb-8 h-56 w-56 object-contain" />
          <h2 className="mb-3 text-2xl font-bold font-display text-foreground">{slides[step].title}</h2>
          <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">{slides[step].subtitle}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
          />
        ))}
      </div>

      <Button onClick={handleNext} className="w-full max-w-xs h-12 text-base font-semibold rounded-xl">
        {step < slides.length - 1 ? "Next" : "Get Started"}
      </Button>

      {step < slides.length - 1 && (
        <button
          onClick={() => { localStorage.setItem("wr_onboarded", "1"); navigate("/login"); }}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      )}
    </div>
  );
}
