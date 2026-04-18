"use client";

import React from "react";
import { FileText, X } from "lucide-react";
import { motion } from "framer-motion";

type IniPreviewProps = {
  fileName: string;
  content: string;
  onClose: () => void;
};

/**
 * IniPreview: Visualizzatore virtualizzato per file INI di grandi dimensioni.
 * 
 * Ruolo: Visualizzazione ad alte prestazioni del contenuto testuale generato.
 * Implementazione: Utilizza @tanstack/react-virtual per il rendering selettivo (DOM Virtualization).
 * Rationale: Previene il degrado delle prestazioni del browser e l'eccessivo consumo di memoria
 * durante la visualizzazione di file di configurazione con migliaia di righe.
 */
import { useVirtualizer } from "@tanstack/react-virtual";

export function IniPreview({ fileName, content, onClose }: IniPreviewProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);
  const lines = React.useMemo(() => content.split("\n"), [content]);

  // Il Virtualizzatore calcola quali righe mostrare in base allo scroll.
  const rowVirtualizer = useVirtualizer({
    count: lines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // Altezza stimata della riga (24px).
    overscan: 10, // Buffer di sicurezza per garantire fluidità di scrolling.
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="h-full flex flex-col bg-[#051821] border border-[#266867]/50 rounded-2xl overflow-hidden"
    >
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

      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto custom-scrollbar bg-[#051821] relative"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const line = lines[virtualRow.index];
            const trimmed = line.trim();
            const isSection = trimmed.startsWith("[") && trimmed.endsWith("]");
            const isComment = trimmed.startsWith(";") || trimmed.startsWith("#");
            const hasEquals = line.includes("=");
            
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`px-3 whitespace-pre flex items-center hover:bg-[#1A4645]/20 transition-colors font-mono text-xs leading-relaxed ${
                  isSection
                    ? "text-[#F58800] font-semibold"
                    : isComment
                    ? "text-white/25 italic"
                    : hasEquals
                    ? "text-[#F8BC24]/80"
                    : "text-white/50"
                }`}
              >
                {/* Gutter dei numeri di riga integrato */}
                <span className="w-8 shrink-0 text-right pr-3 text-[10px] font-mono text-white/15 select-none opacity-50 border-r border-[#266867]/10 mr-3">
                  {(virtualRow.index + 1).toString().padStart(2, '0')}
                </span>
                {line || " "}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-7 bg-[#1A4645]/20 border-t border-[#266867]/30 flex items-center px-4">
        <span className="text-[10px] text-white/25 font-mono text-emu-accent">
          {lines.length} righe | Virtualized Engine Active
        </span>
      </div>
    </motion.div>
  );
}
