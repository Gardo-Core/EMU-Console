"use client";

import { Home, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AppMode: Definisce i tre stati principali dell'applicazione.
 * - configurator: La modalità standard per creare file .ini.
 * - compare: La modalità per confrontare due file .ini esistenti.
 * - clients: Il registro clienti per gestire configurazioni .ini per cliente.
 */
export type AppMode = "configurator" | "compare" | "clients";

/**
 * Icona Clienti: 3 omini stilizzati (custom SVG).
 */
function ClientsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Persona centrale */}
      <circle cx="12" cy="7" r="2.5" />
      <path d="M7.5 20v-1.5a4.5 4.5 0 0 1 9 0V20" />
      {/* Persona sinistra */}
      <circle cx="5" cy="9" r="2" />
      <path d="M1.5 20v-1a3.5 3.5 0 0 1 4.5-3.35" />
      {/* Persona destra */}
      <circle cx="19" cy="9" r="2" />
      <path d="M22.5 20v-1a3.5 3.5 0 0 0-4.5-3.35" />
    </svg>
  );
}

/**
 * Navigazione Laterale (LeftNav): Una barra stretta e fissa a sinistra (stile moderna SaaS).
 * Contiene il logo principale e i tasti per cambiare macro-modalità.
 */
export function LeftNav({ appMode, setAppMode }: { appMode: AppMode, setAppMode: (mode: AppMode) => void }) {
  return (
    <div className="w-16 h-full bg-[#051821] border-r border-[#266867]/50 flex flex-col items-center py-1 gap-6 sticky top-0 shrink-0 z-50">

      {/* Brand Logo: L'iconica EMU arancione */}
      <div className="w-[60px] h-[60px] flex items-center justify-center mb-2">
        <img
          src="/asset/Emu_Icon.svg"
          alt="EMU"
          className="w-[60px] h-[60px] opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>

      <div className="w-8 h-px bg-[#266867]/30" />

      {/* Pulsante: Configuratore (Home) */}
      <button
        type="button"
        className={cn(
          "group relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border-l-2",
          appMode === "configurator"
            ? "border-[#F58800] bg-[#1A4645] text-[#F58800] shadow-[0_0_15px_rgba(245,136,0,0.2)]"
            : "border-transparent text-white/50 hover:bg-[#1A4645]/50 hover:text-white"
        )}
        onClick={() => setAppMode("configurator")}
      >
        <Home className="w-5 h-5" />
        <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-[#F58800] text-xs font-semibold rounded shadow-[0_0_15px_rgba(245,136,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          Configuratore
        </span>
      </button>

      {/* Pulsante: Confronto INI (Diff) */}
      <button
        type="button"
        className={cn(
          "group relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border-l-2",
          appMode === "compare"
            ? "border-[#F58800] bg-[#1A4645] text-[#F58800] shadow-[0_0_15px_rgba(245,136,0,0.2)]"
            : "border-transparent text-white/50 hover:bg-[#1A4645]/50 hover:text-white"
        )}
        onClick={() => setAppMode("compare")}
      >
        <ArrowLeftRight className="w-5 h-5" />
        <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-[#F58800] text-xs font-semibold rounded shadow-[0_0_15px_rgba(245,136,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          Confronto INI
        </span>
      </button>

      {/* Pulsante: Clienti (Registro Clienti) */}
      <button
        type="button"
        className={cn(
          "group relative w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all border-l-2",
          appMode === "clients"
            ? "border-[#F58800] bg-[#1A4645] text-[#F58800] shadow-[0_0_15px_rgba(245,136,0,0.2)]"
            : "border-transparent text-white/50 hover:bg-[#1A4645]/50 hover:text-white"
        )}
        onClick={() => setAppMode("clients")}
      >
        <ClientsIcon className="w-5 h-5" />
        <span className="absolute left-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#051821] border border-[#266867] text-[#F58800] text-xs font-semibold rounded shadow-[0_0_15px_rgba(245,136,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          Clienti
        </span>
      </button>

    </div>
  );
}
