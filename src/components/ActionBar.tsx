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
    ? `config.ini + ${scriptName}.ini`
    : `config.ini`;

  return (
    <div className="fixed bottom-0 left-16 right-0 h-20 bg-[#051821]/90 backdrop-blur-lg border-t border-[#266867] flex items-center justify-between px-8 z-50">
      
      {/* Contenuto di sinistra */}
      <div className="flex flex-col">
        <span className="text-[#F8BC24] text-xs font-semibold uppercase tracking-wider mb-1">
          Pronto per la generazione
        </span>
        <span className="text-white/80 font-mono text-sm">
          {fileString}
        </span>
      </div>

      {errs.length > 0 && (
         <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-sm text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
           Per favore correggi {errs.length} errore(i) di validazione
         </div>
      )}

      {/* Contenuto di destra */}
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={isGenerating}
        className="bg-[#F58800] hover:bg-[#ff9d21] text-[#051821] font-extrabold text-sm tracking-wide pt-3 pb-3 px-8 rounded-lg flex items-center shadow-[0_0_15px_rgba(245,136,0,0.4)] hover:shadow-[0_0_20px_rgba(245,136,0,0.6)] transition-all min-w-[240px] justify-center uppercase"
      >
        <Download className="w-4 h-4 mr-3" /> 
        {isGenerating ? "GENERAZIONE IN CORSO..." : "GENERA E SCARICA"}
      </motion.button>

    </div>
  );
}
