"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { TabId } from "../TabNavigation";

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
          isMatched ? "text-emu-highlight" : "text-white/60 group-focus-within:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Input Region */}
      <div className="sm:w-1/2 w-full flex gap-2">
        <motion.div
           animate={error ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
           transition={{ type: "spring", stiffness: 500, damping: 10 }}
           className="flex gap-2 w-full"
        >
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

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="text-emu-accent text-xs mt-1 bg-[#2b170c] px-3 py-1 rounded-sm border border-emu-accent/20 absolute z-10 w-full"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
