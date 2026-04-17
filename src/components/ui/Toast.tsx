"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/lib/useToast";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const borderColorMap = {
  success: "border-emerald-500/40",
  error: "border-red-500/40",
  info: "border-emu-highlight/40",
};

const iconColorMap = {
  success: "text-emerald-400",
  error: "text-red-400",
  info: "text-emu-highlight",
};

/**
 * ToastContainer: Renderizza tutte le notifiche toast attive.
 * Posizionato fisso in basso a destra. Supporta azione "Ripristina" per undo.
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`pointer-events-auto bg-[#1A4645]/80 backdrop-blur-xl border ${borderColorMap[toast.type]} rounded-xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-start gap-3`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColorMap[toast.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-snug">{toast.message}</p>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action!.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-1.5 text-xs font-bold text-emu-accent hover:text-emu-highlight transition-colors uppercase tracking-wider"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/30 hover:text-white transition-colors shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
