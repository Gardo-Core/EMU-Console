"use server";

import { createClient } from "@supabase/supabase-js";
import { ConfigFormValues } from "@/lib/schema";

/**
 * SERVER ACTION: SAVE CONFIG 💾
 * 
 * Questa action gestisce il salvataggio dei dati su Supabase.
 * Essendo marchiata "use server", viene eseguita direttamente sul backend. 
 */
export async function saveConfigAction(config: ConfigFormValues) {
  // Simuliamo una latenza di rete per testare l'Optimistic UI
  await new Promise(resolve => setTimeout(resolve, 2000));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Se mancano le chiavi, simuliamo un salvataggio andato a buon fine (per dev locale)
    console.log("Mock Save to Supabase:", config);
    return { success: true };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('configurations')
    .upsert({ 
      profile_name: config.profileName,
      config_data: config,
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) {
    throw new Error(`Errore Supabase: ${error.message}`);
  }

  return { success: true, data };
}
