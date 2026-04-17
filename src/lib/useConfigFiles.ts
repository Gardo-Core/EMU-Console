"use client";

import { useState, useCallback } from "react";
import { supabase, FIXED_USER_ID } from "./supabase";

export type ConfigFile = {
  id: string;
  client_id: string;
  file_name: string;
  latest_version: number;
  created_at: string;
  created_by: string;
  deleted_at: string | null;
  // Joined from latest version
  file_size?: number;
  storage_path?: string;
};

export type ConfigFileVersion = {
  id: string;
  file_id: string;
  version: number;
  storage_path: string;
  file_size: number;
  mime_type: string;
  checksum: string;
  uploaded_by: string;
  created_at: string;
};

/**
 * Calcola il SHA-256 checksum di un File usando crypto.subtle (nativo browser).
 */
async function computeChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hook per le operazioni sui file di configurazione .ini.
 * Gestisce upload atomico con cleanup, download, preview e soft-delete.
 */
export function useConfigFiles() {
  const [files, setFiles] = useState<ConfigFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("config_files")
        .select("*")
        .eq("client_id", clientId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Per ogni file, recuperiamo info della latest version
      const filesWithMeta: ConfigFile[] = [];
      for (const f of data || []) {
        const { data: versionData } = await supabase
          .from("config_file_versions")
          .select("file_size, storage_path")
          .eq("file_id", f.id)
          .eq("version", f.latest_version)
          .is("deleted_at", null)
          .single();

        filesWithMeta.push({
          ...f,
          file_size: versionData?.file_size ?? 0,
          storage_path: versionData?.storage_path ?? "",
        });
      }

      setFiles(filesWithMeta);
    } catch (err: any) {
      setError(err.message || "Errore nel caricamento dei file");
      console.error("fetchFiles error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload atomico di un file .ini con logica di cleanup per prevenire file orfani.
   */
  const uploadFile = useCallback(
    async (clientId: string, file: File) => {
      // 1. Calcolo checksum
      const checksum = await computeChecksum(file);

      // 2. Check se esiste già un record per questo filename e questo client (anche se eliminato)
      const { data: existingFile } = await supabase
        .from("config_files")
        .select("id, latest_version, deleted_at")
        .eq("client_id", clientId)
        .eq("file_name", file.name)
        .single();

      let fileId: string;
      let newVersion: number;

      if (existingFile) {
        fileId = existingFile.id;
        newVersion = existingFile.latest_version + 1;

        // Se il file era eliminato, lo "ripristiniamo" durante l'update
        const { error: updateError } = await supabase
          .from("config_files")
          .update({ 
            latest_version: newVersion,
            deleted_at: null // Lo riattiviamo se era soft-deleted
          })
          .eq("id", fileId);

        if (updateError) throw updateError;

        // 3. Check duplicato checksum vs ultima versione
        const { data: latestVersion } = await supabase
          .from("config_file_versions")
          .select("checksum")
          .eq("file_id", fileId)
          .eq("version", existingFile.latest_version)
          .single();

        if (latestVersion?.checksum === checksum) {
          throw new Error(
            "Il file è identico all'ultima versione caricata. Upload annullato."
          );
        }
      } else {
        newVersion = 1;
        // Creiamo il record config_files
        const { data: newFile, error: insertFileError } = await supabase
          .from("config_files")
          .insert({
            client_id: clientId,
            file_name: file.name,
            latest_version: 1,
            created_by: FIXED_USER_ID,
          })
          .select()
          .single();

        if (insertFileError) throw insertFileError;
        fileId = newFile.id;
      }

      // Path di storage
      const storagePath = `${clientId}/${fileId}/v${newVersion}.ini`;
      let uploadedPath: string | null = null;

      try {
        // 4. Upload su Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("configs")
          .upload(storagePath, file, {
            contentType: "text/plain",
            upsert: false,
          });

        if (storageError) throw storageError;
        uploadedPath = storagePath;

        // 5. Insert nel record version
        const { error: versionError } = await supabase
          .from("config_file_versions")
          .insert({
            file_id: fileId,
            version: newVersion,
            storage_path: storagePath,
            file_size: file.size,
            mime_type: "text/plain",
            checksum,
            uploaded_by: FIXED_USER_ID,
          });

        if (versionError) throw versionError;

        // 6. Update latest_version nel config_files (solo se è una nuova versione)
        if (existingFile) {
          const { error: updateError } = await supabase
            .from("config_files")
            .update({ latest_version: newVersion })
            .eq("id", fileId);

          if (updateError) throw updateError;
        }
      } catch (err) {
        // CLEANUP: se il DB fallisce dopo che il file è stato uploadato,
        // rimuoviamo il file orfano dallo storage
        if (uploadedPath) {
          await supabase.storage.from("configs").remove([uploadedPath]);
        }
        throw err;
      }
    },
    []
  );

  /**
   * Download di un file .ini via signed URL.
   */
  const downloadFile = useCallback(
    async (storagePath: string, fileName: string) => {
      const { data, error: downloadError } = await supabase.storage
        .from("configs")
        .download(storagePath);

      if (downloadError) throw downloadError;

      // Trigger del download nel browser
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    []
  );

  /**
   * Preview: scarica il contenuto testuale del file .ini.
   */
  const previewFile = useCallback(
    async (storagePath: string): Promise<string> => {
      const { data, error: downloadError } = await supabase.storage
        .from("configs")
        .download(storagePath);

      if (downloadError) throw downloadError;
      return await data.text();
    },
    []
  );

  const softDeleteFile = useCallback(async (fileId: string) => {
    const { error: deleteError } = await supabase
      .from("config_files")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", fileId);

    if (deleteError) throw deleteError;
  }, []);

  const restoreFile = useCallback(async (fileId: string) => {
    const { error: restoreError } = await supabase
      .from("config_files")
      .update({ deleted_at: null })
      .eq("id", fileId);

    if (restoreError) throw restoreError;
  }, []);

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    downloadFile,
    previewFile,
    softDeleteFile,
    restoreFile,
  };
}
