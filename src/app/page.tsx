import { AppShell } from "@/components/AppShell";

/**
 * BECCATI QUESTO: L'Entry Point dell'App! 🚀
 * 
 * Perché questo file è così vuoto? Semplice: è un React Server Component (RSC).
 * Prima era "use client", il che voleva dire che il browser doveva scaricarsi 
 * tutto il malloppone di codice subito. Un mattone.
 * 
 * Ora invece Next.js scarica solo quello che serve davvero per il primo render.
 * Tutta la "ciccia" (form, graficoni, logica) l'abbiamo spostata in AppShell.
 * Risultato? L'app carica come un proiettile. 🏎️💨
 */
export default function Home() {
  return <AppShell />;
}

