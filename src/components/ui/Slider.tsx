"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";

import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { TabId } from "../TabNavigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

/**
 * Il componente Slider permette di selezionare un valore numerico in un range (es. 8-48).
 * Lo usiamo principalmente per la dimensione del font (fontSize) 
 * e per le soglie numeriche dei barcode.
 */
export function Slider({ 
  name, 
  label, 
  tooltip, 
  min, 
  max,
  tab
}: { 
  name: string, 
  label: string, 
  tooltip: string, 
  min: number, 
  max: number,
  tab: TabId
}) {
  const { register, watch } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  const value = watch(name);
  const containerRef = useRef<HTMLDivElement>(null);

  // Verifichiamo se l'utente sta cercando questo parametro numerico
  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  // Jump-to-result logic: centratura automatica tramite ricerca
  useEffect(() => {
    if (isActiveMatch && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActiveMatch]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
      )}
    >
      {/* Label, Valore corrente e Tooltip */}
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-hover:text-emu-highlight"
        )}>
          {label}
        </label>
        <div className="flex items-center gap-2">
           {/* Badge che mostra il numero selezionato in tempo reale */}
           <span className="bg-[#051821]/50 border border-[#266867]/50 px-1.5 py-0.5 rounded text-[10px] text-emu-accent font-mono min-w-[20px] text-center">
             {value}
           </span>
           <InfoTooltip content={tooltip} />
        </div>
      </div>
      
      {/* Area Slider */}
      <div className="sm:w-1/2 w-full relative flex flex-col">
        <div className="relative w-full h-6 flex items-center group/slider">
          {/* Sfondo dello slider "notched": crea delle piccole tacche visive per dare un feedback di precisione */}
          <div 
            className="absolute inset-x-0 h-1.5 bg-[#266867]/20 rounded-full overflow-hidden pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(90deg, #266867 1px, transparent 1px),
                linear-gradient(90deg, rgba(38, 104, 103, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: `calc((100% - 1px) / ${(max - min) / 5}) 100%, calc((100% - 1px) / ${max - min}) 60%`,
              backgroundPosition: '0 0, 0 20%',
              backgroundRepeat: 'repeat-x'
            }}
          />
          
          <input 
            type="range" 
            min={min} 
            max={max} 
            {...register(name)}
            className="absolute inset-x-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-emu-accent z-10"
          />
        </div>
        
        {/* Etichette di Minimo e Massimo */}
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-[9px] text-white/30 font-mono">{min}</span>
          <span className="text-[9px] text-white/30 font-mono">{max}</span>
        </div>
      </div>
    </div>
  );
}
