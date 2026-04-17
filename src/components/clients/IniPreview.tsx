"use client";

import { FileText, X } from "lucide-react";
import { motion } from "framer-motion";

type IniPreviewProps = {
  fileName: string;
  content: string;
  onClose: () => void;
};

/**
 * IniPreview: Pannello di anteprima per i file .ini.
 * Mostra il contenuto testuale con font mono, numeri di riga,
 * in stile coerente con il TerminalPreview del progetto.
 * Visibile solo su desktop (lg:+).
 */
export function IniPreview({ fileName, content, onClose }: IniPreviewProps) {
  const lines = content.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="h-full flex flex-col bg-[#051821] border border-[#266867]/50 rounded-2xl overflow-hidden"
    >
      {/* Header del preview */}
      <div className="h-11 bg-[#1A4645]/40 border-b border-[#266867]/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-[#F58800]" />
          <span className="text-xs font-mono text-white/70 truncate max-w-[200px]">
            {fileName}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contenuto con numeri di riga */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#051821]">
        <div className="font-mono text-xs leading-relaxed">
          {lines.map((line, idx) => {
            const isSection = line.trim().startsWith("[") && line.trim().endsWith("]");
            const isComment = line.trim().startsWith(";") || line.trim().startsWith("#");
            const hasEquals = line.includes("=");
            
            return (
              <div
                key={idx}
                className="flex hover:bg-[#1A4645]/20 transition-colors group/line"
              >
                {/* Numero riga */}
                <span className="w-10 shrink-0 text-right pr-3 py-px text-white/15 select-none border-r border-[#266867]/20 group-hover/line:text-white/30 transition-colors">
                  {idx + 1}
                </span>

                {/* Contenuto riga */}
                <span
                  className={`flex-1 px-3 py-px whitespace-pre ${
                    isSection
                      ? "text-[#F58800] font-semibold"
                      : isComment
                      ? "text-white/25 italic"
                      : hasEquals
                      ? "text-[#F8BC24]/80"
                      : "text-white/50"
                  }`}
                >
                  {line || " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer con info */}
      <div className="h-7 bg-[#1A4645]/20 border-t border-[#266867]/30 flex items-center px-4">
        <span className="text-[10px] text-white/25 font-mono">
          {lines.length} righe • INI Config
        </span>
      </div>
    </motion.div>
  );
}
