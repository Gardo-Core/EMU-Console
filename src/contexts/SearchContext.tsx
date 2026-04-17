import React, { createContext, useContext, useState, ReactNode } from "react";
import { TabId } from "@/components/TabNavigation";
import { AppMode } from "@/components/LeftNav";

/**
 * Registro dei campi ricercabili. 
 * Abbiamo bisogno di questo elenco statico perché dobbiamo sapere in quale Tab 
 * si trova un campo ancor prima di caricarlo, altrimenti non potremmo "saltare" 
 * da una scheda all'altra durante la ricerca.
 */
const FIELD_REGISTRY: { id: string; label: string; tab: TabId }[] = [
  // Scheda Rete
  { id: "profileName", label: "Nome Profilo", tab: "network" },
  { id: "hostname", label: "Hostname Server / IP", tab: "network" },
  { id: "ibm5250Model", label: "Modello IBM 5250", tab: "network" },
  { id: "licenseKey", label: "Chiave di Licenza", tab: "network" },
  { id: "e2kServer", label: "URL Server E2K", tab: "network" },
  // Scheda Sicurezza
  { id: "userId", label: "ID Utente", tab: "security" },
  { id: "useSystemUser", label: "ID di Sistema ($USER$)", tab: "security" },
  { id: "askUserId", label: "Chiedi alla Connessione", tab: "security" },
  { id: "password", label: "Password", tab: "security" },
  { id: "askPassword", label: "Chiedi alla Connessione", tab: "security" },
  { id: "enableAutoLogin", label: "Abilita Log In Automatico", tab: "security" },
  { id: "scriptName", label: "Nome File Script", tab: "security" },
  // Scheda Comportamento
  { id: "autoConnect", label: "Auto-Connessione", tab: "behavior" },
  { id: "noAutoLock", label: "Disabilita Blocco Schermo", tab: "behavior" },
  { id: "anyCmdResets", label: "Qualsiasi Tasto CMD Resetta Errore", tab: "behavior" },
  { id: "showKeyboard", label: "Modalità Mostra Tastiera", tab: "behavior" },
  { id: "orientation", label: "Orientamento Schermo", tab: "behavior" },
  { id: "cfgPassword", label: "Password Profilo", tab: "behavior" },
  // Scheda Aspetto
  { id: "fontSize", label: "Dimensione Font", tab: "appearance" },
  { id: "scrColor", label: "Sfondo", tab: "appearance" },
  { id: "stsColor", label: "Riga di Stato", tab: "appearance" },
  // Scheda Hardware
  { id: "barcodeEnable", label: "Modalità Integrazione", tab: "hardware" },
  { id: "barcodeDoAfter", label: "Azione Post-Scansione", tab: "hardware" },
  { id: "barcodeShow", label: "Feedback Visivo", tab: "hardware" },
  { id: "barcodeUseKeymap", label: "Usa Mappa Tastiera", tab: "hardware" },
  { id: "dpadLeftMacro", label: "D-Pad Sinistra (Hex)", tab: "hardware" },
  { id: "dpadRightMacro", label: "D-Pad Destra (Hex)", tab: "hardware" },
];

interface Match {
  id: string;
  tab: TabId;
}

interface SearchContextType {
  searchTerm: string; // Cosa sta cercando l'utente
  setSearchTerm: (term: string) => void;
  matches: Match[]; // Risultati trovati
  activeMatchIndex: number; // Su quale risultato siamo (il "2" di "2 su 5")
  goToNextMatch: (setActiveTab: (tab: TabId) => void, setAppMode: (mode: AppMode) => void) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * Il Provider della Ricerca gestisce lo stato globale della barra di ricerca nella TopBar.
 * Permette di coordinare il salto automatico tra le diverse tab quando l'utente preme invio.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);

  // Calcoliamo i "matches" ogni volta che il termine di ricerca cambia.
  // Usiamo useMemo così non rifacciamo il calcolo inutilmente ad ogni render.
  const matches = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const lower = searchTerm.toLowerCase();
    return FIELD_REGISTRY.filter(field => 
      field.label.toLowerCase().includes(lower) || 
      field.id.toLowerCase().includes(lower)
    ).map(m => ({ id: m.id, tab: m.tab }));
  }, [searchTerm]);

  /**
   * Questa è la funzione che "sposta" l'utente. 
   * Se premiamo Invio nella barra di ricerca, questa funzione ci porta alla tab corretta.
   */
  const goToNextMatch = (setActiveTab: (tab: TabId) => void, setAppMode: (mode: AppMode) => void) => {
    if (matches.length === 0) return;
    
    // Calcoliamo il prossimo indice (ripartendo da zero se arriviamo alla fine)
    const nextIndex = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(nextIndex);
    
    const nextMatch = matches[nextIndex];
    if (nextMatch) {
      // Ci assicuriamo di essere in modalità configuratore e non confronto
      setAppMode("configurator");
      // Cambiamo scheda
      setActiveTab(nextMatch.tab);
    }
  };

  // Resettiamo il contatore se l'utente ricomincia a scrivere da zero
  React.useEffect(() => {
    setActiveMatchIndex(-1);
  }, [searchTerm]);

  return (
    <SearchContext.Provider value={{ 
      searchTerm, 
      setSearchTerm, 
      matches, 
      activeMatchIndex, 
      goToNextMatch
    }}>
      {children}
    </SearchContext.Provider>
  );
}

// Hook personalizzato per usare la ricerca facilmente in ogni componente
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch deve essere utilizzato all'interno di un SearchProvider");
  }
  return context;
}
