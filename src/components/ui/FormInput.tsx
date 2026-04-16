"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";

import { validationMetadata } from "@/lib/validationSchemas";
import { AlertTriangle, Zap, Eye, EyeOff } from "lucide-react";
import { TabId } from "../TabNavigation";

export function FormInput({ 
  name, 
  label, 
  tooltip, 
  tab,
  type = "text", 
  placeholder 
}: { 
  name: string, 
  label: string, 
  tooltip: string, 
  tab: TabId,
  type?: string,
  placeholder?: string
}) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  const error = errors[name]?.message as string;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const metadata = (validationMetadata as any)[name];
  const currentValue = watch(name);

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
  
  // if standard placeholder is empty, fall back to label
  const activePlaceholder = placeholder || label;

  const handleAutoFix = () => {
    if (metadata?.autoFix) {
      const fixed = metadata.autoFix(currentValue);
      setValue(name, fixed, { shouldValidate: true, shouldDirty: true });
    }
  };

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 grid grid-cols-12 gap-4 items-center group relative p-1 rounded-lg transition-all duration-500",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
    )}>
      {/* Label Region (4 columns) */}
      <div className="col-span-12 sm:col-span-4 flex items-center justify-between lg:justify-start lg:gap-2">
        <label className={cn(
          "text-sm font-medium transition-colors duration-300",
          isMatched ? "text-emu-highlight" : "text-white/50 group-focus-within:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Input Region (8 columns) */}
      <div className="col-span-12 sm:col-span-8 relative">
        <motion.div
          animate={error ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.4, repeat: error ? 1 : 0 }}
          className="relative flex items-center"
        >
          <motion.input
            type={inputType}
            placeholder={activePlaceholder}
            {...register(name)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              register(name).onBlur(e);
              setIsFocused(false);
            }}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "w-full bg-[#051821]/50 backdrop-blur-sm border rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 transition-all placeholder-white/10",
              type === "password" ? "pr-10" : "",
              error 
                ? "border-[#F58800] ring-1 ring-[#F58800]/20 shadow-[0_0_15px_rgba(245,136,0,0.2)]" 
                : "border-[#266867]/50 hover:border-emu-border focus:border-emu-highlight focus:ring-emu-highlight/20"
            )}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-white/30 hover:text-emu-highlight transition-colors p-1"
            >
              {showPassword ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute left-0 right-0 top-full mt-3 z-[100] bg-[#1A4645]/95 backdrop-blur-xl border border-[#F58800]/40 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3 group/popover"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-[#F58800]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Manual Rule Violation</span>
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

              {metadata?.autoFix && metadata.autoFix(currentValue) !== currentValue && (
                <button
                  type="button"
                  onClick={handleAutoFix}
                  className="w-full mt-1 bg-[#F58800]/10 hover:bg-[#F58800]/20 border border-[#F58800]/30 text-[#F58800] py-2 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-3 h-3" /> Fix Automatically
                </button>
              )}
              
              {/* Arrow */}
              <div className="absolute -top-1.5 left-6 border-8 border-transparent border-b-[#F58800]/40 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
