"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FormSelect({ 
  name, 
  label, 
  tooltip, 
  options 
}: { 
  name: string, 
  label: string, 
  tooltip: string, 
  options: {value: string | number, label: string}[]
}) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string;

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
      <div className="col-span-12 sm:col-span-8 relative">
        <motion.div
           animate={error ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
           transition={{ type: "spring", stiffness: 500, damping: 10 }}
        >
          <motion.select
            {...register(name)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "w-full bg-[#051821]/50 backdrop-blur-sm border rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-0 transition-colors appearance-none cursor-pointer",
              error ? "border-emu-highlight" : "border-[#266867]/50 hover:border-emu-border focus:border-emu-highlight shadow-[0_0_0_transparent] focus:shadow-[0_0_15px_rgba(248,188,36,0.2)]"
            )}
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23F58800\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem' }}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-emu-base text-white">{opt.label}</option>
            ))}
          </motion.select>
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
