"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { TabId } from "../TabNavigation";

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
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
      )}
    >
      {/* Label & Tooltip Region */}
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-hover:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Input Region */}
      <div className="flex justify-end sm:flex-none">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shadow-inner",
            value ? "bg-emu-accent" : "bg-emu-border/30"
          )}
          onClick={() => setValue(name, !value, { shouldValidate: true, shouldDirty: true })}
        >
          <motion.div 
            className="bg-white w-4 h-4 rounded-full shadow-md"
            layout
            animate={{ x: value ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </motion.div>
        <input type="checkbox" className="hidden" {...register(name)} />
      </div>
    </div>
  );
}
