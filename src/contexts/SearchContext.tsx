import React, { createContext, useContext, useState, ReactNode } from "react";
import { TabId } from "@/components/TabNavigation";
import { AppMode } from "@/components/LeftNav";

// Static registry of searchable fields to support cross-tab navigation
const FIELD_REGISTRY: { id: string; label: string; tab: TabId }[] = [
  // Network
  { id: "profileName", label: "Profile Name", tab: "network" },
  { id: "hostname", label: "Server Hostname / IP", tab: "network" },
  { id: "ibm5250Model", label: "IBM 5250 Model", tab: "network" },
  { id: "licenseKey", label: "License Key", tab: "network" },
  { id: "e2kServer", label: "E2K Server URL", tab: "network" },
  // Security
  { id: "userId", label: "User ID", tab: "security" },
  { id: "useSystemUser", label: "System ID ($USER$)", tab: "security" },
  { id: "askUserId", label: "Ask at Connect", tab: "security" },
  { id: "password", label: "Password", tab: "security" },
  { id: "askPassword", label: "Ask at Connect", tab: "security" },
  { id: "enableAutoLogin", label: "Enable Auto Log In", tab: "security" },
  { id: "scriptName", label: "Script Filename", tab: "security" },
  // Behavior
  { id: "autoConnect", label: "Auto-Connect", tab: "behavior" },
  { id: "noAutoLock", label: "Disable Screen Lock", tab: "behavior" },
  { id: "anyCmdResets", label: "Any Cmd Key Resets Error", tab: "behavior" },
  { id: "showKeyboard", label: "Show Keyboard Mode", tab: "behavior" },
  { id: "orientation", label: "Screen Orientation", tab: "behavior" },
  { id: "cfgPassword", label: "Profile Password", tab: "behavior" },
  // Appearance
  { id: "fontSize", label: "Font Size", tab: "appearance" },
  { id: "scrColor", label: "Background", tab: "appearance" },
  { id: "stsColor", label: "Status Line", tab: "appearance" },
  { id: "colorMagenta", label: "Magenta", tab: "appearance" },
  { id: "colorCyan", label: "Cyan", tab: "appearance" },
  { id: "colorBlue", label: "Blue", tab: "appearance" },
  { id: "colorYellow", label: "Yellow", tab: "appearance" },
  { id: "colorWhite", label: "White", tab: "appearance" },
  { id: "colorGreen", label: "Green", tab: "appearance" },
  { id: "colorRed", label: "Red", tab: "appearance" },
  // Hardware
  { id: "barcodeEnable", label: "Integration Mode", tab: "hardware" },
  { id: "barcodeDoAfter", label: "Post-Scan Action", tab: "hardware" },
  { id: "barcodeShow", label: "Visual Feedback", tab: "hardware" },
  { id: "barcodeUseKeymap", label: "Use Keyboard Map", tab: "hardware" },
  { id: "dpadLeftMacro", label: "D-Pad Left (Hex)", tab: "hardware" },
  { id: "dpadRightMacro", label: "D-Pad Right (Hex)", tab: "hardware" },
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
