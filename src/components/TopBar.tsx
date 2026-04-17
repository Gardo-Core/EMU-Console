"use client";

import { useFormContext } from "react-hook-form";
import { Search, X, Menu, Upload, AlertTriangle } from "lucide-react";
import { ToggleSwitch } from "./ui/ToggleSwitch";
import { useSearch } from "@/contexts/SearchContext";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseIniToValues } from "@/lib/iniValidator";

import { TabId } from "./TabNavigation";
import { AppMode } from "./LeftNav";

export function TopBar({ 
  setActiveTab, 
  setAppMode 
}: { 
  setActiveTab: (tab: TabId) => void, 
  setAppMode: (mode: AppMode) => void 
}) {
  const { watch, formState, reset } = useFormContext();
  const { searchTerm, setSearchTerm, matches, activeMatchIndex, goToNextMatch } = useSearch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileName = watch("profileName") || "Profilo Senza Nome";
  const isDirty = Object.keys(formState.dirtyFields).length > 0;

  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
  }, [mobileSearchOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // Ferma la propagazione al form
      
      if (matches.length > 0) {
        goToNextMatch(setActiveTab, setAppMode);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsedValues = parseIniToValues(content);
        // Reset the form with current values + parsed values to ensure we don't lose anything not in the INI
        const currentValues = watch();
        reset({ ...currentValues, ...parsedValues }, { keepDefaultValues: true });
        setShowWarning(false);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be uploaded again
    e.target.value = "";
  };

  // Listener per la scorciatoia da tastiera (Cmd+K / Ctrl+K)
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
    <>
      <div className="h-16 w-full bg-[#051821]/80 backdrop-blur-md border-b border-[#266867]/50 flex items-center justify-between px-4 sm:px-6 shrink-0 z-[60] sticky top-0">
        
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 bg-[#051821] z-[70] flex items-center px-4 gap-3 md:hidden"
            >
              <Search className="w-4 h-4 text-emu-highlight" />
              <input 
                ref={mobileInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Cerca parametri..."
                className="flex-1 bg-transparent border-none text-white text-sm outline-none placeholder:text-white/20"
              />
              <button 
                onClick={() => { setMobileSearchOpen(false); setSearchTerm(""); }}
                className="p-2 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sinistra: Logo + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-white md:hidden hover:bg-emu-surface/50 rounded-lg transition-colors"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-baseline gap-1 select-none">
            <span className="text-white font-bold tracking-tight text-xl">EMU</span>
            <span className="text-white font-thin tracking-tight text-xl" style={{ fontWeight: 100 }}>Console</span>
          </div>
          
          {isDirty && (
            <div className="w-2.5 h-2.5 rounded-full bg-[#F8BC24] shadow-[0_0_8px_rgba(248,188,36,0.8)]" title="Modifiche non salvate" />
          )}
        </div>

        {/* Centro: Campo di Ricerca e Pulsante Carica */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center relative group">
            <div className="absolute left-3 text-white/30 group-focus-within:text-emu-highlight transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input 
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cerca parametri o INI..."
              className="bg-[#1A4645]/40 focus:bg-[#1A4645]/60 border border-[#266867]/40 focus:border-emu-highlight/50 rounded-full pl-9 pr-24 py-1.5 transition-all text-white text-xs w-64 focus:w-80 outline-none placeholder:text-white/20"
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

          <button
            type="button"
            onClick={() => setShowWarning(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emu-highlight/10 border border-emu-highlight/30 text-emu-highlight text-xs font-bold hover:bg-emu-highlight hover:text-emu-base transition-all group scale-95"
          >
            <Upload className="w-3.5 h-3.5 group-hover:translate-y-[-1px] transition-transform" />
            CARICA INI
          </button>
          
          <input 
            ref={fileInputRef}
            type="file"
            accept=".ini"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Destra: Labels e Mobile Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="p-2 text-[#F8BC24] md:hidden hover:bg-emu-surface/50 rounded-lg transition-colors"
            title="Cerca"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowWarning(true)}
            className="p-2 text-[#F8BC24] md:hidden hover:bg-emu-surface/50 rounded-lg transition-colors"
            title="Carica INI"
          >
            <Upload className="w-5 h-5" />
          </button>
          <span className="hidden sm:block text-[10px] sm:text-xs text-emu-highlight/60 uppercase tracking-[0.2em] font-semibold">Studio di Configurazione</span>
        </div>

      </div>

      {/* Warning Popup Overlay */}
      <AnimatePresence>
        {showWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWarning(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#051821] border border-[#F8BC24]/30 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(248,188,36,0.1)] p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[#F8BC24]/10 text-[#F8BC24]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">Sovrascrivere Configurazione?</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Il caricamento di un nuovo file INI sostituirà istantaneamente tutti i parametri attuali nel progetto. Questa azione non può essere annullata.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
                >
                  Annulla
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#F8BC24] hover:bg-[#ffca42] text-[#051821] text-sm font-bold transition-all"
                >
                  Conferma e Carica
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay - Moved outside of the sticky container */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              style={{ backgroundColor: "#051821" }} // Solid background color
              className="fixed top-0 left-0 h-full w-[280px] border-r border-[#266867]/50 p-6 z-[80] md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-white font-bold text-xl">EMU</span>
                    <span className="text-white font-thin text-xl">Console</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <button 
                    onClick={() => { setAppMode("configurator"); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-emu-surface/30 text-white hover:bg-emu-surface/50 border border-emu-border/30"
                  >
                    <span>Configuratore</span>
                  </button>
                  <button 
                    onClick={() => { setAppMode("compare"); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-emu-surface/30 text-white hover:bg-emu-surface/50 border border-emu-border/30"
                  >
                    <span>Confronto INI</span>
                  </button>
                </div>

                <div className="mt-auto pt-6 border-t border-emu-border/20 flex items-center justify-between">
                     <p className="text-[10px] text-white/30 uppercase tracking-widest">v0.1.0 Beta</p>
                     <img src="/asset/Emu_Icon.svg" alt="EMU Logo" className="w-16 h-16 opacity-70" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
