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
            className={cn(
              "absolute bottom-full mb-2 w-64 p-4 bg-[#051821]/98 backdrop-blur-2xl border border-[#266867] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl z-[100] text-xs text-white leading-relaxed flex flex-col gap-1 pointer-events-none",
              getAlignClasses()
            )}
          >
            {content}
            <div className={cn("absolute top-full border-4 border-transparent border-t-emu-border", getArrowAlignClasses())} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
