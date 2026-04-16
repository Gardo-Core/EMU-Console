"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("emu_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "EMUADMIN") {
      sessionStorage.setItem("emu_auth", "true");
      setIsAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (!mounted) return null;

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-emu-base z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emu-accent to-emu-highlight" />
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-emu-surface rounded-full shadow-inner border border-emu-border">
            <Lock className="w-8 h-8 text-emu-accent" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-white glow-text">EMU Console</h2>
        <p className="text-emu-highlight/80 text-center mb-8 text-sm">Restricted Access</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password" 
              placeholder="Enter Password"
              className={cn(
                "w-full bg-emu-base/50 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                error ? "border-emu-highlight focus:ring-emu-highlight" : "border-emu-border focus:ring-emu-accent glow-shadow"
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }} 
                  className="text-emu-highlight text-sm mt-2 font-medium"
                >
                  Incorrect password
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <button 
            type="submit"
            className="w-full bg-emu-accent hover:bg-emu-highlight text-emu-base font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
          >
            Authenticate <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
