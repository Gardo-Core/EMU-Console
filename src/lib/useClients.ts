"use client";

import { useState, useCallback } from "react";
import { supabase, FIXED_USER_ID } from "./supabase";

export type Client = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  deleted_at: string | null;
  file_count?: number;
};

/**
 * Hook per le operazioni CRUD sui Clienti.
 * Tutte le query filtrano `deleted_at IS NULL` (soft-delete).
 */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch clients non-deleted
      const { data, error: fetchError } = await supabase
        .from("clients")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Per ogni client, contiamo i file attivi
      const clientsWithCount: Client[] = [];
      for (const client of data || []) {
        const { count } = await supabase
          .from("config_files")
          .select("*", { count: "exact", head: true })
          .eq("client_id", client.id)
          .is("deleted_at", null);

        clientsWithCount.push({
          ...client,
          file_count: count ?? 0,
        });
      }

      setClients(clientsWithCount);
    } catch (err: any) {
      setError(err.message || "Errore nel caricamento dei clienti");
      console.error("fetchClients error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (name: string) => {
    const { data, error: insertError } = await supabase
      .from("clients")
      .insert({ name, created_by: FIXED_USER_ID })
      .select()
      .single();

    if (insertError) throw insertError;
    return data as Client;
  }, []);

  const renameClient = useCallback(async (id: string, name: string) => {
    const { error: updateError } = await supabase
      .from("clients")
      .update({ name })
      .eq("id", id);

    if (updateError) throw updateError;
  }, []);

  const softDeleteClient = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from("clients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) throw deleteError;
  }, []);

  const restoreClient = useCallback(async (id: string) => {
    const { error: restoreError } = await supabase
      .from("clients")
      .update({ deleted_at: null })
      .eq("id", id);

    if (restoreError) throw restoreError;
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    renameClient,
    softDeleteClient,
    restoreClient,
  };
}
