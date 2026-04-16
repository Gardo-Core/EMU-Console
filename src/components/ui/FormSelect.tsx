"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { validationMetadata } from "@/lib/validationSchemas";
import { AlertTriangle } from "lucide-react";

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
  const metadata = (validationMetadata as any)[name];

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4 items-center group relative">
      {/* Label Region (4 columns) */}
      <div className="col-span-12 sm:col-span-4 flex items-center justify-between lg:justify-start lg:gap-2">
        <label className="text-sm font-medium text-white/50 group-focus-within:text-emu-highlight transition-colors">
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Input Region (8 columns) */}
      <div className="col-span-12 sm:col-span-8 relative">
        <motion.div
           animate={error ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
           transition={{ duration: 0.4, repeat: error ? 1 : 0 }}
        >
          <motion.select
            {...register(name)}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
              "w-full bg-[#051821]/50 backdrop-blur-sm border rounded-md px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer placeholder-white/10",
              error 
                ? "border-[#F58800] ring-1 ring-[#F58800]/20 shadow-[0_0_15px_rgba(245,136,0,0.2)]" 
                : "border-[#266867]/50 hover:border-emu-border focus:border-emu-highlight focus:ring-emu-highlight/20"
            )}
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23F58800\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25em 1.25em', paddingRight: '2.5rem' }}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#051821] text-white">{opt.label}</option>
            ))}
          </motion.select>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute left-0 right-0 top-full mt-3 z-[100] bg-[#1A4645]/95 backdrop-blur-xl border border-[#F58800]/40 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3"
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
              
              {/* Arrow */}
              <div className="absolute -top-1.5 left-6 border-8 border-transparent border-b-[#F58800]/40 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
