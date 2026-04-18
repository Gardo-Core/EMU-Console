"use client";

import { useEffect, useRef, useCallback } from 'react';

/**
 * IL PONTE RADIO CON IL WORKER 📡
 * 
 * Questo hook serve a parlare con il nostro Worker senza impazzire.
 * Invece di gestire a mano gli eventi di "message", qui usiamo le Promises.
 * 
 * Come funziona? Mandi un task con un ID a caso, aspetti la risposta, 
 * e l'hook ti ridà il risultato. Se il Worker esplode, l'hook ti dà l'errore.
 * È così comodo che sembra barare. 😎
 */
export function useWorker() {
  const workerRef = useRef<Worker | null>(null);
  const requestsRef = useRef<Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>>(new Map());

  useEffect(() => {
    // Inizializziamo il worker
    const worker = new Worker(new URL('../workers/engine.worker.ts', import.meta.url));
    
    worker.onmessage = (event) => {
      const { id, result, error, success } = event.data;
      const request = requestsRef.current.get(id);
      
      if (request) {
        if (success) {
          request.resolve(result);
        } else {
          request.reject(new Error(error));
        }
        requestsRef.current.delete(id);
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  const runTask = useCallback((type: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker non inizializzato o terminato."));
        return;
      }

      const id = Math.random().toString(36).substring(7);
      requestsRef.current.set(id, { resolve, reject });
      
      workerRef.current.postMessage({ type, payload, id });
    });
  }, []);

  return { runTask };
}
