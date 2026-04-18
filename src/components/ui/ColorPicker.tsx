"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { TabId } from "../TabNavigation";

/**
 * Un selettore di colori (Color Picker) che unisce un input di tipo "color" 
 * (che apre la tavolozza di sistema) e un input di testo per chi preferisce 
 * scrivere direttamente il codice Hex (es. #FF00FF).
 */
export function ColorPicker({ 
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
  const { register, formState: { errors }, watch } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  const error = errors[name]?.message as string;
  const value = watch(name);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Verifichiamo se l'utente sta cercando proprio questo parametro di colore
  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  // Jump-to-result: scroll automatico verso il componente se pescato dalla ricerca
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
          isMatched ? "text-emu-highlight" : "text-white/60 group-focus-within:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Area Input Colore */}
      <div className="sm:w-1/2 w-full flex gap-2">
        <motion.div
           animate={error ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
           transition={{ type: "spring", stiffness: 500, damping: 10 }}
           className="flex gap-2 w-full"
        >
          {/* Il quadratino colorato cliccabile (Selettore di Sistema) */}
          <motion.input 
            type="color" 
            {...register(name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "h-10 w-12 cursor-pointer border rounded-md p-1 bg-[#051821]/50 backdrop-blur-sm overflow-hidden shadow-inner transition-colors shrink-0",
              error ? "border-emu-highlight" : "border-[#266867]/50 hover:border-emu-border focus:border-emu-highlight"
            )}
          />
          {/* Campo di testo per inserire il codice HEX manualmente */}
          <motion.input 
            type="text"
            {...register(name)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              register(name).onBlur(e);
              setIsFocused(false);
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "flex-1 bg-[#051821]/50 backdrop-blur-sm border rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-0 transition-colors uppercase placeholder-white/10",
              error ? "border-emu-highlight" : "border-[#266867]/50 hover:border-emu-border focus:border-emu-highlight shadow-[0_0_0_transparent] focus:shadow-[0_0_15px_rgba(248,188,36,0.2)]"
            )}
          />
        </motion.div>

        {/* Visualizzazione rapida dell'errore (se presente) */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="text-emu-accent text-xs mt-1 bg-[#051821]/95 backdrop-blur-xl px-3 py-1 rounded-sm border border-emu-accent/20 absolute z-[110] w-full"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
