"use client";

/**
 * NAVIGAZIONE TAB: LO SLIDER ARANCIONE 🟠
 * 
 * Qui gestiamo i bottoni in alto. 
 * Abbiamo usato Framer Motion per quell'effetto "bolla" che segue il click.
 * È una chicca estetica che fa sembrare l'app molto più premium.
 */
import { Settings, Palette, ScanBarcode, Split, BookOpen, Wifi, Shield } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Definizione delle schede (TABS) disponibili.
 * Ogni scheda ha un ID unico, un'etichetta parlante e un'icona tematica.
 */
export const TABS = [
  { id: "network", label: "Rete e Host", icon: Wifi },
  { id: "security", label: "Log-In", icon: Shield },
  { id: "behavior", label: "Comportamento", icon: Settings },
  { id: "appearance", label: "Aspetto", icon: Palette },
  { id: "hardware", label: "Hardware", icon: ScanBarcode },
  { id: "help", label: "Supporto", icon: BookOpen },
] as const;

export type TabId = typeof TABS[number]["id"];

/**
 * Componente di Navigazione Tab.
 * Usa Framer Motion per creare quell'effetto "bolla" arancione 
 * che segue la scheda selezionata in modo fluido.
 */
export function TabNavigation({ activeTab, onSelect }: { activeTab: TabId, onSelect: (id: TabId) => void }) {
  return (
    <div className="flex w-full space-x-1 p-1 bg-emu-surface/50 border border-emu-border rounded-xl overflow-x-auto no-scrollbar touch-pan-x">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-2.5 sm:px-3 py-2 text-[13px] font-medium rounded-lg transition-colors outline-none shrink-0 min-w-max",
              isActive ? "text-emu-base" : "text-white/70 hover:text-white hover:bg-white/5"
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Sfondo arancione animato (solo per la tab attiva) */}
            {isActive && (
              <m.span
                layoutId="bubble"
                className="absolute inset-0 z-0 bg-emu-accent rounded-lg will-change-transform"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {/* Contenuto della tab (Icona + Testo) */}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline-block">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
