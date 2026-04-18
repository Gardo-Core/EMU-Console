"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Portal } from "./Portal";

import { validationMetadata } from "@/lib/schema";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { TabId } from "../TabNavigation";

/**
 * Il componente FormSelect è un menu a tendina (dropdown) customizzato.
 * Ora utilizza i Portali per garantire che il menu sia sempre sopra l'header
 * e che l'effetto glassmorphism non venga bloccato dai layer genitori.
 */
export function FormSelect({ 
  name, 
  label, 
  tooltip, 
  tab,
  options 
}: { 
  name: string, 
  label: string, 
  tooltip: string, 
  tab: TabId,
  options: {value: string | number, label: string}[]
}) {
  const { watch, setValue, formState: { errors } } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  const error = errors[name]?.message as string;
  const metadata = (validationMetadata as any)[name];
  const currentValue = watch(name);
  
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Calcola la posizione del tasto per agganciare il menu e il popup
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen || error) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, error]);

  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  useEffect(() => {
    if (isActiveMatch && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActiveMatch]);

  const selectedLabel = options.find(o => o.value == currentValue)?.label || "Seleziona...";

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500",
        isOpen ? "z-[100]" : "z-10",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-focus-within:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      <div className="sm:w-1/2 w-full relative">
        <motion.div
           animate={error ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
           transition={{ duration: 0.4, repeat: error ? 1 : 0 }}
           className="relative"
        >
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "w-full bg-[#051821]/70 backdrop-blur-xl border rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none transition-all flex items-center justify-between cursor-pointer",
              isOpen ? "border-emu-highlight ring-1 ring-emu-highlight/30" : "border-[#266867]/40 hover:border-[#266867]",
              error ? "border-[#F58800] ring-1 ring-[#F58800]/30 shadow-[0_0_20px_rgba(245,136,0,0.15)]" : "shadow-sm"
            )}
          >
            <span className={cn(currentValue ? "text-white" : "text-white/20")}>
              {selectedLabel}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-emu-highlight transition-transform", isOpen ? "rotate-180" : "")} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <Portal>
                {/* Backdrop invisibile */}
                <div className="fixed inset-0 z-[9998] bg-black/5" onClick={() => setIsOpen(false)} />
                
                {/* Il pannello delle opzioni */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className="fixed bg-[#051821]/70 border border-[#266867]/60 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(245,136,0,0.1)] overflow-hidden backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/5 z-[9999]"
                  style={{ 
                    top: coords.top + coords.height + 8,
                    left: coords.left,
                    width: coords.width,
                    WebkitBackdropFilter: "blur(24px) saturate(150%)",
                  }}
                >
                  <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
                    {options.map(opt => (
                      <motion.div
                        key={opt.value}
                        whileHover={{ backgroundColor: "rgba(245, 136, 0, 0.15)", x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setValue(name, opt.value, { shouldDirty: true, shouldValidate: true });
                          setIsOpen(false);
                        }}
                        className={cn(
                          "px-4 py-3 text-sm font-mono transition-all cursor-pointer flex items-center justify-between",
                          currentValue == opt.value 
                            ? "text-emu-highlight font-bold bg-emu-highlight/10" 
                            : "text-white/70 hover:text-white"
                        )}
                      >
                        <span>{opt.label}</span>
                        {currentValue == opt.value && (
                          <motion.div 
                            layoutId={`${name}-active`}
                            className="w-1.5 h-1.5 rounded-full bg-emu-highlight shadow-[0_0_8px_rgba(245,136,0,0.8)]" 
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </Portal>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {error && (
            <Portal>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="fixed bg-[#051821]/95 backdrop-blur-xl border border-[#F58800]/40 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3 z-[9999]"
                style={{
                  top: coords.top + coords.height + 12,
                  left: coords.left,
                  width: coords.width,
                  WebkitBackdropFilter: "blur(24px) saturate(150%)",
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2 text-[#F58800]">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Violazione Regole Manuale</span>
                  </div>
                  {metadata?.ref && (
                    <span className="text-[9px] bg-black/40 text-white/40 px-2 py-0.5 rounded font-mono">
                      {metadata.ref}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-white font-medium text-xs leading-tight">
                    {error}
                  </p>
                  {metadata?.advice && (
                    <p className="text-white/60 text-[11px] leading-relaxed italic border-l-2 border-[#F58800]/20 pl-3">
                      {metadata.advice}
                    </p>
                  )}
                </div>
                
                <div className="absolute -top-1.5 left-6 border-8 border-transparent border-b-[#F58800]/40 shrink-0" />
              </motion.div>
            </Portal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

