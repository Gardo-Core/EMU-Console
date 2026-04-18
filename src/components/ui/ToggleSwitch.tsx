"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { TabId } from "../TabNavigation";

/**
 * Un semplice interruttore (toggle) stilizzato. 
 * Viene usato per i parametri booleani (Si/No, Vero/Falso).
 * È integrato con il sistema di ricerca per evidenziarsi quando l'utente cerca l'opzione.
 */
export function ToggleSwitch({ 
  name, 
  label, 
  tooltip,
  tab
}: { 
  name: string, 
  label: string, 
  tooltip: string,
  tab: TabId
}) {
  const { register, watch, setValue } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  const value = watch(name);
  const containerRef = useRef<HTMLDivElement>(null);

  // Verifichiamo se l'interruttore è "bersaglio" della ricerca
  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  // Logica per lo scroll automatico se l'utente scova il parametro tramite ricerca
  useEffect(() => {
    if (isActiveMatch && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActiveMatch]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500 hover:z-[80] focus-within:z-[80]",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)] z-[70]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)] z-[75]" : ""
      )}
    >
      {/* Label & Tooltip */}
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-hover:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Area Interruttore Animato */}
      <div className="flex justify-end sm:flex-none">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner",
            // Se è attivo usiamo l'arancione accent, altrimenti un teal scuro bordato
            value ? "bg-emu-accent" : "bg-emu-border/30"
          )}
          onClick={() => setValue(name, !value, { shouldValidate: true, shouldDirty: true })}
        >
          {/* Il pallino bianco che "slitta" a destra e sinistra */}
          <motion.div 
            className="bg-white w-4 h-4 rounded-full shadow-md"
            layout
            animate={{ x: value ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </motion.div>
        {/* Input nascosto per mantenere la compatibilità con react-hook-form */}
        <input type="checkbox" className="hidden" {...register(name)} />
      </div>
    </div>
  );
}
