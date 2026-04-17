"use client";

import { Download, Trash2, FileText, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border",
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
  );
}
