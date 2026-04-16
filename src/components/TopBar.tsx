"use client";

import { useFormContext } from "react-hook-form";
import { Search } from "lucide-react";
import { ToggleSwitch } from "./ui/ToggleSwitch";

export function TopBar() {
  const { watch, formState } = useFormContext();
  const profileName = watch("profileName") || "Untitled Profile";
  const isDirty = Object.keys(formState.dirtyFields).length > 0;

  return (
    <div className="h-14 w-full bg-[#051821]/80 backdrop-blur-md border-b border-[#266867]/50 flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">
      
      {/* Left: Profile Name & Unsaved Indicator */}
      <div className="flex items-center gap-3">
        <h2 className="text-white font-medium tracking-tight text-sm">
          {profileName}
        </h2>
        {isDirty && (
          <div className="w-2 h-2 rounded-full bg-[#F8BC24] shadow-[0_0_8px_rgba(248,188,36,0.8)]" title="Unsaved Changes" />
        )}
      </div>

      {/* Center: Search Trigger Mock */}
      <button 
        type="button"
        className="hidden md:flex items-center gap-2 bg-[#1A4645]/40 hover:bg-[#1A4645]/60 border border-[#266867]/40 rounded-full px-4 py-1.5 transition-colors text-white/50 text-xs w-64"
        onClick={() => {}}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Search parameters...</span>
        <span className="px-1.5 py-0.5 bg-black/40 rounded text-[10px] font-mono border border-white/10">⌘K</span>
      </button>

      {/* Right: View mode / Expert toggle */}
      <div className="flex items-center gap-4">
        {/* We can incorporate an "Expert Mode" toggle here later if needed, tracking state */}
        <span className="text-xs text-emu-highlight/60 uppercase tracking-widest font-semibold hidden sm:block">Configuration Studio</span>
      </div>

    </div>
  );
}
