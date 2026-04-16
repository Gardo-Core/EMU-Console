"use client";

import { useState, useRef, ChangeEvent } from "react";
import { UploadCloud, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSideBySide } from "@/lib/diffEngine";

type DiffLine = {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  text: string;
};

type FileState = {
  name: string | null;
  text: string | null;
  lines: DiffLine[];
};

export function CompareView() {
  const [file1, setFile1] = useState<FileState>({ name: null, text: null, lines: [] });
  const [file2, setFile2] = useState<FileState>({ name: null, text: null, lines: [] });

  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);

  const handleScroll = (source: 1 | 2) => {
    // Sincronizza lo scroll tra i riquadri
    if (source === 1 && scrollRef1.current && scrollRef2.current) {
      scrollRef2.current.scrollTop = scrollRef1.current.scrollTop;
    } else if (source === 2 && scrollRef1.current && scrollRef2.current) {
      scrollRef1.current.scrollTop = scrollRef2.current.scrollTop;
    }
  };

  const handleFileUpload = (file: File, target: 1 | 2) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (target === 1) {
        setFile1(prev => ({ ...prev, name: file.name, text }));
        if (file2.text) computeDiff(text, file2.text);
        else setFile1(prev => ({ ...prev, lines: text.split('\n').map(t => ({ type: 'unchanged', text: t })) }));
      } else {
        setFile2(prev => ({ ...prev, name: file.name, text }));
        if (file1.text) computeDiff(file1.text, text);
        else setFile2(prev => ({ ...prev, lines: text.split('\n').map(t => ({ type: 'unchanged', text: t })) }));
      }
    };
    reader.readAsText(file);
  };

  const computeDiff = (t1: string, t2: string) => {
    const lines1 = t1.split(/\r?\n/);
    const lines2 = t2.split(/\r?\n/);

    // Use the robust diff engine for sequence alignment and sync padding
    const { map1, map2 } = generateSideBySide(lines1, lines2);

    setFile1(prev => ({ ...prev, lines: map1 }));
    setFile2(prev => ({ ...prev, lines: map2 }));
  };

  return (
    <div className="grid grid-cols-2 h-full gap-4 p-4 lg:p-8">

      {/* Riquadro 1 */}
      <div className="flex flex-col h-full bg-[#1A4645]/20 backdrop-blur-md border border-[#266867]/50 rounded-xl overflow-hidden">
        <div className="h-12 bg-[#1A4645]/50 border-b border-[#266867] flex items-center px-4 font-mono text-sm shrink-0">
          <FileJson className="w-4 h-4 mr-2 text-emu-highlight" />
          <span className="text-white/80">{file1.name || "Carica File 1"}</span>
        </div>

        {!file1.text ? (
          <label className="flex-1 m-4 border-2 border-dashed border-[#266867] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#1A4645]/20 transition-colors">
            <UploadCloud className="w-10 h-10 text-emu-highlight/50 mb-4" />
            <span className="text-white/60 font-medium font-sans">Trascina il file .ini di base</span>
            <input type="file" accept=".ini,.glinki,text/plain" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 1)} />
          </label>
        ) : (
          <div ref={scrollRef1} onScroll={() => handleScroll(1)} className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[#051821]/50 font-mono text-xs sm:text-sm">
            {file1.lines.map((line, idx) => (
              <div key={idx} className={cn(
                "px-4 py-0.5 whitespace-pre border-l-2",
                line.type === 'unchanged' && "opacity-50 border-transparent",
                line.type === 'removed' && "bg-red-500/20 border-red-500/50 text-red-200",
                line.type === 'modified' && "bg-[#F8BC24]/20 border-[#F8BC24]/50 text-white",
                line.type === 'added' && "border-transparent opacity-0" // Riempimento vuoto
              )}>
                <span className="inline-block w-8 text-white/30 select-none border-r border-[#266867]/30 mr-4">{idx + 1}</span>
                {line.text || " "}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riquadro 2 */}
      <div className="flex flex-col h-full bg-[#1A4645]/20 backdrop-blur-md border border-[#266867]/50 rounded-xl overflow-hidden">
        <div className="h-12 bg-[#1A4645]/50 border-b border-[#266867] flex items-center px-4 font-mono text-sm shrink-0">
          <FileJson className="w-4 h-4 mr-2 text-emu-highlight" />
          <span className="text-white/80">{file2.name || "Carica File 2"}</span>
        </div>

        {!file2.text ? (
          <label className="flex-1 m-4 border-2 border-dashed border-[#266867] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[#1A4645]/20 transition-colors">
            <UploadCloud className="w-10 h-10 text-emu-highlight/50 mb-4" />
            <span className="text-white/60 font-medium font-sans">Trascina il file .ini di destinazione</span>
            <input type="file" accept=".ini,.glinki,text/plain" className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], 2)} />
          </label>
        ) : (
          <div ref={scrollRef2} onScroll={() => handleScroll(2)} className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-[#051821]/50 font-mono text-xs sm:text-sm">
            {file2.lines.map((line, idx) => (
              <div key={idx} className={cn(
                "px-4 py-0.5 whitespace-pre border-l-2",
                line.type === 'unchanged' && "opacity-50 border-transparent",
                line.type === 'added' && "bg-[#F58800]/20 border-[#F58800]/50 text-[#F58800]",
                line.type === 'modified' && "bg-[#F8BC24]/20 border-[#F8BC24]/50 text-white",
                line.type === 'removed' && "border-transparent opacity-0" // Riempimento vuoto
              )}>
                <span className="inline-block w-8 text-white/30 select-none border-r border-[#266867]/30 mr-4">{idx + 1}</span>
                {line.text || " "}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
