"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Portal: Il Trasportatore di UI 🌀 
 * 
 * Prende i suoi figli e li "teletrasporta" alla base del documento (document.body).
 * Questo è fondamentale per menu a tendina e tooltip perché:
 * 1. Risolve il clipping (non vengono più tagliati da header o card).
 * 2. Risolve il blur (il browser vede lo sfondo senza ostacoli).
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
