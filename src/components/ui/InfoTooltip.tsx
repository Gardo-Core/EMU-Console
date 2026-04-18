"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * InfoTooltip: Componente di supporto informativo universale.
 * 
 * Miglioramenti apportati:
 * 1. Supporto Mobile: Ora cliccabile su dispositivi touch.
 * 2. Estetica Premium: Sfondo glassmorphism (sfumato + blur) molto pronunciato.
 * 3. Leggibilità: Font Inter con spaziatura aumentata (tracking-wide).
 * 4. Animazioni: Ingresso e uscita fluidi tramite Framer Motion.
 */
export function InfoTooltip({ content, align = "center" }: { content: string, align?: "left" | "center" | "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chiude il tooltip se si clicca fuori (fondamentale per mobile)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0 translate-x-0 origin-bottom-left",
    center: "left-1/2 -translate-x-1/2 origin-bottom",
    right: "right-0 translate-x-0 origin-bottom-right"
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Icona "?" Arancione e Vibrante */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none group/icon transition-transform active:scale-90"
      >
        <HelpCircle 
          className={cn(
            "w-3.5 h-3.5 transition-all duration-300",
            isOpen ? "text-emu-highlight scale-110 drop-shadow-[0_0_8px_rgba(248,188,36,0.4)]" : "text-emu-accent/80 group-hover/icon:text-emu-highlight group-hover/icon:scale-110"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute bottom-7 px-4 py-3 min-w-[240px] w-64 md:w-72",
              "bg-[#051821]/60 backdrop-blur-2xl border border-[#266867]/60",
              "rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(245,136,0,0.05)]",
              "z-[120] pointer-events-none select-none",
              alignmentClasses[align]
            )}
            style={{ WebkitBackdropFilter: "blur(24px) saturate(160%)" }}
          >
            {/* Contenuto Testuale Ottimizzato */}
            <p className="text-white text-[11px] md:text-xs leading-relaxed font-sans tracking-wide">
              {content}
            </p>
            
            {/* Freccetta Stilizzata */}
            <div className={cn(
               "absolute -bottom-1.5 w-3 h-3 bg-[#051821]/60 border-r border-b border-[#266867]/60 rotate-45",
               align === "center" ? "left-1/2 -translate-x-1/2" : align === "left" ? "left-4" : "right-4"
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
