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

/**
 * Il componente FormInput è il mattone fondamentale del nostro progetto.
 * Oltre a visualizzare un semplice campo di testo, gestisce la logica di ricerca globale,
 * lo scrolling automatico quando viene trovato un match e la visualizzazione 
 * dei messaggi di errore avanzati basati sui manuali aziendali.
 */
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
  // Prendiamo tutto ciò che serve dal contesto globale del form
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  // ...e dal contesto della ricerca
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  
  const error = errors[name]?.message as string;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Recuperiamo i metadati (consigli dell'amministratore, riferimenti al manuale, ecc.)
  const metadata = (validationMetadata as any)[name];
  const currentValue = watch(name);

  // Verifichiamo se questo campo specifico è tra quelli cercati dall'utente
  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Se è proprio il risultato "attivo" nella ricerca (quello evidenziato)
  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  // LOGICA "JUMP-TO-RESULT":
  // Se l'utente clicca invio nella barra di ricerca e questo è il campo selezionato,
  // facciamo in modo che la pagina si sposti automaticamente per centrarlo.
  useEffect(() => {
    if (isActiveMatch && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActiveMatch]);
  
  // Se non specifichiamo un placeholder, usiamo la label stessa per non lasciare il campo vuoto
  const activePlaceholder = placeholder || label;

  // Alcuni campi hanno una logica di "Auto-Fix" (es. corregge ESC in ^[)
  const handleAutoFix = () => {
    if (metadata?.autoFix) {
      const fixed = metadata.autoFix(currentValue);
      setValue(name, fixed, { shouldValidate: true, shouldDirty: true });
    }
  };

  // Switch rapido per le password (mostra/nascondi occhietto)
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500",
        // Evidenziamo il campo se la ricerca lo ha scovato
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
    )}>
      {/* Area Label & Punto di domanda (Tooltip) */}
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-focus-within:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      {/* Area Input vera e propria */}
      <div className="sm:w-3/5 w-full relative">
        <motion.div
          // Effetto "shaky" se c'è un errore di validazione
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
          whileHover={{ scale: 1.002 }}
          whileTap={{ scale: 0.998 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "w-full bg-[#051821]/50 backdrop-blur-md border rounded-xl px-4 py-3 text-white font-mono text-[13px] sm:text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-white/10 selection:bg-emu-accent/20",
            type === "password" ? "pr-12" : "",
            error 
              ? "border-emu-accent ring-2 ring-emu-accent/20 shadow-[0_0_20px_rgba(245,136,0,0.15)]" 
              : "border-emu-border/30 hover:border-emu-border/60 focus:border-emu-accent focus:ring-emu-accent/10"
          )}
        />
          {/* Occhietto per le password */}
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

        {/* POPUP ERRORE: Compare quando il valore non rispetta le regole aziendali */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute left-0 right-0 top-full mt-3 z-[100] bg-[#1A4645]/80 backdrop-blur-xl backdrop-saturate-150 border border-[#F58800]/40 rounded-xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col gap-3 group/popover"
              style={{ WebkitBackdropFilter: "blur(24px) saturate(150%)" }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-[#F58800]">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Violazione Regole Manuale</span>
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

              {/* TASTO MAGIC FIX: compare solo se abbiamo una soluzione automatica definita */}
              {metadata?.autoFix && metadata.autoFix(currentValue) !== currentValue && (
                <button
                  type="button"
                  onClick={handleAutoFix}
                  className="w-full mt-1 bg-[#F58800]/10 hover:bg-[#F58800]/20 border border-[#F58800]/30 text-[#F58800] py-2 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-3 h-3" /> Correggi Automaticamente
                </button>
              )}
              
              {/* Freccetta stilizzata che punta al campo in errore */}
              <div className="absolute -top-1.5 left-6 border-8 border-transparent border-b-[#F58800]/40 shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
