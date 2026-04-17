import { validationMetadata } from './schema';

/**
 * Questa interfaccia definisce la struttura di un errore riscontrato durante la validazione dell'INI.
 * Ci serve per dare feedback precisi all'utente nella vista "INI Grezzo".
 */
export interface IniError {
  line: number;
  message: string;
  advice?: string; // Consiglio dell'amministratore (es. "Usa solo IP statici")
  ref?: string;    // Riferimento alla documentazione manuale
  key?: string;
  isWarning?: boolean;
}

/**
 * Funzione principale per validare il contenuto di un file INI.
 * Scansiona il file riga per riga e cerca discrepanze rispetto ai metadati di validazione.
 */
export function validateIni(content: string): IniError[] {
  const lines = content.split(/\r?\n/);
  const errors: IniError[] = [];
  
  let currentFile: string | null = null;
  let currentSection: string | null = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Saltiamo righe vuote o commenti
    if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#')) return;

    // Rileva sezioni speciali che indicano l'inizio di un sotto-file distribuito
    if (trimmed.startsWith('[file:')) {
      currentFile = trimmed;
      currentSection = null;
      return;
    }

    // Rileva sezioni standard dell'INI (es. [MioProfilo])
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed;
      return;
    }

    // Analizziamo le coppie chiave=valore
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      
      // Se la chiave è censita nei nostri metadati di validazione, facciamo dei controlli seri
      if (validationMetadata[key]) {
        const metadata = validationMetadata[key];
        
        // Controllo specifico per l'hostname: niente spazi!
        if (key === 'hostname' && value.includes(' ')) {
          errors.push({
            line: index + 1,
            message: "Gli indirizzi host non possono contenere spazi.",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
        
        // Controllo per i colori: devono essere in formato esadecimale standard
        if (key.includes('Color') && !value.match(/^#[0-9a-fA-F]{6}$/)) {
          errors.push({
            line: index + 1,
            message: "Formato colore hex non valido (es. #FF00FF).",
            advice: metadata.advice,
            ref: metadata.ref,
            key
          });
        }
      }
    } else if (!trimmed.startsWith('[') && trimmed.length > 0) {
       // Se troviamo del testo che non è né una sezione né un'assegnazione, 
       // probabilmente l'utente ha fatto un pasticcio digitando.
       // Eccezione: la sezione v_key che contiene la licenza "nuda" nella riga successiva.
       if (currentFile === '[file:v_key]') {
          // Tutto okay, qui la licenza non ha il "chiave="
       } else {
         errors.push({
            line: index + 1,
            message: "Riga malformata: prevista chiave=valore o [sezione].",
            isWarning: true
          });
       }
    }
  });

  return errors;
}

/**
 * Questa è una funzione "magica" che converte una stringa INI grezza 
 * negli oggetti (Record) che il nostro Form (react-hook-form) può capire.
 * Gestisce anche la decostruzione di stringhe complesse come quella del server.
 */
export function parseIniToValues(content: string): Record<string, any> {
  const lines = content.split(/\r?\n/);
  const values: Record<string, any> = {};
  
  // Mappa di conversione tra le chiavi tecniche dell'INI e i nomi dei campi nel Form UI
  const keyMap: Record<string, string> = {
    'com.ibm5250model': 'ibm5250Model',
    'screen.autoconnect': 'autoConnect',
    'screen.noautolock': 'noAutoLock',
    'screen.showkeyboard': 'showKeyboard',
    'screen.orientation': 'orientation',
    'screen.fontsize': 'fontSize',
    'screen.scrcolor': 'scrColor',
    'screen.stscolor': 'stsColor',
    'print.bcenable': 'barcodeEnable',
    'print.bcdoafter': 'barcodeDoAfter',
    'print.bcshow': 'barcodeShow',
    'print.bcusekeymap': 'barcodeUseKeymap',
    'emu.anycmdresets': 'anyCmdResets',
    'keyboard.kc.4_DpadLeft': 'dpadLeftMacro',
    'keyboard.kc.5_DpadRight': 'dpadRightMacro',
    'E2KServer': 'e2kServer',
    'config.profile': 'profileName' 
  };

  let currentFile: string | null = null;

  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Teniamo traccia di quale "file" virtuale stiamo leggendo
    if (trimmed.startsWith('[file:')) {
      currentFile = trimmed;
      return;
    }

    // Cerchiamo di indovinare il nome del profilo dalle intestazioni delle sezioni
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.startsWith('[file:')) {
      const sectionName = trimmed.substring(1, trimmed.length - 1);
      // Evitiamo di usare i nomi delle sezioni di sistema come nome profilo
      if (sectionName !== 'file:v_key' && sectionName !== 'printers' && sectionName !== 'keyboards') {
        values['profileName'] = sectionName;
      }
      return;
    }

    // Caso speciale: la chiave di licenza in v_key è su una riga da sola
    if (currentFile === '[file:v_key]' && !trimmed.includes('=') && trimmed.length > 5) {
      values['licenseKey'] = trimmed;
      return;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0 && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
      const iniKey = trimmed.substring(0, eqIdx).trim();
      let iniValue = trimmed.substring(eqIdx + 1).trim();
      
      // LOGICA CRITICA: com.servername è un "minestrone" di hostname, utente e password.
      // Dobbiamo smontarlo usando delle RegEx per popolare i campi corretti della UI.
      if (iniKey === 'com.servername') {
        // Esempio tipico: ASP.BLUSYS.IT -du USER -d? PASS /S autologin.scrgl
        const hostnameMatch = iniValue.match(/^([^ -]+)/);
        if (hostnameMatch) values['hostname'] = hostnameMatch[1];

        // Cerchiamo l'utente (-du)
        const userMatch = iniValue.match(/-du ([^ ]+)/);
        if (userMatch) {
          if (userMatch[1] === '*') {
            values['askUserId'] = true;
            values['userId'] = '';
          } else {
            values['askUserId'] = false;
            values['userId'] = userMatch[1];
          }
        }

        // Cerchiamo la password (-d?)
        const passMatch = iniValue.match(/-d\? ([^ ]+)/);
        if (passMatch) {
          if (passMatch[1] === '*') {
            values['askPassword'] = true;
            values['password'] = '';
          } else {
            values['askPassword'] = false;
            values['password'] = passMatch[1]; 
          }
        }

        // Cerchiamo se c'è uno script di autologin associato (/S)
        const scriptMatch = iniValue.match(/\/S ([^ ]+)/);
        if (scriptMatch) {
          values['enableAutoLogin'] = true;
          values['scriptName'] = scriptMatch[1];
        } else {
          values['enableAutoLogin'] = false;
        }
        return;
      }

      // Mappiamo la chiave INI al nome del campo usato internamente nel Form
      const formKey = keyMap[iniKey] || iniKey;
      
      // Cerchiamo di convertire i valori in Booleani o Numeri se possibile, 
      // altrimenti react-hook-form si arrabbia perché si aspetta tipi specifici.
      let finalValue: any = iniValue;
      if (iniValue.toLowerCase() === 'true') finalValue = true;
      else if (iniValue.toLowerCase() === 'false') finalValue = false;
      else if (!isNaN(Number(iniValue)) && iniValue !== '' && !iniValue.startsWith('0x')) {
        finalValue = Number(iniValue);
      }
      
      values[formKey] = finalValue;
    }
  });
  
  return values;
}
