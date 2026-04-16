"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";

import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { TabId } from "../TabNavigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  // Search Jump Logic
  useEffect(() => {
    if (isActiveMatch && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActiveMatch]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 grid grid-cols-12 gap-4 items-center group relative p-2 rounded-lg transition-all duration-500",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
      )}
    >
      {/* Label Region (4 columns) */}
      <div className="col-span-12 sm:col-span-4 flex items-center justify-between lg:justify-start lg:gap-2">
        <label className={cn(
          "text-sm font-medium transition-colors duration-300",
          isMatched ? "text-emu-highlight" : "text-white/80 group-hover:text-emu-highlight"
        )}>
          {label}
        </label>
        <div className="flex items-center gap-2">
           <span className="bg-[#051821]/50 border border-[#266867]/50 px-2 py-0.5 rounded text-[10px] text-emu-accent font-mono min-w-[24px] text-center">
             {value}
           </span>
           <InfoTooltip content={tooltip} />
        </div>
      </div>
      
      {/* Input Region (8 columns) */}
      <div className="col-span-12 sm:col-span-8 flex items-center">
        <input 
          type="range" 
          min={min} 
          max={max} 
          {...register(name)}
          className="w-full h-1.5 bg-[#266867]/30 rounded-lg appearance-none cursor-pointer accent-emu-accent"
        />
      </div>
    </div>
  );
}
