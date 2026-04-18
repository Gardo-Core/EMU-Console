/**
 * Sync Worker: Gestore della sincronizzazione asincrona resiliente.
 * 
 * Ruolo: Sincronizzazione bidirezionale tra PGlite (Locale) e Supabase (Remoto).
 * Implementazione:
 * - Exponential Backoff: Gestione adattiva degli errori di rete.
 * - Differential Pull: Recupero incrementale basato su timestamp.
 * - LWW (Last-Writer-Wins): Risoluzione dei conflitti basata su metadata temporali.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "../lib/db";
import { WorkerMessageSchema, SyncConfigSchema } from "../lib/schema";

interface ConfigRow {
  profile_name: string;
  config_data: any;
  updated_at: string;
  synced: boolean;
}

let supabase: SupabaseClient | null = null;
let lastSyncAt: string | null = null;
let retryCount = 0;
const MAX_BACKOFF = 60000; // Massimo 1 minuto tra tentativi

/**
 * Validazione e inizializzazione tramite postMessage
 */
onmessage = (e) => {
  const result = WorkerMessageSchema.safeParse(e.data);
  if (!result.success) return;

  const { type, payload } = result.data;

  if (type === 'INIT_SYNC') {
    const config = SyncConfigSchema.safeParse(payload);
    if (!config.success) return;

    supabase = createClient(config.data.supabaseUrl, config.data.supabaseKey);
    lastSyncAt = config.data.lastSyncAt || new Date(0).toISOString();
    
    console.log("Sync Worker Initialized");
    syncLoop();
  }
};

async function syncLoop() {
  if (!supabase) return;

  // Resilienza di Rete: navigator.onLine è un primo check, ma non garantisce reachable
  if (!navigator.onLine) {
    scheduleNext(5000);
    return;
  }

  try {
    const db = await getDb();

    // 1. PUSH: Cambiamenti locali -> Supabase
    const result = await db.query(`
      SELECT * FROM configurations WHERE synced = FALSE;
    `);
    const unsynced = result.rows as unknown as ConfigRow[];

    for (const row of unsynced) {
      const { error } = await supabase
        .from('configurations')
        .upsert({
          profile_name: row.profile_name,
          config_data: row.config_data,
          updated_at: row.updated_at
        });

      if (!error) {
        await db.query(`
          UPDATE configurations SET synced = TRUE WHERE profile_name = $1;
        `, [row.profile_name]);
      } else {
        throw error; // Trigger backoff mechanism
      }
    }

    // 2. DIFFERENTIAL PULL + LWW: Supabase -> PGlite
    const { data: remoteData, error: pullError } = await supabase
      .from('configurations')
      .select('*')
      .gt('updated_at', lastSyncAt || new Date(0).toISOString())
      .order('updated_at', { ascending: true });

    if (pullError) throw pullError;

    if (remoteData && remoteData.length > 0) {
      for (const remote of remoteData) {
        // LWW: UPDATE solo se il timestamp remoto è maggiore di quello locale
        await db.query(`
          INSERT INTO configurations (profile_name, config_data, updated_at, synced)
          VALUES ($1, $2, $3, TRUE)
          ON CONFLICT (profile_name) 
          DO UPDATE SET 
            config_data = EXCLUDED.config_data, 
            updated_at = EXCLUDED.updated_at,
            synced = TRUE
          WHERE configurations.updated_at < EXCLUDED.updated_at;
        `, [remote.profile_name, JSON.stringify(remote.config_data), remote.updated_at]);
        
        // Aggiorniamo il cursore di sincronizzazione
        if (!lastSyncAt || new Date(remote.updated_at) > new Date(lastSyncAt)) {
          lastSyncAt = remote.updated_at;
        }
      }
    }

    // Reset backoff in caso di successo
    retryCount = 0;
    scheduleNext(10000); // Check ogni 10 secondi in condizioni normali

  } catch (err) {
    console.error("Sync error:", err);
    retryCount++;
    const backoff = Math.min(Math.pow(2, retryCount) * 1000, MAX_BACKOFF);
    console.warn(`Retrying in ${backoff}ms (Attempt ${retryCount}) ⏳`);
    scheduleNext(backoff);
  }
}

function scheduleNext(delay: number) {
  setTimeout(syncLoop, delay);
}
