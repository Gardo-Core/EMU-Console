"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, FileText, Eye, History, GitCommit, GitBranch, Share2, Loader2, RotateCcw, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useConfigFiles, ConfigFileVersion } from "@/lib/useConfigFiles";

type FileRowProps = {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  isSelected: boolean;
  onSelect: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

/**
 * Formatta i byte in una stringa leggibile (KB, MB, etc.).
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * FileRow: Riga singola per un file .ini nella lista del client detail.
 * Click → seleziona per preview, azioni di download ed eliminazione.
 */
export function FileRow({
  id,
  fileName,
  fileSize,
  createdAt,
  isSelected,
  onSelect,
  onDownload,
  onDelete,
}: FileRowProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { fetchFileHistory, downloadFile } = useConfigFiles();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [historyFiles, setHistoryFiles] = useState<ConfigFileVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isHistoryExpanded && historyFiles.length === 0) {
      setLoadingHistory(true);
      fetchFileHistory(id)
        .then((data) => {
          setHistoryFiles(data);
          setLoadingHistory(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingHistory(false);
        });
    }
  }, [isHistoryExpanded, id, fetchFileHistory, historyFiles.length]);

  return (
    <div className="group relative hover:z-[60]">
      <div
        onClick={onSelect}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border",
          isSelected
            ? "bg-[#F58800]/10 border-[#F58800]/30 shadow-[0_0_15px_rgba(245,136,0,0.08)]"
            : "bg-transparent border-transparent hover:bg-[#1A4645]/40 hover:border-[#266867]/30"
        )}
      >
      {/* Icona file */}
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          isSelected
            ? "bg-[#F58800]/20 text-[#F58800]"
            : "bg-[#1A4645]/50 text-white/40 group-hover:text-white/60"
        )}
      >
        <FileText className="w-4 h-4" />
      </div>

      {/* Nome file e metadata */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate transition-colors",
            isSelected ? "text-[#F58800]" : "text-white/80"
          )}
        >
          {fileName}
        </p>
        <p className="text-[11px] text-white/30 mt-0.5">
          {formatSize(fileSize)} • {formattedDate}
        </p>
      </div>

      {/* Preview indicator su mobile */}
      {isSelected && (
        <Eye className="w-3.5 h-3.5 text-[#F58800]/50 lg:hidden" />
      )}

      {/* Azioni (always visible on mobile, hover on desktop) */}
      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload();
          }}
          className="p-1.5 rounded-lg text-white/40 hover:text-[#F8BC24] hover:bg-[#F8BC24]/10 transition-all group/btn relative"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-[#F8BC24] text-[10px] font-semibold rounded shadow-[0_0_15px_rgba(248,188,36,0.1)] opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap z-[100]">
            Scarica
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsHistoryExpanded(!isHistoryExpanded);
          }}
          className={cn(
            "p-1.5 rounded-lg transition-all group/btn relative",
            isHistoryExpanded 
              ? "text-emu-accent bg-emu-accent/10" 
              : "text-white/40 hover:text-emu-highlight hover:bg-emu-highlight/10"
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-emu-highlight text-[10px] font-semibold rounded shadow-[0_0_15px_rgba(245,136,0,0.1)] opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap z-[100]">
            Storico Versioni
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all group/btn relative"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-red-400 text-[10px] font-semibold rounded shadow-[0_0_15px_rgba(248,113,113,0.1)] opacity-0 invisible group-hover/btn:opacity-100 group-hover/btn:visible transition-all whitespace-nowrap z-[100]">
            Elimina
          </span>
        </button>
      </div>
    </div>

    {/* ACCORDION DELLA TIMELINE (STORICO VERSIONI) */}
    <AnimatePresence>
      {isHistoryExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="pl-14 pr-4 py-4 space-y-4 border-l border-[#266867]/20 ml-6 mt-1 mb-2">
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Caricamento storico...
              </div>
            ) : historyFiles.length === 0 ? (
              <div className="text-white/40 text-xs">Nessuna versione precedente.</div>
            ) : (
              historyFiles.map((v, index) => {
                const isLatest = index === 0;
                const vDate = new Date(v.created_at).toLocaleString("it-IT", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                });

                return (
                  <div key={v.id} className="relative pl-6">
                    {/* Linea verticale e nodo Timeline */}
                    <div className="absolute left-[3px] top-4 bottom-[-16px] w-[1px] bg-[#266867]/30 last:hidden" />
                    <div className={cn(
                      "absolute left-0 top-1.5 w-2 h-2 rounded-full ring-2 ring-[#051821] z-10",
                      isLatest ? "bg-emu-highlight ring-emu-highlight/30" : "bg-white/30"
                    )} />

                    <div className="flex items-start justify-between group/version">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn("font-bold", isLatest ? "text-emu-highlight" : "text-white/60")}>
                            v{v.version}
                          </span>
                          <span className="text-white/30 truncate">• {vDate}</span>
                          {isLatest && <span className="bg-emu-accent/20 text-emu-accent text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold">Attuale</span>}
                        </div>
                        <p className={cn(
                          "mt-1 text-sm font-medium",
                          isLatest ? "text-white/90" : "text-white/70"
                        )}>
                          {v.commit_message || (isLatest ? "Versione corrente" : "Aggiornamento file")}
                        </p>
                      </div>

                      {/* Azioni del singolo nodo (visibili in hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover/version:opacity-100 transition-opacity">
                        <button
                          onClick={() => downloadFile(v.storage_path, `v${v.version}_${fileName}`)}
                          className="p-1.5 text-white/40 hover:text-emu-highlight hover:bg-emu-highlight/10 rounded-lg transition-all group/vbtn relative"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-[#051821] border border-emu-border/40 text-emu-highlight text-[10px] font-semibold rounded shadow-[0_0_15px_rgba(245,136,0,0.1)] opacity-0 invisible group-hover/vbtn:opacity-100 group-hover/vbtn:visible transition-all whitespace-nowrap z-[100]">
                            Scarica Versione
                          </span>
                        </button>
                        
                        {!isLatest && (
                          <>
                            {/* Diff disabled: future feature placeholder */}
                            <button
                              disabled
                              className="p-1.5 text-white/20 rounded-lg transition-colors cursor-not-allowed group/vbtn relative"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-[#051821] border border-white/10 text-white/40 text-[10px] font-semibold rounded opacity-0 invisible group-hover/vbtn:opacity-100 group-hover/vbtn:visible transition-all whitespace-nowrap z-[100]">
                                Confronta (Soon)
                              </span>
                            </button>
                            {/* Revert disabled: future feature placeholder */}
                            <button
                              disabled
                              className="p-1.5 text-white/20 rounded-lg transition-colors cursor-not-allowed group/vbtn relative"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1.5 bg-[#051821] border border-white/10 text-white/40 text-[10px] font-semibold rounded opacity-0 invisible group-hover/vbtn:opacity-100 group-hover/vbtn:visible transition-all whitespace-nowrap z-[100]">
                                Ripristina (Soon)
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
