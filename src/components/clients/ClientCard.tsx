"use client";

import { motion } from "framer-motion";
import { FolderOpen, MoreVertical, Pencil, Trash2, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type ClientCardProps = {
  id: string;
  name: string;
  fileCount: number;
  createdAt: string;
  onClick: () => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string, name: string) => void;
};

/**
 * ClientCard: Card singola nella griglia dei clienti.
 * Estetica ispirata a Google Drive con glassmorphism del progetto EMU.
 */
export function ClientCard({ id, name, fileCount, createdAt, onClick, onRename, onDelete }: ClientCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Formatta la data in formato italino leggibile
  const formattedDate = new Date(createdAt).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Chiudi il menu se click fuori
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Focus sull'input quando si entra in modalità rename
  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== name) {
      onRename(id, trimmed);
    } else {
      setRenameValue(name);
    }
    setIsRenaming(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="group relative bg-[#1A4645]/30 backdrop-blur-md border border-[#266867]/40 rounded-2xl p-5 cursor-pointer transition-all hover:border-[#F58800]/40 hover:shadow-[0_8px_30px_rgba(245,136,0,0.1)] hover:bg-[#1A4645]/50"
      onClick={() => {
        if (!isRenaming && !menuOpen) onClick();
      }}
    >
      {/* Menu contestuale (3 dots) */}
      <div className="absolute top-3 right-3 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute right-0 top-full mt-1 w-40 bg-[#0a2a2a] border border-[#266867]/60 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setIsRenaming(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:bg-[#1A4645]/60 hover:text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Rinomina
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(id, name);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Elimina
            </button>
          </motion.div>
        )}
      </div>

      {/* Icona Cartella */}
      <div className="w-12 h-12 rounded-xl bg-[#F58800]/10 border border-[#F58800]/20 flex items-center justify-center mb-4 group-hover:bg-[#F58800]/20 group-hover:border-[#F58800]/30 transition-all">
        <FolderOpen className="w-6 h-6 text-[#F58800]" />
      </div>

      {/* Nome Cliente (o campo rename) */}
      {isRenaming ? (
        <input
          ref={inputRef}
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") {
              setRenameValue(name);
              setIsRenaming(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-[#051821] border border-[#F58800]/50 rounded-lg px-2 py-1 text-white text-sm font-semibold outline-none focus:ring-1 focus:ring-[#F58800]/50 mb-2"
        />
      ) : (
        <h3 className="text-white font-semibold text-sm truncate mb-2 pr-8">{name}</h3>
      )}

      {/* Meta: file count + data */}
      <div className="flex items-center gap-3 text-[11px] text-white/40">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {fileCount} {fileCount === 1 ? "file" : "file"}
        </span>
        <span>•</span>
        <span>{formattedDate}</span>
      </div>
    </motion.div>
  );
}
