import { Edit, generateSideBySide } from './diffLogic';

/**
 * Orchestratore Diff Engine: Gestione dell'esecuzione asincrona del confronto.
 * 
 * Ruolo: Fornisce l'interfaccia di alto livello per il calcolo delle differenze,
 * delegando l'esecuzione ai Web Worker per mantenere la reattività della UI.
 */

export * from './diffLogic';

/**
 * runDiffWorker: Orchestratore asincrono per il calcolo del diff.
 * 
 * Rationale: Delega il calcolo intensivo al Web Worker per mantenere la reattività
 * dell'interfaccia utente durante il confronto di file di grandi dimensioni.
 */
export async function runDiffWorker(a: string[], b: string[]): Promise<Edit[]> {
  return new Promise((resolve) => {
    // Importante: Utilizziamo un URL statico risolvibile dal bundler per il Worker.
    const worker = new Worker(new URL('../workers/diff.worker.ts', import.meta.url));
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
    };
    worker.postMessage({ type: 'CALCULATE_DIFF', payload: { a, b } });
  });
}

/**
 * generateSideBySideEngine: Wrapper per la generazione delle mappe affiancate.
 */
export function generateSideBySideEngine(A: string[], B: string[]) {
  return generateSideBySide(A, B);
}
