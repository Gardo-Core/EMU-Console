import React, { createContext, useContext, useState, ReactNode } from "react";
import { TabId } from "@/components/TabNavigation";
import { AppMode } from "@/components/LeftNav";

// Registro statico dei campi ricercabili per supportare la navigazione cross-tab
const FIELD_REGISTRY: { id: string; label: string; tab: TabId }[] = [
  // Rete
  { id: "profileName", label: "Nome Profilo", tab: "network" },
  { id: "hostname", label: "Hostname Server / IP", tab: "network" },
  { id: "ibm5250Model", label: "Modello IBM 5250", tab: "network" },
  { id: "licenseKey", label: "Chiave di Licenza", tab: "network" },
  { id: "e2kServer", label: "URL Server E2K", tab: "network" },
  // Sicurezza
  { id: "userId", label: "ID Utente", tab: "security" },
  { id: "useSystemUser", label: "ID di Sistema ($USER$)", tab: "security" },
  { id: "askUserId", label: "Chiedi alla Connessione", tab: "security" },
  { id: "password", label: "Password", tab: "security" },
  { id: "askPassword", label: "Chiedi alla Connessione", tab: "security" },
  { id: "enableAutoLogin", label: "Abilita Log In Automatico", tab: "security" },
  { id: "scriptName", label: "Nome File Script", tab: "security" },
  // Comportamento
  { id: "autoConnect", label: "Auto-Connessione", tab: "behavior" },
  { id: "noAutoLock", label: "Disabilita Blocco Schermo", tab: "behavior" },
  { id: "anyCmdResets", label: "Qualsiasi Tasto CMD Resetta Errore", tab: "behavior" },
  { id: "showKeyboard", label: "Modalità Mostra Tastiera", tab: "behavior" },
  { id: "orientation", label: "Orientamento Schermo", tab: "behavior" },
  { id: "cfgPassword", label: "Password Profilo", tab: "behavior" },
  // Aspetto
  { id: "fontSize", label: "Dimensione Font", tab: "appearance" },
  { id: "scrColor", label: "Sfondo", tab: "appearance" },
  { id: "stsColor", label: "Riga di Stato", tab: "appearance" },
  // Hardware
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
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  matches: Match[];
  activeMatchIndex: number;
  goToNextMatch: (setActiveTab: (tab: TabId) => void, setAppMode: (mode: AppMode) => void) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(-1);

  // Derive matches from the static registry and current search term
  const matches = React.useMemo(() => {
    if (!searchTerm || searchTerm.length < 1) return [];
    const lower = searchTerm.toLowerCase();
    return FIELD_REGISTRY.filter(field => 
      field.label.toLowerCase().includes(lower) || 
      field.id.toLowerCase().includes(lower)
    ).map(m => ({ id: m.id, tab: m.tab }));
  }, [searchTerm]);

  const goToNextMatch = (setActiveTab: (tab: TabId) => void, setAppMode: (mode: AppMode) => void) => {
    if (matches.length === 0) return;
    
    const nextIndex = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(nextIndex);
    
    const nextMatch = matches[nextIndex];
    if (nextMatch) {
      setAppMode("configurator");
      setActiveTab(nextMatch.tab);
    }
  };

  // Reset indices when search term changes
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

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
