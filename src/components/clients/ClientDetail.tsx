"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, UploadCloud, Loader2 } from "lucide-react";
import { useConfigFiles, ConfigFile } from "@/lib/useConfigFiles";
import { useToast } from "@/lib/useToast";
import { FileRow } from "./FileRow";
import { IniPreview } from "./IniPreview";

type ClientDetailProps = {
  clientId: string;
  clientName: string;
  onBack: () => void;
};

/**
 * ClientDetail: Vista interna di un singolo cliente.
 * Layout split-pane su desktop: file list a sinistra, preview a destra.
 * Su mobile: solo file list.
 */
export function ClientDetail({ clientId, clientName, onBack }: ClientDetailProps) {
  const { files, loading, fetchFiles, uploadFile, downloadFile, previewFile, softDeleteFile, restoreFile } =
    useConfigFiles();
  const { addToast } = useToast();

  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Stati per il Commit Dialog
  const [pendingUploadFiles, setPendingUploadFiles] = useState<FileList | null>(null);
  const [commitMessage, setCommitMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles(clientId);
  }, [clientId, fetchFiles]);

  /**
   * Gestisce il click su un file per mostrare il preview.
   */
  const handleFileSelect = useCallback(
    async (file: ConfigFile) => {
      if (selectedFileId === file.id) {
        // Deseleziona
        setSelectedFileId(null);
        setPreviewContent(null);
        return;
      }

      setSelectedFileId(file.id);
      setPreviewFileName(file.file_name);

      if (!file.storage_path) return;

      setPreviewLoading(true);
      try {
        const content = await previewFile(file.storage_path);
        setPreviewContent(content);
      } catch (err: any) {
        addToast({
          message: `Errore nel caricamento dell'anteprima: ${err.message}`,
          type: "error",
        });
        setPreviewContent(null);
      } finally {
        setPreviewLoading(false);
      }
    },
    [selectedFileId, previewFile, addToast]
  );

  /**
   * Upload handler - Intercetta l'evento e apre il modale
   */
  const handleUploadIntent = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setPendingUploadFiles(fileList);
    setCommitMessage(""); // resetta il messaggio
  }, []);

  /**
   * Esegue l'upload effettivo dopo aver confermato il commit message
   */
  const executeUpload = useCallback(
    async () => {
      if (!pendingUploadFiles) return;

      setUploading(true);
      let uploadedCount = 0;

      for (const file of Array.from(pendingUploadFiles)) {
        if (!file.name.endsWith(".ini")) {
          addToast({
            message: `"${file.name}" non è un file .ini — ignorato`,
            type: "error",
          });
          continue;
        }

        try {
          // Passiamo il commit message al motore di upload
          await uploadFile(clientId, file, commitMessage || "Aggiornamento manuale file");
          uploadedCount++;
        } catch (err: any) {
          addToast({
            message: `Errore upload "${file.name}": ${err.message}`,
            type: "error",
          });
        }
      }

      if (uploadedCount > 0) {
        addToast({
          message: `${uploadedCount} file aggiornato/i con il messaggio: "${commitMessage}"`,
          type: "success",
        });
        await fetchFiles(clientId);
      }

      setUploading(false);
      setPendingUploadFiles(null);
    },
    [clientId, uploadFile, fetchFiles, addToast, pendingUploadFiles, commitMessage]
  );

  /**
   * Download handler.
   */
  const handleDownload = useCallback(
    async (file: ConfigFile) => {
      if (!file.storage_path) return;
      try {
        await downloadFile(file.storage_path, file.file_name);
      } catch (err: any) {
        addToast({
          message: `Errore download: ${err.message}`,
          type: "error",
        });
      }
    },
    [downloadFile, addToast]
  );

  const [fileToDelete, setFileToDelete] = useState<ConfigFile | null>(null);

  /**
   * Conferma eliminazione (Apre il modale "A prova di scimmia")
   */
  const handleDelete = useCallback((file: ConfigFile) => {
    setFileToDelete(file);
  }, []);

  /**
   * Esegue l'eliminazione dopo la conferma dal modale
   */
  const executeDelete = useCallback(
    async () => {
      if (!fileToDelete) return;
      const file = fileToDelete;
      setFileToDelete(null); // Chiude il modale immediatamente

      try {
        await softDeleteFile(file.id);
        await fetchFiles(clientId);

        // Chiudi preview se il file eliminato era selezionato
        if (selectedFileId === file.id) {
          setSelectedFileId(null);
          setPreviewContent(null);
        }

        addToast({
          message: `"${file.file_name}" eliminato definitivamente.`,
          type: "success",
        });
      } catch (err: any) {
        addToast({ message: `Errore eliminazione: ${err.message}`, type: "error" });
      }
    },
    [fileToDelete, softDeleteFile, fetchFiles, clientId, selectedFileId, addToast]
  );

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUploadIntent(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header con breadcrumb e bottone upload */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#266867]/30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-[#1A4645]/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-white/30 uppercase tracking-wider mb-0.5">
              <span className="hover:text-white/50 cursor-pointer transition-colors" onClick={onBack}>
                Clienti
              </span>
              <span>›</span>
              <span className="text-[#F58800]/60">{clientName}</span>
            </div>
            <h2 className="text-white font-bold text-lg leading-tight">{clientName}</h2>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F58800]/10 border border-[#F58800]/30 text-[#F58800] text-xs font-bold hover:bg-[#F58800] hover:text-[#051821] transition-all disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          CARICA .INI
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".ini"
          multiple
          className="hidden"
          onChange={(e) => {
            handleUploadIntent(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Area principale: split pane */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        {/* Lista file (sinistra) */}
        <div
          className="flex-1 lg:max-w-[50%] flex flex-col min-h-0 overflow-y-auto custom-scrollbar p-4"
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#F58800]/50" />
            </div>
          ) : files.length === 0 ? (
            /* Stato vuoto con drop zone */
            <label
              className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive
                  ? "border-[#F58800] bg-[#F58800]/5"
                  : "border-[#266867]/40 hover:border-[#266867] hover:bg-[#1A4645]/20"
              }`}
            >
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${dragActive ? "text-[#F58800]" : "text-[#266867]"}`} />
              <span className="text-white/50 font-medium text-sm mb-1">
                Trascina i file .ini qui
              </span>
              <span className="text-white/25 text-xs">
                oppure clicca per selezionare
              </span>
              <input
                type="file"
                accept=".ini"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleUploadIntent(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          ) : (
            <div className="space-y-1">
              {/* Drop zone attiva in overlay */}
              <AnimatePresence>
                {dragActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-[#051821]/80 backdrop-blur-sm flex items-center justify-center"
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <div className="border-2 border-dashed border-[#F58800] rounded-3xl p-12 flex flex-col items-center">
                      <UploadCloud className="w-16 h-16 text-[#F58800] mb-4" />
                      <span className="text-[#F58800] font-bold text-lg">Rilascia per caricare</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {files.map((file) => (
                <FileRow
                  key={file.id}
                  id={file.id}
                  fileName={file.file_name}
                  fileSize={file.file_size ?? 0}
                  createdAt={file.created_at}
                  isSelected={selectedFileId === file.id}
                  onSelect={() => handleFileSelect(file)}
                  onDownload={() => handleDownload(file)}
                  onDelete={() => handleDelete(file)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview panel (solo desktop lg:+) */}
        <div className="hidden lg:flex lg:flex-1 min-h-0 p-4 pl-0">
          <AnimatePresence mode="wait">
            {previewLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex items-center justify-center border border-[#266867]/30 rounded-2xl bg-[#051821]/50"
              >
                <Loader2 className="w-6 h-6 animate-spin text-[#F58800]/50" />
              </motion.div>
            ) : previewContent !== null && selectedFileId ? (
              <div className="flex-1" key={selectedFileId}>
                <IniPreview
                  fileName={previewFileName}
                  content={previewContent}
                  onClose={() => {
                    setSelectedFileId(null);
                    setPreviewContent(null);
                  }}
                />
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center border border-[#266867]/20 border-dashed rounded-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1A4645]/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white/20 text-sm font-medium">Seleziona un file per l&apos;anteprima</p>
                <p className="text-white/10 text-xs mt-1">Click su un file .ini nella lista</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MOBILE PREVIEW OVERLAY */}
      <AnimatePresence>
        {previewContent !== null && selectedFileId && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[150] lg:hidden bg-[#051821] flex flex-col"
          >
            <div className="flex-1 p-4 h-full overflow-hidden">
              <IniPreview
                fileName={previewFileName}
                content={previewContent}
                onClose={() => {
                  setSelectedFileId(null);
                  setPreviewContent(null);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALE DI CONFERMA ELIMINAZIONE FILE */}
      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFileToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#051821] border border-red-500/30 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(239,68,68,0.15)] p-6"
            >
              {/* Accento rosso superiore */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-400" />

              <div className="flex items-start gap-4 mb-6 mt-2">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight mb-2">Eliminare questo file?</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Stai per eliminare definitivamente <strong className="text-white">"{fileToDelete.file_name}"</strong>. Questa azione è irreversibile e il file non potrà essere recuperato. Sei assolutamente sicuro?
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Sì, elimina file
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE DI COMMIT (Versioning) */}
      <AnimatePresence>
        {pendingUploadFiles && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !uploading && setPendingUploadFiles(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#051821] border border-[#F58800]/30 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(245,136,0,0.15)] flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F58800] to-emu-highlight" />
              
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#F58800]/10 rounded-xl text-[#F58800]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white glow-text">Aggiornamento in corso...</h3>
                    <p className="text-white/50 text-sm">Stai per caricare {pendingUploadFiles.length} file .ini</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label className="block text-[#F58800] text-sm font-semibold mb-2">Messaggio di Commit (Obbligatorio)</label>
                <textarea
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Es: Modificato timeout rete per il magazzino 3..."
                  rows={3}
                  className="w-full bg-[#051821]/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F58800] focus:ring-1 focus:ring-[#F58800] transition-all resize-none shadow-inner"
                  autoFocus
                />
                <p className="text-white/30 text-xs mt-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Il messaggio salverà questa modifica nello storico. Ti aiuterà se dovrai fare un ripristino in futuro.
                </p>
              </div>

              <div className="p-6 bg-white/5 flex items-center gap-3 border-t border-white/5">
                <button
                  onClick={() => setPendingUploadFiles(null)}
                  disabled={uploading}
                  className="flex-1 py-3 px-4 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  onClick={executeUpload}
                  disabled={commitMessage.trim().length === 0 || uploading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emu-accent to-emu-highlight hover:brightness-110 text-[#051821] text-sm font-bold transition-all shadow-[0_0_20px_rgba(245,136,0,0.3)] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salva Versione"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
