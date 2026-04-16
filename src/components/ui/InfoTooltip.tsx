"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle } from "lucide-react";

export function InfoTooltip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

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
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-[#051821]/98 backdrop-blur-2xl border border-[#266867] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-xl z-[70] text-xs text-white leading-relaxed flex flex-col gap-1 pointer-events-none"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-emu-border" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
