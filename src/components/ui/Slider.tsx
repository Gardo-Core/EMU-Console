"use client";

import { InfoTooltip } from "./InfoTooltip";
import { useFormContext } from "react-hook-form";

export function Slider({ name, label, tooltip, min, max }: { name: string, label: string, tooltip: string, min: number, max: number }) {
  const { register, watch } = useFormContext();
  const value = watch(name);

  return (
    <div className="col-span-12 grid grid-cols-12 gap-4 items-center group py-2">
      {/* Label Region (4 columns) */}
      <div className="col-span-12 sm:col-span-4 flex items-center justify-between lg:justify-start lg:gap-2">
        <label className="text-sm font-medium text-white/80 group-hover:text-emu-highlight transition-colors">
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
