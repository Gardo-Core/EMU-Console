import { validateIni } from '../lib/iniValidator';
import { mergeTemplate } from '../lib/template';
import { generateSideBySide } from '../lib/diffEngine';

/**
 * Engine Worker: Modulo di computazione asincrona.
 * 
 * Ruolo: Gestisce operazioni ad alto carico computazionale fuori dal thread principale.
 * Implementazione: Utilizza Web Workers per isolare la generazione e validazione dei template.
 * Rationale: Previene il blocco del thread principale (UI lag) durante l'elaborazione di file
 * di configurazione di grandi dimensioni.
 */
import { WorkerMessageSchema } from '../lib/schema';

addEventListener('message', async (event: MessageEvent) => {
  // Security Check: Validiamo l'origine e il formato del messaggio per prevenire iniezioni cross-origin.
  if (event.origin !== '' && event.origin !== self.location.origin) return;
  
  const validation = WorkerMessageSchema.safeParse(event.data);
  if (!validation.success) return;

  const { type, payload } = validation.data;
  const { id } = event.data; // L'id è fuori dal payload per la gestione delle promesse

  try {
    let result;

    switch (type) {
      case 'VALIDATE_INI':
        result = validateIni(payload.content);
        break;
      
      case 'MERGE_TEMPLATE':
        result = mergeTemplate(payload.baseContent, payload.values, payload.oldProfileName);
        break;
      
      case 'DIFF_INI':
        result = generateSideBySide(payload.contentA, payload.contentB);
        break;

      default:
        throw new Error(`Tipo di operazione sconosciuto: ${type}`);
    }

    // Rispediamo il risultato indicando l'ID della richiesta per permettere la promessa asincrona
    postMessage({ id, result, success: true });
  } catch (error: any) {
    postMessage({ id, error: error.message, success: false });
  }
});
