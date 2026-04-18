import React, { useEffect, useRef } from "react";
import { useSignal } from "@preact/signals-react";
import { useFormContext } from "react-hook-form";
import { useSearch } from "@/contexts/SearchContext";
import { TabId } from "@/components/TabNavigation";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

/**
 * Slider: Componente di input numerico ottimizzato.
 * 
 * Ruolo: Selezione di valori in un range definito.
 * Implementazione: Gestione dello stato tramite @preact/signals-react per aggiornamenti DOM diretti.
 * Rationale: Il bypass della riconciliazione di React garantisce una fluidità di 60fps
 * anche su dispositivi mobili con risorse limitate durante l'interazione rapida.
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
  const { register, watch, setValue } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  const initialValue = watch(name);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reattività basata su Signals per aggiornamenti DOM ad alta frequenza.
  const signalValue = useSignal(initialValue);

  useEffect(() => {
    if (signalValue.value !== initialValue) {
      signalValue.value = initialValue;
    }
  }, [initialValue]);

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

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    signalValue.value = val;
    // Sincronizziamo RHF in background
    setValue(name, val, { shouldValidate: true, shouldDirty: true });
  };

  const { ref: registerRef, onChange, ...rest } = register(name);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500 hover:z-[80] focus-within:z-[80]",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)] z-[70]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)] z-[75]" : ""
      )}
    >
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-hover:text-emu-highlight"
        )}>
          {label}
        </label>
        <div className="flex items-center gap-2">
           <span className="bg-[#051821]/50 border border-[#266867]/50 px-1.5 py-0.5 rounded text-[10px] text-emu-accent font-mono min-w-[20px] text-center">
             {signalValue.value}
           </span>
           <InfoTooltip content={tooltip} />
        </div>
      </div>
      
      <div className="sm:w-1/2 w-full relative flex flex-col">
        <div className="relative w-full h-6 flex items-center group/slider">
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
            {...rest}
            value={signalValue.value}
            onChange={handleSliderChange}
            ref={(e) => {
              registerRef(e);
            }}
            className="absolute inset-x-0 w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-emu-accent z-10"
          />
        </div>
        
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-[9px] text-white/30 font-mono">{min}</span>
          <span className="text-[9px] text-white/30 font-mono">{max}</span>
        </div>
      </div>
    </div>
  );
}

