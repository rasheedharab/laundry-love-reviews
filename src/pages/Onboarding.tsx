import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import onb1 from "@/assets/onboarding-1.png";
import onb2 from "@/assets/onboarding-2.png";
import onb3 from "@/assets/onboarding-3.png";

const slides = [
  { image: onb1, title: "Expertise in\nEvery Thread" },
  { image: onb2, title: "Meticulous\nAttention to Detail" },
  { image: onb3, title: "Doorstep\nConvenience" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else {
      localStorage.setItem("wr_onboarded", "1");
      navigate("/home");
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Brand name */}
      <div className="relative z-10 pt-10 pb-2 text-center">
        <h1 className="text-lg font-display font-semibold tracking-[0.25em] uppercase text-foreground">
          White Rabbit
        </h1>
      </div>

      {/* Hero image area */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <img
              src={slides[step].image}
              alt={slides[step].title}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay at bottom for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Title overlaid on image */}
        <div className="absolute inset-x-0 bottom-8 z-10 text-center px-6">
          <AnimatePresence mode="wait">
            <motion.h2
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="text-3xl font-display font-bold leading-tight text-foreground whitespace-pre-line"
            >
              {slides[step].title}
            </motion.h2>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pt-5 pb-8 flex flex-col items-center gap-5">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-foreground" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <Button
          onClick={handleNext}
          className="w-full h-13 text-base font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90"
        >
          {step < slides.length - 1 ? "Next" : "Get Started"}
        </Button>
      </div>
    </div>
  );
}
