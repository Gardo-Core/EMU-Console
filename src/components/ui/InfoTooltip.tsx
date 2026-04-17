"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Piccola icona a forma di punto di domanda che, al passaggio del mouse (o al tocco),
 * mostra un fumetto informativo (tooltip) per spiegare i campi più tecnici.
 */
export function InfoTooltip({ content, align = "center" }: { content: string, align?: "center" | "right" | "left" }) {
  const [open, setOpen] = useState(false);

  // Calcoliamo l'allineamento del fumetto rispetto all'icona
  const getAlignClasses = () => {
    switch (align) {
      case "right": return "right-0 translate-x-0";
      case "left": return "left-0 translate-x-0";
      default: return "left-1/2 -translate-x-1/2";
    }
  };

  // Calcoliamo l'allineamento della "frettina" del fumetto
  const getArrowAlignClasses = () => {
    switch (align) {
      case "right": return "right-1.5 translate-x-0";
      case "left": return "left-1.5 translate-x-0";
      default: return "left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div 
      className="relative flex items-center ml-1 flex-shrink-0" 
      onMouseEnter={() => setOpen(true)} 
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle className="w-4 h-4 text-emu-highlight/70 cursor-help flex-shrink-0" />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute bottom-full mb-3 w-[min(calc(100vw-2rem),18rem)] rounded-xl border border-white/10 bg-[#051821]/60 p-4 text-[13px] text-white/90 leading-relaxed flex flex-col gap-1 pointer-events-none z-[100]",
              "backdrop-blur-md backdrop-saturate-150", // Glassmorphism
              getAlignClasses()
            )}
            style={{ WebkitBackdropFilter: "blur(12px)" }} // Fix necessario per i browser basati su WebKit (Safari)
          >
            {content}
            {/* Freccia del fumetto */}
            <div className={cn(
              "absolute top-full border-[6px] border-transparent border-t-[#051821]/60", 
              getArrowAlignClasses()
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
