"use client";

import { FileText, ExternalLink } from "lucide-react";

/**
 * Scheda Aiuto: Mostra la documentazione ufficiale in PDF.
 * Include link rapidi alle pagine più importanti per l'amministratore (TN5250, SSL, Barcode).
 */
export function HelpTab() {
  return (
    <div className="space-y-6 flex flex-col items-center">
       <h2 className="text-2xl font-bold glow-text mb-2">Guida dell'Amministratore</h2>
       <p className="text-white/70 max-w-lg text-center mb-6">
         La documentazione ufficiale Gallagher & Robertson è incorporata qui sotto. Puoi navigare direttamente alle sezioni chiave o scaricarne una copia.
       </p>
       
       {/* Griglia di link rapidi alle pagine specifiche del PDF */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
         <a href="/asset/Administrator GLINK.pdf#page=112" target="_blank" className="bg-emu-surface border border-emu-border hover:border-emu-highlight px-4 py-3 rounded-lg flex items-center transition-all glow-shadow">
           <FileText className="w-5 h-5 text-emu-accent mr-3 flex-shrink-0" />
           <div>
             <div className="text-sm font-medium">Modelli TN5250</div>
             <div className="text-xs opacity-50">Pagina 94</div>
           </div>
         </a>
         <a href="/asset/Administrator GLINK.pdf#page=143" target="_blank" className="bg-emu-surface border border-emu-border hover:border-emu-highlight px-4 py-3 rounded-lg flex items-center transition-all glow-shadow">
           <FileText className="w-5 h-5 text-emu-accent mr-3 flex-shrink-0" />
           <div>
             <div className="text-sm font-medium">Opzioni SSL</div>
             <div className="text-xs opacity-50">Pagina 125</div>
           </div>
         </a>
         <a href="/asset/Administrator GLINK.pdf#page=60" target="_blank" className="bg-emu-surface border border-emu-border hover:border-emu-highlight px-4 py-3 rounded-lg flex items-center transition-all glow-shadow">
           <FileText className="w-5 h-5 text-emu-accent mr-3 flex-shrink-0" />
           <div>
             <div className="text-sm font-medium">Config. Barcode</div>
             <div className="text-xs opacity-50">Pagina 42</div>
           </div>
         </a>
       </div>

       {/* Visualizzatore PDF integrato (visto che siamo su web) */}
       <div className="w-full h-[600px] border border-emu-border rounded-xl flex items-center justify-center bg-white/5">
         <iframe src="/asset/Administrator GLINK.pdf" className="w-full h-full" title="Administrator GLINK Guide" />
       </div>

       {/* Link di download diretto per chi preferisce leggerlo offline */}
       <a href="/asset/Administrator GLINK.pdf" download className="flex items-center gap-2 text-emu-accent hover:text-emu-highlight transition-colors mt-4">
         <ExternalLink className="w-4 h-4" /> Scarica il PDF localmente
       </a>
    </div>
  );
}
