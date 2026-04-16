"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function ColorPicker({ name, label, tooltip }: { name: string, label: string, tooltip: string }) {
  const { register, formState: { errors }, watch } = useFormContext();
  const error = errors[name]?.message as string;
  const value = watch(name);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4 items-center group">
      {/* Label Region (4 columns) */}
      <div className="col-span-12 sm:col-span-4 flex items-center justify-between lg:justify-start lg:gap-2">
        <label className="text-sm font-medium text-white/80 group-focus-within:text-emu-highlight transition-colors">
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Input Region (8 columns) */}
      <div className="col-span-12 sm:col-span-8 flex gap-2">
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
              "flex-1 bg-[#051821]/50 backdrop-blur-sm border rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-0 transition-colors uppercase",
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
