"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoginGate: Un semplice "cancello" di sicurezza all'ingresso dell'app.
 * Serve a proteggere le configurazioni aziendali da accessi non autorizzati.
 * Salva lo stato in sessionStorage per non chiedere la password ad ogni refresh,
 * ma la richiede se si chiude il browser/tab.
 */
export default function LoginGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verifichiamo se l'utente è già loggato in questa sessione
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("emu_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Gestore del login locale (password Hardcoded per semplicità in questa versione)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "EMUADMIN") {
      sessionStorage.setItem("emu_auth", "true");
      setIsAuthenticated(true);
    } else {
      setError(true);
      // Animazione di errore temporaneo
      setTimeout(() => setError(false), 2000);
    }
  };

  // Evitiamo problemi di idratazione (Hydration mismatch) in Next.js
  if (!mounted) return null;

  // Se siamo autenticati, mostriamo l'applicazione
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Altrimenti mostriamo la schermata di login "premium"
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-emu-base z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden"
      >
        {/* Barra di accento superiore */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emu-accent to-emu-highlight" />
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emu-surface rounded-full shadow-inner border border-emu-border">
            <Lock className="w-8 h-8 text-emu-accent" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-white glow-text">EMU Console</h2>
        <p className="text-emu-highlight/80 text-center mb-8 text-sm">Accesso Limitato</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Inserire Password"
              className={cn(
                "w-full bg-emu-base/50 border rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                error ? "border-emu-highlight focus:ring-emu-highlight" : "border-emu-border focus:ring-emu-accent glow-shadow"
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-emu-highlight/50 hover:text-emu-accent transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
            {/* Messaggio di errore con animazione di entrata/uscita */}
            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="text-emu-highlight text-sm mt-2 font-medium"
                >
                  Password errata
                </motion.p>
              )}
            </AnimatePresence>
          <button 
            type="submit"
            className="w-full bg-emu-accent hover:bg-emu-highlight text-emu-base font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            Autenticazione <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
