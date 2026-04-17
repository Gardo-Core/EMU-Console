import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * User ID fittizio — Opzione A.
 * Dato che l'autenticazione è gestita dal LoginGate locale (password hardcoded),
 * usiamo un UUID fisso per i campi created_by / uploaded_by nel database.
 * In futuro, se si integra Supabase Auth, basterà sostituire questa costante
 * con l'ID dell'utente autenticato.
 */
export const FIXED_USER_ID = "00000000-0000-0000-0000-000000000001";
