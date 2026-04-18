/**
 * Diff Engine Worker: Calcolo differenziale asincrono.
 * 
 * Ruolo: Esecuzione dell'algoritmo di diffing fuori dal thread principale.
 * Implementazione: Tenta il caricamento del modulo WebAssembly (Rust) per massime prestazioni
 * con ripiego (fallback) sulla versione TypeScript in caso di indisponibilità.
 */

import { myersDiff, fuzzyMatch, Edit } from '../lib/diffLogic';

/**
 * Diff Worker: Thread dedicato per il calcolo delle differenze.
 * 
 * Ruolo: Esegue il confronto tra due sequenze di stringhe in background.
 * Implementazione: Utilizza l'algoritmo di Myers implementato in diffLogic.
 * Rationale: Isola gli algoritmi ad alta intensita' di calcolo per prevenire
 * il congelamento del thread principale (UI).
 */

let wasmModule: any = null;

// Tentativo di caricamento dinamico del modulo WASM
async function loadWasm() {
  try {
    // In un ambiente di produzione con webpack configurato, questo caricherebbe il .wasm
    // @ts-ignore
    const wasm = await import('../../wasm-engine/pkg/wasm_engine');
    wasmModule = wasm;
    console.log("WASM Diff Engine Loaded Successfully");
  } catch (e) {
    console.warn("WASM Diff Engine not found, falling back to TypeScript implementation");
  }
}

loadWasm();

import { WorkerMessageSchema } from '../lib/schema';

onmessage = async (e: MessageEvent) => {
  const result = WorkerMessageSchema.safeParse(e.data);
  if (!result.success) return;

  const { a, b } = result.data.payload;
  
  let results: Edit[];

  if (wasmModule && wasmModule.calculate_ast_diff) {
    // Esecuzione tramite WebAssembly (Rust)
    const jsonResult = wasmModule.calculate_ast_diff(JSON.stringify(a), JSON.stringify(b));
    results = JSON.parse(jsonResult);
  } else {
    // Esecuzione tramite TypeScript (Fallback)
    results = fuzzyMatch(myersDiff(a, b));
  }

  postMessage(results);
};
