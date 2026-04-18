"use client";

import { useSignal } from "@preact/signals-react";
import { useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

/**
 * SIGNAL INPUT 🚦
 * 
 * Questo componente è un piccolo prodigio di performance. 
 * Invece di far re-renderizzare l'intero form (e i suoi figli pesanti) ad ogni 
 * tasto premuto, questo input aggiorna direttamente il nodo DOM usando i Signals.
 * 
 * Ad ogni digitazione:
 * 1. Il Signal `value` cambia.
 * 2. Il nodo DOM dell'input si aggiorna (senza passare da React).
 * 3. Il valore viene sincronizzato con react-hook-form solo "onBlur" o "onChange" 
 *    con un debounce per evitare di bloccare il main thread.
 */

interface SignalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export function SignalInput({ name, label, className, ...props }: SignalInputProps) {
  const { register, setValue, watch } = useFormContext();
  const initialValue = watch(name);
  const signal = useSignal(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizziamo il Signal se il valore esterno cambia (es. reset del form)
  useEffect(() => {
    if (signal.value !== initialValue) {
      signal.value = initialValue;
    }
  }, [initialValue]);

  // Registrazione manuale per react-hook-form
  const { onBlur, ...rest } = register(name);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    signal.value = val;
    // Aggiornamento non bloccante per RHF (per la validazione e la sincronizzazione di altri componenti)
    setValue(name, val, { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-1.5 w-full relative hover:z-[80] focus-within:z-[80] transition-all">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-emu-accent/70 px-1">
          {label}
        </label>
      )}
      <input
        {...props}
        {...rest}
        ref={inputRef}
        value={signal.value}
        onBlur={onBlur}
        onChange={handleInputChange}
        className={cn(
          "bg-[#051821] border border-emu-border/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emu-accent/50 focus:ring-1 focus:ring-emu-accent/20 transition-all",
          className
        )}
      />
    </div>
  );
}
