import React, { useState, useEffect, useRef } from "react";
import { useSignal } from "@preact/signals-react";
import { useFormContext } from "react-hook-form";
import { useSearch } from "@/contexts/SearchContext";
import { TabId } from "@/components/TabNavigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertTriangle, Zap } from "lucide-react";
import { validationMetadata } from "@/lib/schema";
import { InfoTooltip } from "./InfoTooltip";

/**
 * FormInput: Componente di input testuale ad alte prestazioni.
 * 
 * Ruolo: Gestione dell'input dati con validazione real-time e ricerca contestuale.
 * Implementazione: Utilizza Signals per la gestione del valore e Framer Motion per il feedback visivo.
 * Rationale: Garantisce zero latenza di input (input lag) indipendentemente dalla complessità del form.
 */
export function FormInput({ 
  name, 
  label, 
  tooltip, 
  tab,
  type = "text", 
  placeholder,
  actionRight,
  useSignalReactivity = true // Attivato di default per i campi ad alta frequenza
}: { 
  name: string, 
  label: string, 
  tooltip: string, 
  tab: TabId,
  type?: string,
  placeholder?: string,
  actionRight?: React.ReactNode,
  useSignalReactivity?: boolean
}) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const { searchTerm, activeMatchIndex, matches } = useSearch();
  
  const error = errors[name]?.message as string;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const metadata = (validationMetadata as any)[name];
  const initialValue = watch(name);

  // Gestione della reattività tramite Signals per minimizzare i re-render di React.
  const signalValue = useSignal(initialValue);

  useEffect(() => {
    if (signalValue.value !== initialValue) {
      signalValue.value = initialValue;
    }
  }, [initialValue]);

  const isMatched = searchTerm && (
    label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActiveMatch = matches[activeMatchIndex]?.id === name;

  useEffect(() => {
    if (isActiveMatch && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActiveMatch]);
  
  const activePlaceholder = placeholder || label;

  const handleAutoFix = () => {
    if (metadata?.autoFix) {
      const fixed = metadata.autoFix(signalValue.value);
      setValue(name, fixed, { shouldValidate: true, shouldDirty: true });
      signalValue.value = fixed;
    }
  };

  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  // Gestore input ottimizzato con Signal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    signalValue.value = val;
    // Sincronizziamo RHF in background (non bloccante)
    setValue(name, val, { shouldValidate: true, shouldDirty: true });
  };

  const { onBlur, ref: registerRef, ...rest } = register(name);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group relative p-2 rounded-lg transition-all duration-500",
        isMatched ? "bg-emu-highlight/5 ring-1 ring-emu-highlight/20 shadow-[0_0_20px_rgba(245,136,0,0.05)]" : "",
        isActiveMatch ? "scale-[1.02] ring-2 ring-emu-highlight shadow-[0_0_30px_rgba(245,136,0,0.2)]" : ""
    )}>
      <div className="flex items-center gap-2 flex-1">
        <label className={cn(
          "text-[13px] font-semibold transition-colors duration-300 min-w-fit",
          isMatched ? "text-emu-highlight" : "text-white/60 group-focus-within:text-emu-highlight"
        )}>
          {label}
        </label>
        <InfoTooltip content={tooltip} />
      </div>
      
      <div className="sm:w-3/5 w-full relative">
        <motion.div
          animate={error ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
          transition={{ duration: 0.4, repeat: error ? 1 : 0 }}
          className="relative flex items-center"
        >
        <motion.input
          type={inputType}
          placeholder={activePlaceholder}
          {...rest}
          value={useSignalReactivity ? signalValue.value : undefined}
          onChange={useSignalReactivity ? handleInputChange : rest.onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            onBlur(e);
            setIsFocused(false);
          }}
          ref={(e) => {
            registerRef(e);
            (containerRef as any).current = e;
          }}
          whileHover={{ scale: 1.002 }}
          whileTap={{ scale: 0.998 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "w-full bg-[#051821]/50 backdrop-blur-md border rounded-xl px-4 py-3 text-white font-mono text-[13px] sm:text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-white/10 selection:bg-emu-accent/20",
            (type === "password" || actionRight) ? "pr-16" : "",
            error 
              ? "border-emu-accent ring-2 ring-emu-accent/20 shadow-[0_0_20px_rgba(245,136,0,0.15)]" 
              : "border-emu-border/30 hover:border-emu-border/60 focus:border-emu-accent focus:ring-emu-accent/10"
          )}
        />
          {/* Occhietto per le password */}
          {type === "password" && !actionRight && (
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

          {/* Azione Custom sulla destra (es. test connessione) */}
          {actionRight && (
            <div className="absolute right-3 flex items-center justify-center">
              {actionRight}
            </div>
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
                  <span className="text-[10px] uppercase font-bold tracking-widest">Violazione Regole Validazione</span>
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
              {metadata?.autoFix && metadata.autoFix(signalValue.value) !== signalValue.value && (
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
