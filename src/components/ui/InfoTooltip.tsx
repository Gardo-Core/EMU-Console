import React from "react";
import { HelpCircle } from "lucide-react";

/**
 * Tooltip informativo condiviso per le etichette del form.
 * Fornisce spiegazioni contestuali basate sugli standard aziendali.
 */
export function InfoTooltip({ content, align }: { content: string, align?: string }) {
  return (
    <div className="group/tooltip relative inline-flex items-center">
      <HelpCircle className="w-3 h-3 text-white/20 hover:text-emu-accent cursor-help transition-colors" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-2 bg-[#051821] border border-[#266867] text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-normal w-48 z-50 pointer-events-none box-border backdrop-blur-md">
        {content}
      </div>
    </div>
  );
}
