"use client";

import { useFormContext } from "react-hook-form";
import { Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ActionBar({ isGenerating }: { isGenerating: boolean }) {
  const { watch, formState } = useFormContext();
  const enableAutoLogin = watch("enableAutoLogin");
  const scriptName = watch("scriptName");
  const errs = Object.keys(formState.errors);

  const fileString = (enableAutoLogin && scriptName) 
    ? `config.ini + ${scriptName}`
    : `config.ini`;

  return (
    <div className="fixed bottom-0 left-0 md:left-16 right-0 h-24 sm:h-20 bg-[#051821]/90 backdrop-blur-xl border-t border-emu-border/40 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-3 sm:py-0 z-50">
      
      {/* Contenuto di sinistra: Status info */}
      <div className="flex flex-col mb-2 sm:mb-0 items-center sm:items-start">
        <span className="text-emu-accent text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5">
          Pronto per il download
        </span>
        <span className="text-white/60 font-mono text-[11px] sm:text-sm">
          {fileString}
        </span>
      </div>

      {errs.length > 0 && (
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 text-[13px] text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
            Per favore correggi {errs.length} errore(i) di validazione
          </div>
      )}

      {/* Contenuto di destra: CTA Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={isGenerating}
        className="w-full sm:w-auto bg-emu-accent hover:bg-[#ff9d21] text-emu-base font-black text-xs sm:text-sm tracking-widest py-3 sm:py-3.5 px-6 sm:px-10 rounded-xl flex items-center shadow-[0_8px_30px_rgba(245,136,0,0.3)] hover:shadow-[0_12px_40px_rgba(245,136,0,0.4)] transition-all sm:min-w-[260px] justify-center uppercase"
      >
        <Download className="w-4 h-4 mr-3" /> 
        {isGenerating ? "GENERAZIONE IN CORSO..." : "GENERA E SCARICA"}
      </motion.button>

    </div>
  );
}
