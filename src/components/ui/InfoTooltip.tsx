import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Portal } from "./Portal";

/**
 * InfoTooltip: Componente di supporto informativo universale.
 * 
 * Versione Portale 2.0:
 * - Risolto: Posizionamento "a caso" causato dai conflitti tra CSS e Framer Motion.
 * - Risolto: Testo tagliato ai bordi dello schermo (Screen-Boundary Check).
 * - Risolto: Tracking preciso dello scroll.
 */
export function InfoTooltip({ content, align = "center" }: { content: string, align?: "left" | "center" | "right" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number, left: number, width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calcola la posizione precisa dell'icona "?"
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

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      // Usiamo una frequenza di campionamento alta per lo scroll
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

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

  /**
   * Calcolo Dinamico dell'Allineamento:
   * Non usiamo più transform: translate(-50%) per evitare conflitti con le animazioni.
   * Calcoliamo invece i pixel esatti di 'left'.
   */
  const getPositionalStyles = () => {
    if (!coords) return { top: 0, left: 0, opacity: 0 };
    
    const tooltipWidth = window.innerWidth < 768 ? 260 : 300; // Larghezza mobile vs desktop
    const screenWidth = window.innerWidth;
    const margin = 16;
    
    // Punto di partenza: centro dell'icona
    let left = coords.left + (coords.width / 2) - (tooltipWidth / 2);
    
    // Correzione forzata se usciamo dallo schermo (Boundary Check)
    if (left < margin) left = margin;
    if (left + tooltipWidth > screenWidth - margin) left = screenWidth - tooltipWidth - margin;
    
    return {
      top: coords.top - 16, // Alzato leggermente per distanziarlo dall'icona
      left: left,
      width: tooltipWidth
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
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
        {isOpen && coords && (
          <Portal>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: "-98%" }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: "-100%" 
              }}
              exit={{ opacity: 0, scale: 0.96, y: "-98%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "fixed px-4 py-3 bg-[#051821]/40 backdrop-blur-2xl border border-[#266867]/60",
                "rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(245,136,0,0.05)]",
                "z-[9999] pointer-events-none select-none overflow-visible"
              )}
              style={{ 
                ...getPositionalStyles(),
                WebkitBackdropFilter: "blur(24px) saturate(160%)",
                transformOrigin: "bottom center",
                position: "fixed"
              }}
            >
              <p className="text-white text-[11px] md:text-xs leading-relaxed font-sans tracking-wide">
                {content}
              </p>
              
              {/* Freccetta: Ora posizionata dinamicamente sotto l'icona originaria */}
              <div 
                className="absolute -bottom-1.5 w-3 h-3 bg-[#051821]/40 border-r border-b border-[#266867]/60 rotate-45"
                style={{
                   left: coords.left + (coords.width / 2) - getPositionalStyles().left - 6
                }}
              />
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
}


