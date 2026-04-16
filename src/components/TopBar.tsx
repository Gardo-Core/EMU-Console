"use client";

import { useFormContext } from "react-hook-form";
import { Search, X } from "lucide-react";
import { ToggleSwitch } from "./ui/ToggleSwitch";
import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { TabId } from "./TabNavigation";
import { AppMode } from "./LeftNav";

export function TopBar({ 
  setActiveTab, 
  setAppMode 
}: { 
  setActiveTab: (tab: TabId) => void, 
  setAppMode: (mode: AppMode) => void 
}) {
  const { watch, formState } = useFormContext();
  const { searchTerm, setSearchTerm, matches, activeMatchIndex, goToNextMatch } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const profileName = watch("profileName") || "Untitled Profile";
  const isDirty = Object.keys(formState.dirtyFields).length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Stop propagation to form
      
      if (matches.length > 0) {
        goToNextMatch(setActiveTab, setAppMode);
      }
    }
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

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

      {/* Center: Search Field */}
      <div className="hidden md:flex items-center relative group">
        <div className="absolute left-3 text-white/30 group-focus-within:text-emu-highlight transition-colors">
          <Search className="w-3.5 h-3.5" />
        </div>
        <input 
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search parameters or INI..."
          className="bg-[#1A4645]/40 focus:bg-[#1A4645]/60 border border-[#266867]/40 focus:border-emu-highlight/50 rounded-full pl-9 pr-24 py-1.5 transition-all text-white text-xs w-64 focus:w-96 outline-none placeholder:text-white/20"
        />
        <div className="absolute right-3 flex items-center gap-2">
          {matches.length > 0 && searchTerm && (
            <span className="text-[10px] font-mono text-emu-highlight/80 bg-emu-highlight/10 px-1.5 py-0.5 rounded border border-emu-highlight/20">
              {activeMatchIndex + 1}/{matches.length}
            </span>
          )}
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm("")}
                className="hover:text-white text-white/30 transition-colors"
                type="button"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
          <span className="px-1.5 py-0.5 bg-black/40 rounded text-[9px] font-mono border border-white/10 text-white/30 uppercase tracking-tighter">
            {navigator.userAgent.includes('Mac') ? '⌘K' : 'Ctrl+K'}
          </span>
        </div>
      </div>

      {/* Right: View mode / Expert toggle */}
      <div className="flex items-center gap-4">
        {/* We can incorporate an "Expert Mode" toggle here later if needed, tracking state */}
        <span className="text-xs text-emu-highlight/60 uppercase tracking-widest font-semibold hidden sm:block">Configuration Studio</span>
      </div>

    </div>
  );
}
