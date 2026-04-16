"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function InfoTooltip({ content, align = "center" }: { content: string, align?: "center" | "right" | "left" }) {
  const [open, setOpen] = useState(false);

  const getAlignClasses = () => {
    switch (align) {
      case "right": return "right-0 translate-x-0";
      case "left": return "left-0 translate-x-0";
      default: return "left-1/2 -translate-x-1/2";
    }
  };

  const getArrowAlignClasses = () => {
    switch (align) {
      case "right": return "right-1.5 translate-x-0";
      case "left": return "left-1.5 translate-x-0";
      default: return "left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div 
      className="relative flex items-center ml-2" 
      onMouseEnter={() => setOpen(true)} 
      onMouseLeave={() => setOpen(false)}
    >
      <HelpCircle className="w-4 h-4 text-emu-highlight/70 cursor-help" />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            /* MODIFICHE PRINCIPALI QUI SOTTO */
            className={cn(
              "absolute bottom-full mb-3 w-[min(calc(100vw-2rem),18rem)] rounded-xl border border-white/10 bg-[#051821]/60 p-4 text-[13px] text-white/90 leading-relaxed flex flex-col gap-1 pointer-events-none z-[100]",
              "backdrop-blur-md backdrop-saturate-150", // Aggiunto saturate per far risaltare i colori sotto
              getAlignClasses()
            )}
            style={{ WebkitBackdropFilter: "blur(12px)" }} // Fix per Safari/iOS
          >
            {content}
            {/* Freccia del tooltip corretta per non rompere il blur */}
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
