"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Users, X } from "lucide-react";
import { useClients, Client } from "@/lib/useClients";
import { useToast } from "@/lib/useToast";
import { ClientCard } from "./ClientCard";
import { ClientDetail } from "./ClientDetail";

/**
 * ClientsView: Schermata principale del Registro Clienti.
 * Mostra la griglia di cartelle cliente o la vista dettaglio di un cliente specifico.
 */
export function ClientsView() {
  const { clients, loading, fetchClients, createClient, renameClient, softDeleteClient, restoreClient } =
    useClients();
  const { addToast } = useToast();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  /**
   * Crea un nuovo cliente.
   */
  const handleCreate = async () => {
    const trimmed = newClientName.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      await createClient(trimmed);
      await fetchClients();
      setShowCreateModal(false);
      setNewClientName("");
      addToast({ message: `Cliente "${trimmed}" creato con successo`, type: "success" });
    } catch (err: any) {
      addToast({ message: `Errore: ${err.message}`, type: "error" });
    } finally {
      setCreating(false);
    }
  };

  /**
   * Rinomina un cliente.
   */
  const handleRename = async (id: string, newName: string) => {
    try {
      await renameClient(id, newName);
      await fetchClients();
      addToast({ message: `Cliente rinominato in "${newName}"`, type: "success" });
    } catch (err: any) {
      addToast({ message: `Errore: ${err.message}`, type: "error" });
    }
  };

  /**
   * Soft-delete di un cliente con toast undo.
   */
  const handleDelete = async (id: string, name: string) => {
    try {
      await softDeleteClient(id);
      await fetchClients();

      addToast({
        message: `"${name}" eliminato`,
        type: "info",
        action: {
          label: "Ripristina",
          onClick: async () => {
            try {
              await restoreClient(id);
              await fetchClients();
              addToast({ message: `"${name}" ripristinato`, type: "success" });
            } catch {
              addToast({ message: "Errore nel ripristino", type: "error" });
            }
          },
        },
      });
    } catch (err: any) {
      addToast({ message: `Errore: ${err.message}`, type: "error" });
    }
  };

  // Se un cliente è selezionato, mostra il dettaglio
  if (selectedClient) {
    return (
      <ClientDetail
        clientId={selectedClient.id}
        clientName={selectedClient.name}
        onBack={() => {
          setSelectedClient(null);
          fetchClients(); // Refresh conteggio file
        }}
      />
    );
  }

  // Vista griglia clienti
  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Registro Clienti
          </h1>
          <p className="text-white/30 text-xs sm:text-sm mt-1">
            Gestisci le configurazioni .ini per ogni cliente
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F58800]/10 border border-[#F58800]/30 text-[#F58800] text-xs font-bold hover:bg-[#F58800] hover:text-[#051821] transition-all group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span className="hidden sm:inline">NUOVO CLIENTE</span>
          <span className="sm:hidden">NUOVO</span>
        </button>
      </div>

      {/* Contenuto */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#F58800]/40" />
          </div>
        ) : clients.length === 0 ? (
          /* Stato vuoto */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-20 h-20 rounded-2xl bg-[#1A4645]/30 border border-[#266867]/30 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-white/40 font-semibold text-lg mb-2">Nessun cliente ancora</h3>
            <p className="text-white/20 text-sm mb-6 text-center max-w-xs">
              Crea il tuo primo cliente per iniziare a organizzare le configurazioni .ini
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F58800] text-[#051821] text-sm font-bold hover:bg-[#ff9d21] transition-all shadow-[0_8px_30px_rgba(245,136,0,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Crea primo cliente
            </button>
          </motion.div>
        ) : (
          /* Griglia clienti */
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-2 pb-8"
          >
            <AnimatePresence mode="popLayout">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  id={client.id}
                  name={client.name}
                  fileCount={client.file_count ?? 0}
                  createdAt={client.created_at}
                  onClick={() => setSelectedClient(client)}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modale Creazione Cliente */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCreateModal(false);
                setNewClientName("");
              }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#051821] border border-[#F58800]/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(245,136,0,0.1)] p-6"
            >
              {/* Accento superiore */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F58800] to-[#F8BC24]" />

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Nuovo Cliente</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewClientName("");
                  }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-white/50 text-xs uppercase tracking-wider mb-2 font-semibold">
                  Nome Cliente
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                  placeholder="es. ACME Corporation"
                  autoFocus
                  className="w-full bg-[#1A4645]/30 border border-[#266867]/50 focus:border-[#F58800]/50 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-[#F58800]/30 transition-all placeholder:text-white/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewClientName("");
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newClientName.trim()}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#F58800] hover:bg-[#ff9d21] text-[#051821] text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crea Cliente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
