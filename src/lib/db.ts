import { PGlite } from "@electric-sql/pglite";

/**
 * Database Layer: PGlite (WASM Postgres).
 * 
 * Ruolo: Gestore del database locale per architetture Local-First.
 * Implementazione: Utilizza PGlite con persistenza su IndexedDB e un pattern Singleton.
 * Rationale: Garantisce la persistenza dei dati e la disponibilità offline, eliminando la latenza di rete
 * durante le operazioni di scrittura frequenti.
 */

let dbInstance: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;
const queryQueue: Array<() => void> = [];

/**
 * Singleton pattern con Connection Queue per la gestione dell'inizializzazione asincrona.
 */
export async function getDb(): Promise<PGlite> {
  if (dbInstance) return dbInstance;

  if (!initPromise) {
    initPromise = (async () => {
      const db = new PGlite("idb://emu-console-db");
      
      await db.exec(`
        CREATE TABLE IF NOT EXISTS configurations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_name TEXT NOT NULL,
          config_data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          synced BOOLEAN DEFAULT FALSE
        );
      `);
      
      dbInstance = db;
      // Svuotiamo la coda appena pronti
      while (queryQueue.length > 0) {
        const nextQuery = queryQueue.shift();
        if (nextQuery) nextQuery();
      }
      
      return db;
    })();
  }

  return initPromise;
}

/**
 * Esegue un'operazione garantendo che il DB sia pronto.
 */
async function withDb<T>(operation: (db: PGlite) => Promise<T>): Promise<T> {
  const db = await getDb();
  return operation(db);
}

/**
 * Salva una configurazione localmente (Last-Writer-Wins).
 */
export async function saveConfigLocal(profileName: string, data: any) {
  return withDb(async (localDb) => {
    await localDb.query(`
      INSERT INTO configurations (profile_name, config_data, updated_at, synced)
      VALUES ($1, $2, CURRENT_TIMESTAMP, FALSE)
      ON CONFLICT (profile_name) 
      DO UPDATE SET 
        config_data = EXCLUDED.config_data,
        updated_at = EXCLUDED.updated_at,
        synced = FALSE;
    `, [profileName, JSON.stringify(data)]);
  });
}
