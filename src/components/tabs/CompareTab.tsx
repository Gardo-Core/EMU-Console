"use client";
import { useState } from "react";
import { DiffViewer } from "../ui/DiffViewer";

export function CompareTab() {
  const [fileA, setFileA] = useState<string>("");
  const [fileB, setFileB] = useState<string>("");
  const [nameA, setNameA] = useState<string>("File A");
  const [nameB, setNameB] = useState<string>("File B");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isFileA: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isFileA) setNameA(file.name);
      else setNameB(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (isFileA) setFileA(text);
        else setFileB(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-4 rounded-lg flex flex-col space-y-2">
           <label className="text-sm font-medium text-emu-highlight">Upload Baseline INI</label>
           <input type="file" accept=".ini,.glinki" onChange={(e) => handleFileUpload(e, true)} className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emu-accent file:text-emu-base hover:file:bg-emu-highlight" />
        </div>
        <div className="glass-panel p-4 rounded-lg flex flex-col space-y-2">
           <label className="text-sm font-medium text-emu-highlight">Upload Modified INI</label>
           <input type="file" accept=".ini,.glinki" onChange={(e) => handleFileUpload(e, false)} className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emu-accent file:text-emu-base hover:file:bg-emu-highlight" />
        </div>
      </div>

      {(fileA || fileB) && (
        <div className="mt-4">
          <div className="flex bg-emu-surface border border-b-0 border-emu-border rounded-t-lg p-2 font-mono text-sm shadow-md">
            <div className="flex-1 opacity-70 truncate px-2">{nameA}</div>
            <div className="w-10 text-center opacity-30">vs</div>
            <div className="flex-1 opacity-70 truncate px-2">{nameB}</div>
          </div>
          <DiffViewer oldText={fileA} newText={fileB} />
        </div>
      )}
    </div>
  );
}
