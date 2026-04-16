"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ToggleSwitch({ name, label, tooltip }: { name: string, label: string, tooltip: string }) {
  const { register, watch, setValue } = useFormContext();
  const value = watch(name);

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4 items-center group py-1">
      {/* Label Region (4 columns) */}
      <div className="col-span-12 sm:col-span-4 flex items-center justify-between lg:justify-start lg:gap-2">
        <label className="text-sm font-medium text-white/80 group-hover:text-emu-highlight transition-colors">
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Input Region (8 columns) */}
      <div className="col-span-12 sm:col-span-8 flex justify-start">
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
