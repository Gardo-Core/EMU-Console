"use client";

import { Home, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppMode = "configurator" | "compare";

export function LeftNav({ appMode, setAppMode }: { appMode: AppMode, setAppMode: (mode: AppMode) => void }) {
  return (
    <div className="w-16 h-full bg-[#051821] border-r border-[#266867]/50 flex flex-col items-center py-1 gap-6 sticky top-0 shrink-0 z-50">

      {/* Brand Logo - Top Left */}
      <div className="w-[60px] h-[60px] flex items-center justify-center mb-2">
        <img
          src="/asset/Emu_Icon.svg"
          alt="EMU"
          className="w-[60px] h-[60px] opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="w-8 h-px bg-[#266867]/30" />

      <button
        type="button"
        title="Configuratore"
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border-l-2",
          appMode === "configurator"
            ? "border-[#F58800] bg-[#1A4645] text-[#F58800] shadow-[0_0_15px_rgba(245,136,0,0.2)]"
            : "border-transparent text-white/50 hover:bg-[#1A4645]/50 hover:text-white"
        )}
        onClick={() => setAppMode("configurator")}
      >
        <Home className="w-5 h-5" />
      </button>

      <button
        type="button"
        title="Confronto INI"
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border-l-2",
          appMode === "compare"
            ? "border-[#F58800] bg-[#1A4645] text-[#F58800] shadow-[0_0_15px_rgba(245,136,0,0.2)]"
            : "border-transparent text-white/50 hover:bg-[#1A4645]/50 hover:text-white"
        )}
        onClick={() => setAppMode("compare")}
      >
        <ArrowLeftRight className="w-5 h-5" />
      </button>

    </div>
  );
}
