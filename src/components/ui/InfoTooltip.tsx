"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Portal } from "./Portal";

/**
 * InfoTooltip: Componente di supporto informativo universale.
 * 
 * Miglioramenti apportati:
 * 1. Supporto Portal: Ora renderizzato alla radice (document.body) per evitare clipping.
 * 2. Glassmorphism: Blur perfetto anche su mobile grazie alla rimozione dei vincoli di layering.
 * 3. Positioning: Calcolo dinamico delle coordinate rispetto all'icona d'origine.
 */
export function InfoTooltip({ content, align = "center" }: { content: string, align?: "left" | "center" | "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calcola la posizione dell'icona per posizionare il tooltip correttamente
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width
      });
    }
  };

  // Aggiorna la posizione quando il tooltip si apre o la finestra cambia
  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Chiude il tooltip se si clicca fuori
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

  // Logica di allineamento orizzontale
  const getAlignmentStyle = () => {
    const offset = 28; // Spazio dall'icona
    const baseTop = coords.top - offset;
    
    if (align === "left") {
      return { top: baseTop, left: coords.left, transform: "translateY(-100%)" };
    }
    if (align === "right") {
      return { top: baseTop, left: coords.left + coords.width, transform: "translate(-100%, -100%)" };
    }
    // Default: center
    return { top: baseTop, left: coords.left + coords.width / 2, transform: "translate(-50%, -100%)" };
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Icona "?" Arancione */}
      <button
        ref={triggerRef}
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
          <Portal>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={cn(
                "fixed px-4 py-3 min-w-[240px] w-64 md:w-72",
                "bg-[#051821]/40 backdrop-blur-2xl border border-[#266867]/60",
                "rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(245,136,0,0.05)]",
                "z-[9999] pointer-events-none select-none"
              )}
              style={{ 
                ...getAlignmentStyle(),
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
              }}
            >
              {/* Contenuto Testuale */}
              <p className="text-white text-[11px] md:text-xs leading-relaxed font-sans tracking-wide">
                {content}
              </p>
              
              {/* Freccetta Stilizzata */}
              <div className={cn(
                 "absolute -bottom-1.5 w-3 h-3 bg-[#051821]/40 border-r border-b border-[#266867]/60 rotate-45",
                 align === "center" ? "left-1/2 -translate-x-1/2" : align === "left" ? "left-4" : "right-4"
              )} />
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}

