"use client";

import { FileText, ExternalLink } from "lucide-react";

export function HelpTab() {
  return (
    <div className="space-y-6 flex flex-col items-center">
       <h2 className="text-2xl font-bold glow-text mb-2">Administrator Guide</h2>
       <p className="text-white/70 max-w-lg text-center mb-6">
         The official Gallagher & Robertson documentation is embedded below. You can navigate directly to key sections or download a copy.
       </p>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
         <a href="/asset/Administrator GLINK.pdf#page=94" target="_blank" className="bg-emu-surface border border-emu-border hover:border-emu-highlight px-4 py-3 rounded-lg flex items-center transition-all glow-shadow">
           <FileText className="w-5 h-5 text-emu-accent mr-3 flex-shrink-0" />
           <div>
             <div className="text-sm font-medium">TN5250 Models</div>
             <div className="text-xs opacity-50">Page 94</div>
           </div>
         </a>
         <a href="/asset/Administrator GLINK.pdf#page=125" target="_blank" className="bg-emu-surface border border-emu-border hover:border-emu-highlight px-4 py-3 rounded-lg flex items-center transition-all glow-shadow">
           <FileText className="w-5 h-5 text-emu-accent mr-3 flex-shrink-0" />
           <div>
             <div className="text-sm font-medium">SSL Options</div>
             <div className="text-xs opacity-50">Page 125</div>
           </div>
         </a>
         <a href="/asset/Administrator GLINK.pdf#page=42" target="_blank" className="bg-emu-surface border border-emu-border hover:border-emu-highlight px-4 py-3 rounded-lg flex items-center transition-all glow-shadow">
           <FileText className="w-5 h-5 text-emu-accent mr-3 flex-shrink-0" />
           <div>
             <div className="text-sm font-medium">Barcode Config</div>
             <div className="text-xs opacity-50">Page 42</div>
           </div>
         </a>
       </div>

       <div className="w-full h-[600px] border border-emu-border rounded-xl flex items-center justify-center bg-white/5">
         <iframe src="/asset/Administrator GLINK.pdf" className="w-full h-full" title="Administrator GLINK Guide" />
       </div>

       <a href="/asset/Administrator GLINK.pdf" download className="flex items-center gap-2 text-emu-accent hover:text-emu-highlight transition-colors mt-4">
         <ExternalLink className="w-4 h-4" /> Download PDF locally
       </a>
    </div>
  );
}
